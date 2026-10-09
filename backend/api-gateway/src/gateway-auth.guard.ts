import { HttpService } from '@nestjs/axios';
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { firstValueFrom } from 'rxjs';

interface VerifiedUser { sub: string; email: string; role: string; linkedProfileId?: string; linkedStudentIds?: string[]; }
interface GatewayRequest extends Request { headers: Request['headers'] & { 'x-user-id'?: string; 'x-user-role'?: string; 'x-linked-profile-id'?: string; 'x-linked-student-ids'?: string }; }

@Injectable()
export class GatewayAuthGuard implements CanActivate {
  constructor(private readonly httpService: HttpService, private readonly config: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<GatewayRequest>();
    const authorization = request.headers.authorization;
    const isBootstrapRegistration = request.method === 'POST' && request.path === '/auth/register' && !authorization;
    if (this.isPublic(request) || isBootstrapRegistration) return true;

    if (!authorization?.startsWith('Bearer ')) throw new UnauthorizedException('A Bearer token is required');
    let verifiedUser: VerifiedUser;
    try {
      const authBaseUrl = this.config.getOrThrow<string>('AUTH_SERVICE_URL').replace(/\/$/, '');
      const response = await firstValueFrom(this.httpService.get<VerifiedUser>(`${authBaseUrl}/auth/verify`, { headers: { authorization } }));
      verifiedUser = response.data;
    } catch {
      throw new UnauthorizedException('Invalid or expired access token');
    }
    request.headers['x-user-id'] = verifiedUser.sub;
    request.headers['x-user-role'] = verifiedUser.role;
    request.headers['x-linked-profile-id'] = verifiedUser.linkedProfileId ?? '';
    request.headers['x-linked-student-ids'] = (verifiedUser.linkedStudentIds ?? []).join(',');
    this.assertParentCanAccess(request, verifiedUser);
    return true;
  }

  /**
   * Parent links are maintained by auth-service.  Do this at the gateway so the
   * same rule protects every student-specific service endpoint.
   */
  private assertParentCanAccess(request: Request, user: VerifiedUser): void {
    if (user.role !== 'parent') return;
    const studentId = this.studentIdInPath(request.path);
    if (studentId) {
      if (request.method === 'GET' && (user.linkedStudentIds ?? []).includes(studentId)) return;
      throw new ForbiddenException('Parents can only access records for their linked children');
    }

    // Keep the parent allow-list explicit: a new route cannot accidentally
    // reveal school-wide student records to every parent account.
    const sharedReadOnlyPaths = ['/timetables', '/notices', '/events', '/library/books', '/transport/routes'];
    const accountPaths = ['/auth/verify', '/auth/logout'];
    if ((request.method === 'GET' && sharedReadOnlyPaths.includes(request.path)) || accountPaths.includes(request.path)) return;
    throw new ForbiddenException('Parents can only access their linked children\'s records');
  }

  private studentIdInPath(path: string): string | undefined {
    const match = path.match(/^\/(?:dashboard\/(?:parent|student)|students|attendance\/student|assignments\/student|fees\/student|exams\/results\/student|performance\/student|library\/student|transport\/student|certificates\/student)\/([^/]+)$/);
    return match?.[1];
  }

  private isPublic(request: Request): boolean {
    return request.path === '/'
      || request.path === '/auth'
      || request.path === '/auth/login'
      || request.path === '/auth/refresh'
      || (request.method === 'POST' && request.path === '/admissions');
  }
}
