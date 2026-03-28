import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class EditNotificationDTO {
  @IsBoolean()
  @IsOptional()
  email?: boolean;
  @IsBoolean()
  @IsOptional()
  inAppFlair?: boolean;
  @IsBoolean()
  @IsOptional()
  inAppPing?: boolean;
  @IsBoolean()
  @IsOptional()
  whatsapp?: boolean;
  @IsBoolean()
  @IsOptional()
  telegram?: boolean;
}
