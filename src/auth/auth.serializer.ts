import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {
    super();
  }

  serializeUser(user: UserEntity, done: Function) {
    done(null, user.id);
  }

  async deserializeUser(id: string, done: Function) {
    try {
      const user = await this.userRepo.findOne({
        where: { id },
        relations: { notification: true },
      });
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  }
}
