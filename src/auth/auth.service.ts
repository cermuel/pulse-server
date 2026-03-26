import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from 'src/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepo: Repository<UserEntity>,
  ) {}

  async validateOAuthUser(profile: any, provider: string) {
    const email = profile.emails?.[0]?.value;
    const providerId = profile.id;

    let user = await this.userRepo.findOne({ where: { email } });

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

    return await this.userRepo.save(user);
  }
}
