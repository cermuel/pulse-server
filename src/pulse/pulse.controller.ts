import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PulseService } from './pulse.service';
import {
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
  //@ts-ignore
  getUserPulses(@Req() req: Request, @Query() params: GetPulsesParams) {
    return this.pulseService.getUserPulses(req, params);
  }

  @Get(':id')
  getPulse(@Req() req: Request, @Param('id', new ParseUUIDPipe()) id: string) {
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

  @Patch(':id/pause')
  pausePulse(@Param('id') id: string) {
    return this.pulseService.pausePulse(id);
  }

  @Patch(':id/resume')
  resumePulse(@Param('id') id: string) {
    return this.pulseService.resumePulse(id);
  }

  @Get(':id/check')
  checkPublicId(@Param('id') id: string) {
    return this.pulseService.checkPublicId(id);
  }

  @Delete(':id')
  deletePulse(@Param('id') id: string, @Req() req: Request) {
    return this.pulseService.deletePulse(id, req);
  }
}
