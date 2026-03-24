import { Module } from '@nestjs/common';
import { FlairService } from './flair.service';
import { FlairController } from './flair.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FlairEntity } from 'src/entities/flair.entity';
import { LogEntity } from 'src/entities/log.entity';
import { LogModule } from 'src/log/log.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([FlairEntity, LogEntity]),
    LogModule,
    MailModule,
  ],
  providers: [FlairService],
  controllers: [FlairController],
  exports: [FlairService],
})
export class FlairModule {}
