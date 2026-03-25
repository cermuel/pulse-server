import { Module } from '@nestjs/common';
import { PingController } from './ping.controller';
import { PingService } from './ping.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PingEntity } from 'src/entities/ping.entity';
import { PulseEntity } from 'src/entities/pulse.entity';
import { BullModule } from '@nestjs/bullmq';
import { FlairEntity } from 'src/entities/flair.entity';
import { FlairModule } from 'src/flair/flair.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PingEntity, PulseEntity, FlairEntity]),
    BullModule.registerQueue({ name: 'check-pulse' }),
    FlairModule,
  ],
  controllers: [PingController],
  providers: [PingService],
  exports: [PingService],
})
export class PingModule {}
