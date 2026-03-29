import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get(':id')
  getUserStats(@Param('id') email: string) {
    return this.statsService.getUserServicesStats(email);
  }

  @Get(':id/:publicId')
  getStat(@Param('id') email: string, @Param('publicId') publicId: string) {
    return this.statsService.getServiceStats(email, publicId);
  }
}
