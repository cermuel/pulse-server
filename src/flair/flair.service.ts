import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FlairEntity } from 'src/entities/flair.entity';
import { LogEntity } from 'src/entities/log.entity';
import { PulseEntity } from 'src/entities/pulse.entity';
import { LogService } from 'src/log/log.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';

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
      await this.mailService.sendMail(pulse.user.email, false, pulse.userId);
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

    await this.flairRepo.update(flair, {
      isResolved: true,
      resolvedAt: new Date(),
    });

    await this.logService.newLog(
      'service-resolved',
      'Flair resolved',
      flair.id,
    );
    const email = await this.mailService.sendMail(
      pulse.user.email,
      true,
      pulse.userId,
    );
    if (!email) throw new BadRequestException('Error sending mail');

    await this.logService.newLog(
      'email-sent',
      `Email sent to ${pulse.user.name || pulse.user.email}`,
      flair.id,
    );

    return flair;
  }
}
