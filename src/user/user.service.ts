import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Request } from 'express';
import { EditUserDTO } from 'src/dto/user.dto';
import { NotificationEntity } from 'src/entities/notification.entity';
import { UserEntity } from 'src/entities/user.entity';

import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntity: Repository<UserEntity>,
    @InjectRepository(NotificationEntity)
    private readonly notificationEntity: Repository<NotificationEntity>,
  ) {}

  async getCurrentUser(req: Request) {
    const user = req.user as UserEntity;
    if (!user) throw new UnauthorizedException('User not logged in');

    return this.userEntity.findOne({
      where: { id: user.id },
      relations: { notification: true },
    });
  }

  async editProfile(req: Request, dto: EditUserDTO) {
    let userId = req.user as UserEntity;
    const user = await this.userEntity.findOne({ where: { id: userId.id } });
    if (!user) throw new NotFoundException('User not found');
    await this.userEntity.update({ id: user.id }, { ...dto });
    return { message: 'User edited successfully', user };
  }

  async deleteUser(req: Request) {
    const user = req.user as UserEntity;
    await this.userEntity.delete({ id: user.id });
    return { message: 'User deleted successfully' };
  }
}
