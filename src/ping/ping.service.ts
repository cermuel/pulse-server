import {
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { PingParams } from 'src/dto/ping.dto';
import { PingEntity } from 'src/entities/ping.entity';
import { PulseEntity } from 'src/entities/pulse.entity';
import { UserEntity } from 'src/entities/user.entity';
import { FlairService } from 'src/flair/flair.service';
import { PulseGateway } from 'src/pulse/pulse.gateway';
import {
  Between,
  FindOperator,
  LessThanOrEqual,
  MoreThanOrEqual,
  Repository,
} from 'typeorm';

@Injectable()
export class PingService {
  constructor(
    @InjectRepository(PingEntity)
    private readonly pingRepo: Repository<PingEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(PulseEntity)
    private readonly pulseRepo: Repository<PulseEntity>,
    private readonly flairService: FlairService,
    @Inject(forwardRef(() => PulseGateway))
    private readonly pulseGateway: PulseGateway,
  ) {}
  async create(id: string) {
    const pulse = await this.pulseRepo.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!pulse) return;
    if (!pulse.isActive) return;

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

    const user = await this.userRepo.findOne({
      where: { id: pulse.userId },
      relations: { notification: true },
    });

    await this.pingRepo.save(ping);
    await this.pulseRepo.update({ id }, { lastCheckedAt: new Date() });
    if (user?.notification.inAppPing) {
      this.pulseGateway.sendPing(pulse.userId, ping);
    }
    {
      console.log(`User not subscribed to in app pings`);
    }

    if (isUp) {
      await this.flairService.handlePulseRecovery(pulse, user);
    } else {
      await this.flairService.handlePulseDown(
        pulse,
        error || 'Flair incident',
        user,
      );
    }
  }

  async checkParams(
    req: Request,
    params: PingParams,
  ): Promise<FindOperator<Date> | undefined> {
    const user = req.user as UserEntity;
    if (
      (params.startDate ||
        params.endDate ||
        params.period == '7 days' ||
        params.period == '28 days' ||
        params.period == '365 days') &&
      user.plan == 'free'
    )
      throw new ForbiddenException('Upgrade your plan to access this feature');

    let startDate: Date | undefined;
    let endDate: Date | undefined;

    if (params.startDate || params.endDate) {
      startDate = params.startDate ? new Date(params.startDate) : undefined;
      endDate = params.endDate ? new Date(params.endDate) : undefined;
    } else {
      endDate = new Date();

      switch (params.period) {
        case '24 hours':
          startDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
          break;
        case '7 days':
          startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '28 days':
          startDate = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
          break;
        case '365 days':
          startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
          break;
        case '4 hours':
        default:
          startDate = new Date(Date.now() - 4 * 60 * 60 * 1000);
          break;
      }
    }

    let createdAtFilter: FindOperator<Date> | undefined = undefined;

    if (startDate && endDate) {
      createdAtFilter = Between(startDate, endDate);
    } else if (startDate) {
      createdAtFilter = MoreThanOrEqual(startDate);
    } else if (endDate) {
      createdAtFilter = LessThanOrEqual(endDate);
    }
    return createdAtFilter;
  }

  async getResponseTimes(pulseId: string, req: Request, params: PingParams) {
    const pulse = await this.pulseRepo.findOne({ where: { id: pulseId } });
    if (!pulse) throw new NotFoundException('No pings found for this pulse');

    const createdAtFilter = await this.checkParams(req, params);

    const times = await this.pingRepo.find({
      where: {
        pulseId: pulse.id,
        ...(createdAtFilter && { createdAt: createdAtFilter }),
      },
      select: { responseTime: true, createdAt: true },
      order: { createdAt: 'ASC' },
    });

    return { message: 'Response time fetched successfully', times };
  }

  async getUpTimes(pulseId: string, req: Request, params: PingParams) {
    const pulse = await this.pulseRepo.findOne({ where: { id: pulseId } });
    if (!pulse) throw new NotFoundException('No pings found for this pulse');

    const createdAtFilter = await this.checkParams(req, params);

    const times = await this.pingRepo.find({
      where: {
        pulseId: pulse.id,
        ...(createdAtFilter && { createdAt: createdAtFilter }),
      },
      select: { isUp: true, createdAt: true },
      order: {
        createdAt: 'ASC',
      },
    });

    return { message: 'Uptimes fetched successfully', times };
  }
}
