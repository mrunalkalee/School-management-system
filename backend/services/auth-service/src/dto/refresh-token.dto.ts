import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({ description: 'The refresh token returned by register, login, or refresh', minLength: 20 })
  @IsString() @MinLength(20)
  refreshToken: string;
}
