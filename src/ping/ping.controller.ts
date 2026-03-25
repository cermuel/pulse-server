import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { PingService } from './ping.service';

@Controller('ping')
export class PingController {
  constructor(private readonly pingService: PingService) {}

  @Get(':id')
  async getTimes(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.pingService.getResponseTimes(id);
  }
}
