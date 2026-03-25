import { Module } from '@nestjs/common';
import { PulseController } from './pulse.controller';
import { PulseService } from './pulse.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PulseEntity } from 'src/entities/pulse.entity';
import { PingEntity } from 'src/entities/ping.entity';
import { BullModule } from '@nestjs/bullmq';
import { PingModule } from 'src/ping/ping.module';
import { FlairModule } from 'src/flair/flair.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PulseEntity, PingEntity]),
    BullModule.registerQueue({ name: 'check-pulse' }),
    PingModule,
    FlairModule,
  ],
  controllers: [PulseController],
  providers: [PulseService],
})
export class PulseModule {}
