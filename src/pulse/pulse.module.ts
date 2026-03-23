import { Module } from '@nestjs/common';
import { PulseController } from './pulse.controller';
import { PulseService } from './pulse.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PulseEntity } from 'src/entities/pulse.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PulseEntity])],
  controllers: [PulseController],
  providers: [PulseService],
})
export class PulseModule {}
