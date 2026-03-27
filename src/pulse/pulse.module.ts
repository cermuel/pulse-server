import { forwardRef, Module } from '@nestjs/common';
import { PulseController } from './pulse.controller';
import { PulseService } from './pulse.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PulseEntity } from 'src/entities/pulse.entity';
import { PingEntity } from 'src/entities/ping.entity';
import { BullModule } from '@nestjs/bullmq';
import { PingModule } from 'src/ping/ping.module';
import { FlairModule } from 'src/flair/flair.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { PulseGateway } from './pulse.gateway';

@Module({
  imports: [
    TypeOrmModule.forFeature([PulseEntity, PingEntity]),
    BullModule.registerQueue({ name: 'check-pulse' }),
    ClientsModule.register([
      {
        name: 'pulse',
        transport: Transport.RMQ,
        options: { urls: ['amqp://localhost:5672'], queue: 'pulse-queue' },
      },
    ]),
    forwardRef(() => PingModule),
    FlairModule,
  ],
  controllers: [PulseController],
  providers: [PulseService, PulseGateway],
  exports: [PulseGateway],
})
export class PulseModule {}
