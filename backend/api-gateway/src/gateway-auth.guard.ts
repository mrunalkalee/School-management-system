import { HttpService } from '@nestjs/axios';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';

interface VerifiedUser { sub: string; email: string; role: string; }
interface GatewayRequest extends Request { headers: Request['headers'] & { 'x-user-id'?: string; 'x-user-role'?: string }; }

@Injectable()
export class GatewayAuthGuard implements CanActivate {
  constructor(private readonly httpService: HttpService, private readonly config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<GatewayRequest>();
    if (this.isPublic(request.path)) return true;
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) throw new UnauthorizedException('A Bearer token is required');
    try {
      const authBaseUrl = this.config.getOrThrow<string>('AUTH_SERVICE_URL').replace(/\/$/, '');
      const response = await firstValueFrom(this.httpService.get<VerifiedUser>(`${authBaseUrl}/auth/verify`, { headers: { authorization } }));
      request.headers['x-user-id'] = response.data.sub;
      request.headers['x-user-role'] = response.data.role;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }

  private isPublic(path: string): boolean { return path === '/' || path === '/auth' || path.startsWith('/auth/'); }
}
