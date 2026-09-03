import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, ArrayUnique, IsArray, IsInt, IsOptional, IsString, MaxLength, Min, ValidateNested } from 'class-validator';

export class StudentMarksDto {
  @ApiProperty({ example: '66b5d38acd65f26429ab4ce1' })
  @IsString()
  @MaxLength(100)
  studentId: string;

  @ApiProperty({ example: 84 })
  @Type(() => Number)
  @IsInt()
  @Min(0)
  marksObtained: number;

  @ApiPropertyOptional({ example: 'Consistent work throughout the term.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  remarks?: string;
}

export class EnterMarksDto {
  @ApiProperty({ type: [StudentMarksDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique((mark: StudentMarksDto) => mark.studentId)
  @ValidateNested({ each: true })
  @Type(() => StudentMarksDto)
  marks: StudentMarksDto[];
}
