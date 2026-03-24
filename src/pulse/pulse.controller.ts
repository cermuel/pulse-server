import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PulseService } from './pulse.service';
import type {
  CreatePulseDTO,
  EditPulseDTO,
  GetPulsesParams,
} from 'src/dto/pulse.dto';
import type { Request } from 'express';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('pulse')
export class PulseController {
  constructor(private readonly pulseService: PulseService) {}

  @Post()
  createPulse(@Body() body: CreatePulseDTO, @Req() req: Request) {
    return this.pulseService.createPulse(body, req);
  }

  @Get()
  getUserPulses(@Req() req: Request, @Query() params: GetPulsesParams) {
    return this.pulseService.getUserPulses(req, params);
  }

  @Get(':id')
  getPulse(@Req() req: Request, @Param('id') id: string) {
    return this.pulseService.getPulse(req, id);
  }

  @Patch(':id')
  editPulse(
    @Param('id') id: string,
    @Body() body: EditPulseDTO,
    @Req() req: Request,
  ) {
    return this.pulseService.editPulse(id, body, req);
  }

  //   @Delete(':id')
  //   deletePulse(@Param('id') id: string, @Req() req: Request) {
  //     return this.pulseService.deletePulse(id, req);
  //   }
}
