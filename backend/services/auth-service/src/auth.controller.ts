import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtPayload } from './jwt.strategy';

interface AuthenticatedRequest extends Request { user: JwtPayload; }

const sessionSchema = {
  type: 'object',
  required: ['user', 'access_token', 'refresh_token'],
  properties: {
    user: { type: 'object', description: 'Public user document; password is never returned.', properties: { _id: { type: 'string' }, name: { type: 'string' }, email: { type: 'string', format: 'email' }, role: { type: 'string', enum: ['admin', 'teacher', 'student', 'parent'] }, linkedProfileId: { type: 'string', nullable: true }, isActive: { type: 'boolean' } } },
    access_token: { type: 'string', description: 'Bearer JWT with the configured 15-minute lifetime.' },
    refresh_token: { type: 'string', description: 'Rotating refresh JWT with the configured 7-day lifetime.' },
  },
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a user, hash their password, and create an authenticated session' })
  @ApiResponse({ status: 201, description: 'User registered and tokens issued successfully', schema: sessionSchema })
  @ApiResponse({ status: 400, description: 'Invalid registration payload' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  register(@Body() dto: RegisterUserDto) { return this.authService.register(dto); }

  @Post('login')
  @ApiOperation({ summary: 'Authenticate with email and password, then issue access and refresh tokens' })
  @ApiResponse({ status: 201, description: 'Authentication succeeded and tokens issued successfully', schema: sessionSchema })
  @ApiResponse({ status: 400, description: 'Invalid login payload' })
  @ApiResponse({ status: 401, description: 'Invalid credentials or inactive account' })
  login(@Body() dto: LoginUserDto) { return this.authService.login(dto); }

  @Post('refresh')
  @ApiOperation({ summary: 'Rotate a valid refresh token and issue a new access and refresh token pair' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 201, description: 'Token pair rotated successfully', schema: sessionSchema })
  @ApiResponse({ status: 400, description: 'Invalid refresh payload' })
  @ApiResponse({ status: 401, description: 'Refresh token is invalid, expired, or revoked' })
  refresh(@Body() dto: RefreshTokenDto) { return this.authService.refresh(dto); }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Revoke the supplied refresh token for the authenticated user' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ status: 201, description: 'Logged out successfully' })
  @ApiResponse({ status: 401, description: 'Missing, invalid, or expired access token' })
  logout(@Req() request: AuthenticatedRequest, @Body() dto: RefreshTokenDto) { return this.authService.logout(request.user.sub, dto); }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Verify a Bearer access token for API Gateway authentication' })
  @ApiResponse({ status: 200, description: 'Token claims decoded successfully', schema: { type: 'object', required: ['sub', 'email', 'role'], properties: { sub: { type: 'string' }, email: { type: 'string', format: 'email' }, role: { type: 'string', enum: ['admin', 'teacher', 'student', 'parent'] } } } })
  @ApiResponse({ status: 401, description: 'Missing, invalid, expired, or refresh token used as Bearer token' })
  verify(@Req() request: AuthenticatedRequest) {
    const { sub, email, role } = request.user;
    return { sub, email, role };
  }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('auth')
  @ApiOperation({ summary: 'Check auth-service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() { return { status: 'ok', service: 'auth-service' }; }
}
