import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Request } from 'express';
import { PAGE_SIZE } from 'src/constants';
import { GetPulsesParams } from 'src/dto/pulse.dto';
import { FlairEntity } from 'src/entities/flair.entity';
import { PulseEntity } from 'src/entities/pulse.entity';
import { UserEntity } from 'src/entities/user.entity';
import { LogService } from 'src/log/log.service';
import { MailService } from 'src/mail/mail.service';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class FlairService {
  constructor(
    @InjectRepository(FlairEntity)
    private readonly flairRepo: Repository<FlairEntity>,
    private readonly logService: LogService,
    private readonly mailService: MailService,
  ) {}

  async handlePulseDown(pulse: PulseEntity, error: string) {
    let flair = await this.flairRepo.findOne({
      where: { pulseId: pulse.id, isResolved: false },
    });

    if (!flair) {
      const newFlair = this.flairRepo.create({
        pulseId: pulse.id,
        userId: pulse.userId,
        isResolved: false,
        cause: error,
      });

      flair = await this.flairRepo.save(newFlair);

      await this.logService.newLog('service-down', error, flair.id);
      await this.mailService.sendMail(
        pulse.user.email,
        false,
        pulse.userId,
        pulse.name || pulse.publicId,
      );
      await this.logService.newLog(
        'email-sent',
        `Email sent to ${pulse.user.name || pulse.user.email}`,
        flair.id,
      );
    }

    return flair;
  }

  async handlePulseRecovery(pulse: PulseEntity) {
    const flair = await this.flairRepo.findOne({
      where: { pulseId: pulse.id, isResolved: false },
    });

    if (!flair) return;

    await this.flairRepo.update(
      { id: flair.id },
      {
        isResolved: true,
        resolvedAt: new Date(),
      },
    );

    await this.logService.newLog(
      'service-resolved',
      'Flair resolved',
      flair.id,
    );
    const email = await this.mailService.sendMail(
      pulse.user.email,
      true,
      pulse.userId,
      pulse.name || pulse.publicId,
    );
    if (!email) throw new BadRequestException('Error sending mail');

    await this.logService.newLog(
      'email-sent',
      `Email sent to ${pulse.user.name || pulse.user.email}`,
      flair.id,
    );

    return flair;
  }

  async getFlair(id: string) {
    const flair = await this.flairRepo.findOne({
      where: { id },
      relations: ['logs', 'pulse'],
    });

    if (!flair) throw new NotFoundException('Flair not found');

    return { message: 'Flair fetched successfully', flair };
  }

  async getFlairs(req: Request, params: GetPulsesParams) {
    const user = req.user as UserEntity;

    const limit = params?.per_page || PAGE_SIZE;
    const query = params?.query || '';
    const page = params?.page || 1;
    const skip = limit * (page - 1);

    const [flairs, total] = await this.flairRepo.findAndCount({
      where: [
        { userId: user.id, pulse: { name: ILike(`%${query}%`) } },
        { userId: user.id, pulse: { url: ILike(`%${query}%`) } },
        { userId: user.id, cause: ILike(`%${query}%`) },
      ],
      skip,
      take: limit,
    });

    return {
      message: 'Flairs fetched successfully',
      flairs,
      total,
      page,
      per_page: limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
