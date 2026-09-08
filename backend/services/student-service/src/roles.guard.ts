import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IncomingHttpHeaders } from 'node:http';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers: IncomingHttpHeaders }>();
    const roleHeader = request.headers['x-user-role'];
    const role = Array.isArray(roleHeader) ? roleHeader[0] : roleHeader;
    // Direct Swagger and service testing remains available without gateway headers.
    if (!role) return true;
    const allowedRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);
    return !allowedRoles?.length || allowedRoles.includes(role);
  }
}
