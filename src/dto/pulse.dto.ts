import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePulseDTO {
  @IsString()
  url: string;

  @IsString()
  @IsOptional()
  method?: string;

  @IsString()
  @IsOptional()
  publicId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  interval?: number;

  @IsNumber()
  @IsOptional()
  expectedStatus?: number;
}

export class EditPulseDTO {
  @IsString()
  @IsOptional()
  publicId?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  interval?: number;

  @IsNumber()
  @IsOptional()
  expectedStatus?: number;
}

export interface GetPulsesParams {
  per_page?: number;
  page?: number;
  query?: string;
}
