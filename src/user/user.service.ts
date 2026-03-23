import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Request } from 'express';
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
}
