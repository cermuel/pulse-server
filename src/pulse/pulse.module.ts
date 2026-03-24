import { Module } from '@nestjs/common';
import { PulseController } from './pulse.controller';
import { PulseService } from './pulse.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PulseEntity } from 'src/entities/pulse.entity';
import { PingEntity } from 'src/entities/ping.entity';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([PulseEntity, PingEntity]),
    BullModule.registerQueue({ name: 'check-pulse' }),
  ],
  controllers: [PulseController],
  providers: [PulseService],
})
export class PulseModule {}
