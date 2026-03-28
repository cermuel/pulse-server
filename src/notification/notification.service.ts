import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Request } from 'express';
import { EditNotificationDTO } from 'src/dto/notification.dto';
import { NotificationEntity } from 'src/entities/notification.entity';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationService implements OnApplicationBootstrap {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(NotificationEntity)
    private readonly notificationRepo: Repository<NotificationEntity>,
  ) {}
  async onApplicationBootstrap() {
    const usersWithout = await this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.notification', 'notification')
      .where('notification.id IS NULL')
      .getMany();

    if (usersWithout.length === 0) return;

    for (const user of usersWithout) {
      const notification = this.notificationRepo.create({ userId: user.id });
      const saved = await this.notificationRepo.save(notification);
      await this.userRepo.update(user.id, { notificationId: saved.id });
    }

    console.log(
      `Created notifications for ${usersWithout.length} existing users`,
    );
  }

  async editNotificationPreferences(body: EditNotificationDTO, req: Request) {
    const user = req.user as UserEntity;

    const notification = await this.notificationRepo.findOne({
      where: { userId: user.id },
    });
    if (!notification)
      throw new NotFoundException(
        `No notification found for user with ID: ${user.id}`,
      );

    if (user.plan == 'free' && body.telegram == true)
      throw new BadRequestException(
        'Telegram notification is only available to PRO users',
      );
    if (user.plan == 'free' && body.whatsapp == true)
      throw new BadRequestException(
        'Whatsapp notification is only available to PRO users',
      );
    await this.notificationRepo.update({ id: notification.id }, { ...body });

    return {
      message: 'Notification preferences updated successfully',
      notification,
    };
  }
}
