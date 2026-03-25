import { IsOptional, IsString } from 'class-validator';

export class EditUserDTO {
  @IsString()
  @IsOptional()
  name: string;

  @IsString()
  @IsOptional()
  avatar: string;
}
