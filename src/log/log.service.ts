import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LogEntity } from 'src/entities/log.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LogService {
  constructor(
    @InjectRepository(LogEntity)
    private readonly logRepo: Repository<LogEntity>,
  ) {}

  async newLog(
    type: 'email-sent' | 'service-down' | 'service-resolved',
    message: string,
    flairId: string,
  ) {
    let log = this.logRepo.create({
      type,
      message,
      flairId,
    });

    log = await this.logRepo.save(log);
    return log;
  }
}
