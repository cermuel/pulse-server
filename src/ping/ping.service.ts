import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PingEntity } from 'src/entities/ping.entity';
import { PulseEntity } from 'src/entities/pulse.entity';
import { FlairService } from 'src/flair/flair.service';
import { Repository } from 'typeorm';

@Injectable()
export class PingService {
  constructor(
    @InjectRepository(PingEntity)
    private readonly pingRepo: Repository<PingEntity>,
    @InjectRepository(PulseEntity)
    private readonly pulseRepo: Repository<PulseEntity>,
    private readonly flairService: FlairService,
  ) {}
  async create(id: string) {
    const pulse = await this.pulseRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!pulse) return;
    const start = Date.now();
    let isUp = false;
    let statusCode: number | undefined = undefined;
    let error: string | undefined = undefined;

    try {
      const response = await fetch(pulse.url, {
        method: pulse.method,
        signal: AbortSignal.timeout(5000),
      });
      statusCode = response.status;
      isUp = statusCode === (pulse.expectedStatus ?? 200);
    } catch (err) {
      isUp = false;
      error = err.message;
    }

    const responseTime = Date.now() - start;

    let ping = this.pingRepo.create({
      pulseId: id,
      error,
      statusCode,
      responseTime,
      isUp,
    });

    await this.pingRepo.save(ping);
    await this.pulseRepo.update({ id }, { lastCheckedAt: new Date() });

    if (isUp) {
      await this.flairService.handlePulseRecovery(pulse);
    } else {
      await this.flairService.handlePulseDown(pulse, error || 'Flair incident');
    }
  }
}
