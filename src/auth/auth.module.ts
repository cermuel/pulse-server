import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GithubStrategy } from './strategies/github.strategy';
import { SessionSerializer } from './auth.serializer';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PassportModule } from '@nestjs/passport';
import { UserEntity } from 'src/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    PassportModule.register({ session: true }),
  ],
  providers: [AuthService, GithubStrategy, SessionSerializer],
  controllers: [AuthController],
})
export class AuthModule {}
