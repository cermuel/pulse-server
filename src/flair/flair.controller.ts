import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { FlairService } from './flair.service';
import type { Request } from 'express';
import { GetPulsesParams } from 'src/dto/pulse.dto';

@UseGuards(AuthGuard)
@Controller('flair')
export class FlairController {
  constructor(private readonly flairService: FlairService) {}

  @Get(':id')
  getFlair(@Param('id') id: string) {
    return this.flairService.getFlair(id);
  }

  @Get()
  //@ts-ignore
  getFlairs(@Req() req: Request, @Query() params: GetPulsesParams) {
    return this.flairService.getFlairs(req, params);
  }
}
