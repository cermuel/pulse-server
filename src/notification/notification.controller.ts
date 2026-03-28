import { Body, Controller, Patch, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { EditNotificationDTO } from 'src/dto/notification.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import type { Request } from 'express';

@UseGuards(AuthGuard)
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Patch()
  editNotificationPreferences(
    @Body() body: EditNotificationDTO,
    @Req() req: Request,
  ) {
    return this.notificationService.editNotificationPreferences(body, req);
  }
}
