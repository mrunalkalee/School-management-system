import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { LoginUserDto } from './dto/login-user.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { JwtPayload } from './jwt.strategy';
import { RefreshToken } from './refresh-token.schema';
import { User, UserDocument, UserRole } from './user.schema';

export interface AuthResponse { user: Record<string, unknown>; access_token: string; refresh_token: string; }

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(RefreshToken.name) private readonly refreshTokenModel: Model<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterUserDto, requesterRole?: string, authorization?: string): Promise<AuthResponse> {
    const userCount = await this.userModel.countDocuments();
    if (userCount > 0) {
      await this.assertAdminAccess(requesterRole, authorization);
    }

    const email = dto.email.trim().toLowerCase();
    const exists = await this.userModel.exists({ email });
    if (exists) throw new ConflictException('A user with this email already exists');
    const user = await new this.userModel({
      ...dto,
      email,
      linkedStudentIds: dto.linkedStudentIds ?? [],
      password: await bcrypt.hash(dto.password, 12),
    }).save();
    return this.createSession(user);
  }

  async listUsers(requesterRole?: string, authorization?: string): Promise<Array<Record<string, unknown>>> {
    await this.assertAdminAccess(requesterRole, authorization);
    return this.userModel
      .find({}, { name: 1, email: 1, role: 1, linkedProfileId: 1, linkedStudentIds: 1, isActive: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .lean()
      .exec() as Promise<Array<Record<string, unknown>>>;
  }

  async deleteUser(userId: string, requesterRole?: string, authorization?: string): Promise<{ message: string }> {
    const requester = await this.assertDeleteAccess(requesterRole, authorization);
    if (requester?.sub === userId) throw new BadRequestException('Cannot delete your own account');

    if (!isValidObjectId(userId)) throw new NotFoundException('User not found');
    const user = await this.userModel.findById(userId).exec();
    if (!user) throw new NotFoundException('User not found');

    await this.refreshTokenModel.deleteMany({ userId: user.id }).exec();
    // Deliberately retain linked student/teacher profiles: they may be referenced by historical academic records.
    await user.deleteOne();
    return { message: 'User account deleted successfully' };
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

  /** Used by token verification so parent-child links take effect immediately. */
  async findVerifiedUser(userId: string): Promise<{ linkedStudentIds: string[]; linkedProfileId?: string } | null> {
    return this.userModel.findById(userId, { linkedStudentIds: 1, linkedProfileId: 1, isActive: 1 }).lean().exec()
      .then((user) => user?.isActive ? { linkedStudentIds: user.linkedStudentIds ?? [], linkedProfileId: user.linkedProfileId } : null);
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

  private async assertAdminAccess(requesterRole?: string, authorization?: string): Promise<void> {
    if (requesterRole !== UserRole.Admin || !authorization?.startsWith('Bearer ')) {
      throw new ForbiddenException('Administrator access is required');
    }
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(authorization.slice('Bearer '.length));
      if (payload.type !== 'access' || payload.role !== UserRole.Admin) throw new Error('Not an admin access token');
    } catch {
      throw new ForbiddenException('Administrator access is required');
    }
  }

  private async assertDeleteAccess(requesterRole?: string, authorization?: string): Promise<JwtPayload | undefined> {
    // Direct local requests without gateway identity headers remain intentionally unguarded for development.
    if (requesterRole === undefined) {
      if (!authorization?.startsWith('Bearer ')) return undefined;
      try {
        const payload = await this.jwtService.verifyAsync<JwtPayload>(authorization.slice('Bearer '.length));
        return payload.type === 'access' ? payload : undefined;
      } catch {
        return undefined;
      }
    }
    if (requesterRole !== UserRole.Admin || !authorization?.startsWith('Bearer ')) {
      throw new ForbiddenException('Administrator access is required');
    }
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(authorization.slice('Bearer '.length));
      if (payload.type !== 'access' || payload.role !== UserRole.Admin) throw new Error('Not an admin access token');
      return payload;
    } catch {
      throw new ForbiddenException('Administrator access is required');
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
