import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Req,
} from '@nestjs/common';
import { PingService } from './ping.service';
import { PingParams } from 'src/dto/ping.dto';
import type { Request } from 'express';

@Controller('ping')
export class PingController {
  constructor(private readonly pingService: PingService) {}

  @Get(':id')
  async getTimes(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() params: PingParams,
    @Req() req: Request,
  ) {
    return this.pingService.getResponseTimes(id, req, params);
  }

  @Get(':id/uptimes')
  async getUptimes(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Query() params: PingParams,
    @Req() req: Request,
  ) {
    return this.pingService.getUpTimes(id, req, params);
  }
}
