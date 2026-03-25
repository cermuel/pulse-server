import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Request } from 'express';
import { EditUserDTO } from 'src/dto/user.dto';
import { UserEntity } from 'src/entities/user.entity';

import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userEntity: Repository<UserEntity>,
  ) {}

  async getCurrentUser(req: Request) {
    if (!req.user) throw new UnauthorizedException('User not logged in');
    return req.user;
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
