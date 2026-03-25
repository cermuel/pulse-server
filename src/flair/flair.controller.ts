import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { FlairService } from './flair.service';
import type { Request } from 'express';

@UseGuards(AuthGuard)
@Controller('flair')
export class FlairController {
  constructor(private readonly flairService: FlairService) {}

  @Get(':id')
  getFlair(@Param('id') id: string) {
    return this.flairService.getFlair(id);
  }

  @Get()
  getFlairs(@Req() req: Request) {
    return this.flairService.getFlairs(req);
  }
}
