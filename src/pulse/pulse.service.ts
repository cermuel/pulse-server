import { InjectQueue } from '@nestjs/bullmq';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Queue } from 'bullmq';
import { Request } from 'express';
import { PAGE_SIZE } from 'src/constants';
import {
  CreatePulseDTO,
  EditPulseDTO,
  GetPulsesParams,
} from 'src/dto/pulse.dto';
import { PulseEntity } from 'src/entities/pulse.entity';
import { UserEntity } from 'src/entities/user.entity';
import { generateShortCode } from 'src/utils/helpers';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class PulseService {
  constructor(
    @InjectRepository(PulseEntity)
    private readonly pulseRepo: Repository<PulseEntity>,
    @InjectQueue('check-pulse')
    private readonly pulseQueue: Queue,
  ) {}

  async createPulse(dto: CreatePulseDTO, req: Request) {
    const user = req.user as UserEntity;

    if (dto.publicId) {
      const publicIdExists = await this.pulseRepo.findOne({
        where: { publicId: dto.publicId },
      });

      if (publicIdExists)
        throw new BadRequestException('Public ID already exists');
    }

    const pulseExists = await this.pulseRepo.findOne({
      where: {
        url: dto.url,
        userId: user.id,
      },
    });

    if (pulseExists) return pulseExists;

    if (dto.interval && user.plan == 'free' && dto.interval < 300)
      throw new BadRequestException(
        'Interval below 5 minutes is only available to PRO users',
      );

    let pulse = this.pulseRepo.create({
      userId: user.id,
      publicId: dto.publicId || generateShortCode(`${user.id}${dto.url}`),
      url: dto.url,
      expectedStatus: dto.expectedStatus,
      interval: dto.interval,
      name: dto.name,
      method: dto.method,
    });

    pulse = await this.pulseRepo.save(pulse);

    await this.pulseQueue.add(
      'check-pulse',
      { pulseId: pulse.id },
      {
        jobId: `pulse-immediate-${pulse.id}`,
        removeOnComplete: true,
        removeOnFail: true,
        backoff: { type: 'exponential', delay: 2000 },
      },
    );

    await this.pulseQueue
      .add(
        'check-pulse',
        { pulseId: pulse.id },
        {
          jobId: `pulse-repeat-${pulse.id}`,
          repeat: { every: pulse.interval * 1000 },
          backoff: { type: 'exponential', delay: 2000 },
        },
      )
      .then(() => console.log(`Pulse with ID: ${pulse.id} added to queue`));

    return {
      message: 'Pulse created successfully',
      pulse,
    };
  }

  async editPulse(id: string, dto: EditPulseDTO, req: Request) {
    const user = req.user as UserEntity;

    let pulse = await this.pulseRepo.findOne({
      where: { userId: user.id, id },
    });
    if (!pulse) throw new NotFoundException('Pulse not found');

    let oldInterval = pulse?.interval;

    await this.pulseRepo.update(
      { userId: user.id, id },
      {
        ...dto,
      },
    );

    pulse = await this.pulseRepo.findOne({ where: { userId: user.id, id } });

    if (dto.interval && oldInterval && pulse && dto.interval !== oldInterval) {
      await this.pulseQueue.removeJobScheduler(pulse.id);
      await this.pulseQueue.add(
        'check-pulse',
        { pulseId: pulse.id },
        { jobId: pulse.id, repeat: { every: dto.interval * 1000 } },
      );
    }

    return { message: 'Pulse updated successfully', pulse };
  }

  async pausePulse(id: string) {
    let pulse = await this.pulseRepo.findOne({
      where: { id, isActive: true },
    });
    if (!pulse)
      throw new NotFoundException('Pulse not found or is already paused');

    await this.pulseRepo.update({ id: pulse.id }, { isActive: false });
    await this.pulseQueue.removeJobScheduler(pulse.id);

    return { message: 'Pulse paused successfully', pulse };
  }

  async resumePulse(id: string) {
    let pulse = await this.pulseRepo.findOne({
      where: { id, isActive: false },
    });
    if (!pulse)
      throw new NotFoundException('Pulse not found or is already active');

    await this.pulseRepo.update({ id: pulse.id }, { isActive: true });
    await this.pulseQueue.add(
      'check-pulse',
      { pulseId: pulse.id },
      { jobId: pulse.id, repeat: { every: pulse.interval * 1000 } },
    );
    return { message: 'Pulse resumed successfully', pulse };
  }

  async getUserPulses(req: Request, params: GetPulsesParams) {
    const user = req.user as UserEntity;

    const limit = params?.per_page || PAGE_SIZE;
    const query = params?.query || '';
    const page = params?.page || 1;
    const skip = limit * (page - 1);

    const [pulses, total] = await this.pulseRepo.findAndCount({
      where: [
        { userId: user.id, name: ILike(`%${query}%`) },
        { userId: user.id, url: ILike(`%${query}%`) },
      ],
      skip,
      take: limit,
    });

    return {
      message: 'Pulses fetched successfully',
      pulses,
      total,
      page,
      per_page: limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getPulse(req: Request, id: string) {
    const user = req.user as UserEntity;
    const pulse = await this.pulseRepo.findOne({
      where: { id, userId: user.id },
      relations: ['pings', 'flairs'],
    });

    if (!pulse) throw new NotFoundException('Pulse not found');

    return {
      message: 'Pulses fetched successfully',
      pulse,
    };
  }

  async checkPublicId(id: string) {
    const pulse = await this.pulseRepo.findOne({
      where: { publicId: id },
    });

    return {
      message: 'Code checked successfully',
      codeAvailable: !pulse,
    };
  }

  async deletePulse(id: string, req: Request) {
    const user = req.user as UserEntity;
    const pulse = await this.pulseRepo.findOne({
      where: { id, userId: user.id },
    });
    if (!pulse) throw new NotFoundException('Pulse not found');

    await this.pulseQueue.removeJobScheduler(pulse.id);
    await this.pulseRepo.delete({ id, userId: user.id });

    return { message: 'Pulse deleted successfully' };
  }
}
