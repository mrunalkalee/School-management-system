import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class AllocateStudentDto {
  @ApiProperty({ example: '66b5d38acd65f26429ab4ce1' })
  @IsString() @MaxLength(100)
  studentId: string;

  @ApiProperty({ example: '66b5d38acd65f26429ab4ce2' })
  @IsString() @MaxLength(100)
  routeId: string;

  @ApiProperty({ example: 'Central Park' })
  @IsString() @MaxLength(150)
  stopName: string;
}
