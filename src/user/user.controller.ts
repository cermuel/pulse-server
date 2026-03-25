import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserService } from './user.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { EditUserDTO } from 'src/dto/user.dto';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  me(@Req() req: Request) {
    return this.userService.getCurrentUser(req);
  }

  @UseGuards(AuthGuard)
  @Patch()
  editUser(@Req() req: Request, @Body() dto: EditUserDTO) {
    return this.userService.editProfile(req, dto);
  }

  @UseGuards(AuthGuard)
  @Delete()
  delete(@Req() req: Request) {
    return this.userService.deleteUser(req);
  }
}
