import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from './user.schema';

export interface JwtPayload { sub: string; email: string; role: UserRole; type?: 'access' | 'refresh'; }

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtPayload): JwtPayload {
    if (payload.type === 'refresh') throw new UnauthorizedException('Refresh tokens cannot access protected endpoints');
    return { sub: payload.sub, email: payload.email, role: payload.role };
  }
}
