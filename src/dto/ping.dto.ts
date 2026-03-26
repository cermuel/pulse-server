import { Type } from 'class-transformer';
import { IsDate, IsIn, IsOptional, IsString } from 'class-validator';

export type Period = '4 hours' | '24 hours' | '7 days' | '28 days' | '365 days';

export class PingParams {
  @IsOptional()
  @IsIn(['4 hours', '24 hours', '7 days', '28 days', '365 days'])
  period?: Period;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;
}
