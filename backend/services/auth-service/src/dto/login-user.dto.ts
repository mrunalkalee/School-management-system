import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'aarav@example.com' })
  @IsEmail() @MaxLength(254)
  email: string;

  @ApiProperty({ example: 'SecurePassword123!', format: 'password' })
  @IsString() @MaxLength(128)
  password: string;
}
