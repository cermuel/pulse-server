import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { NotificationEntity } from 'src/entities/notification.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
    @InjectRepository(NotificationEntity)
    private notificationRepo: Repository<NotificationEntity>,
  ) {}

  async validateOAuthUser(profile: any, provider: string) {
    const email = profile.emails?.[0]?.value;
    const providerId = profile.id;

    let user = await this.userRepo.findOne({
      where: { email },
      relations: { notification: true },
    });

    if (user) {
      if (user.providerId !== providerId) {
        await this.userRepo.update({ id: user.id }, { provider, providerId });
      }
      return user;
    }

    user = this.userRepo.create({
      name: profile.displayName || profile.username,
      avatar: profile.photos?.[0]?.value,
      email,
      provider,
      providerId,
    });

    await this.userRepo.save(user);
    const notification = this.notificationRepo.create({ userId: user.id });
    const savedNotification = await this.notificationRepo.save(notification);

    await this.userRepo.update(user.id, {
      notificationId: savedNotification.id,
    });

    user.notification = savedNotification;
    return user;
  }
}
