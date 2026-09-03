import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsEnum, IsInt, IsString, Matches, MaxLength, Min, ValidateNested } from 'class-validator';

export enum DayOfWeek {
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
}

export class PeriodDto {
  @ApiProperty({ example: 1, minimum: 1 })
  @IsInt()
  @Min(1)
  periodNumber: number;

  @ApiProperty({ example: '66b5d38acd65f26429ab4ce1' })
  @IsString()
  @MaxLength(100)
  subjectId: string;

  @ApiProperty({ example: '66b5d38acd65f26429ab4cff' })
  @IsString()
  @MaxLength(100)
  teacherId: string;

  @ApiProperty({ example: '09:00', pattern: '^([01]\\d|2[0-3]):[0-5]\\d$' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'startTime must use HH:mm (24-hour) format' })
  startTime: string;

  @ApiProperty({ example: '09:45', pattern: '^([01]\\d|2[0-3]):[0-5]\\d$' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, { message: 'endTime must use HH:mm (24-hour) format' })
  endTime: string;
}

export class CreateTimetableDto {
  @ApiProperty({ example: '66b5d38acd65f26429ab4ce1' })
  @IsString()
  @MaxLength(100)
  classId: string;

  @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.Monday })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({ type: [PeriodDto], example: [{ periodNumber: 1, subjectId: '66b5d38acd65f26429ab4ce2', teacherId: '66b5d38acd65f26429ab4cff', startTime: '09:00', endTime: '09:45' }] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PeriodDto)
  periods: PeriodDto[];
}
