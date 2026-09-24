import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IncomingHttpHeaders } from 'node:http';

export interface GatewayUser {
  id?: string;
  role?: 'admin' | 'teacher' | 'student' | 'parent';
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): GatewayUser => {
    const request = context.switchToHttp().getRequest<{ headers: IncomingHttpHeaders }>();
    const getHeader = (name: string): string | undefined => {
      const value = request.headers[name];
      return Array.isArray(value) ? value[0] : value;
    };

    return {
      id: getHeader('x-user-id'),
      role: getHeader('x-user-role') as GatewayUser['role'],
    };
  },
);
