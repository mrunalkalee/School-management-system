import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtPayload } from './jwt.strategy';
import { RefreshToken } from './refresh-token.schema';
import { User, UserDocument } from './user.schema';

export interface AuthResponse { user: Record<string, unknown>; access_token: string; refresh_token: string; }

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(RefreshToken.name) private readonly refreshTokenModel: Model<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterUserDto): Promise<AuthResponse> {
    const email = dto.email.trim().toLowerCase();
    const exists = await this.userModel.exists({ email });
    if (exists) throw new ConflictException('A user with this email already exists');
    const user = await new this.userModel({ ...dto, email, password: await bcrypt.hash(dto.password, 12) }).save();
    return this.createSession(user);
  }

  async login(dto: LoginUserDto): Promise<AuthResponse> {
    const user = await this.userModel.findOne({ email: dto.email.trim().toLowerCase() }).select('+password').exec();
    if (!user || !user.isActive || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.createSession(user);
  }

  async refresh(dto: RefreshTokenDto): Promise<AuthResponse> {
    const payload = await this.verifyRefreshToken(dto.refreshToken);
    const user = await this.userModel.findById(payload.sub).exec();
    if (!user || !user.isActive) throw new UnauthorizedException('Refresh token is invalid');
    const tokens = await this.refreshTokenModel.find({ userId: user.id, expiresAt: { $gt: new Date() } }).select('+token').exec();
    const token = await findMatchingToken(tokens, dto.refreshToken);
    if (!token) throw new UnauthorizedException('Refresh token is invalid');
    await token.deleteOne();
    return this.createSession(user);
  }

  async logout(userId: string, dto: RefreshTokenDto): Promise<{ message: string }> {
    const tokens = await this.refreshTokenModel.find({ userId }).select('+token').exec();
    const token = await findMatchingToken(tokens, dto.refreshToken);
    if (token) await token.deleteOne();
    return { message: 'Logged out successfully' };
  }

  private async createSession(user: UserDocument): Promise<AuthResponse> {
    const payload: JwtPayload = { sub: user.id, email: user.email, role: user.role, type: 'access' };
    const access_token = await this.jwtService.signAsync(payload, { expiresIn: this.config.getOrThrow<string>('JWT_EXPIRES_IN') as never });
    const refreshPayload: JwtPayload = { ...payload, type: 'refresh' };
    const refresh_token = await this.jwtService.signAsync(refreshPayload, { expiresIn: this.config.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN') as never, jwtid: randomUUID() });
    await new this.refreshTokenModel({ userId: user.id, token: await bcrypt.hash(refresh_token, 12), expiresAt: expiresAt(this.config.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN')) }).save();
    return { user: publicUser(user), access_token, refresh_token };
  }

  private async verifyRefreshToken(token: string): Promise<JwtPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token);
      if (payload.type !== 'refresh') throw new UnauthorizedException('Refresh token is invalid');
      return payload;
    } catch {
      throw new UnauthorizedException('Refresh token is invalid');
    }
  }
}

async function findMatchingToken(tokens: Array<{ token: string; deleteOne(): unknown }>, rawToken: string) {
  for (const token of tokens) if (await bcrypt.compare(rawToken, token.token)) return token;
  return null;
}

function publicUser(user: UserDocument): Record<string, unknown> {
  const { password: _password, ...publicData } = user.toObject() as unknown as Record<string, unknown> & { password?: string };
  return publicData;
}

function expiresAt(value: string): Date {
  const match = /^(\d+)([smhd])$/.exec(value);
  if (!match) throw new Error('JWT_REFRESH_EXPIRES_IN must use a duration such as 7d or 24h');
  const multiplier = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 }[match[2] as 's' | 'm' | 'h' | 'd'];
  return new Date(Date.now() + Number(match[1]) * multiplier);
}
