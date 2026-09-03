import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, ArrayUnique, IsArray, IsString } from 'class-validator';

export class AssignStudentsDto {
  @ApiProperty({ example: ['66b5d38acd65f26429ab4ce1'], type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsString({ each: true })
  studentIds: string[];
}
