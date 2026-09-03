import { ApiProperty } from '@nestjs/swagger';
import { ArrayUnique, IsArray, IsString, MaxLength } from 'class-validator';

export class CreateClassDto {
  @ApiProperty({ example: 'Grade 10' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'A' })
  @IsString()
  @MaxLength(20)
  section: string;

  @ApiProperty({ example: '2026-2027' })
  @IsString()
  @MaxLength(20)
  academicYear: string;

  @ApiProperty({ example: '66b5d38acd65f26429ab4ce1' })
  @IsString()
  classTeacherId: string;

  @ApiProperty({ example: [], type: [String], default: [] })
  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  studentIds: string[] = [];
}
