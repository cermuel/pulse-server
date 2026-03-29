import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PulseEntity } from 'src/entities/pulse.entity';
import { PingEntity } from 'src/entities/ping.entity';
import { FlairEntity } from 'src/entities/flair.entity';
import { UserEntity } from 'src/entities/user.entity';
import { LogEntity } from 'src/entities/log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PulseEntity,
      PingEntity,
      FlairEntity,
      UserEntity,
      LogEntity,
    ]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
