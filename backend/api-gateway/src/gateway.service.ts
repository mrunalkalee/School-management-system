import { HttpService } from '@nestjs/axios';
import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { firstValueFrom } from 'rxjs';

const ROUTES: Record<string, string> = {
  students: 'STUDENT_SERVICE_URL', teachers: 'TEACHER_SERVICE_URL', classes: 'CLASS_SERVICE_URL', timetables: 'TIMETABLE_SERVICE_URL',
  attendance: 'ATTENDANCE_SERVICE_URL', exams: 'EXAMINATION_SERVICE_URL', performance: 'PERFORMANCE_SERVICE_URL', assignments: 'ASSIGNMENT_SERVICE_URL',
  fees: 'FEE_SERVICE_URL', 'leave-requests': 'LEAVE_SERVICE_URL', admissions: 'ADMISSION_SERVICE_URL', certificates: 'CERTIFICATE_SERVICE_URL',
  notices: 'NOTICE_SERVICE_URL', library: 'LIBRARY_SERVICE_URL', transport: 'TRANSPORT_SERVICE_URL', dashboard: 'DASHBOARD_SERVICE_URL', auth: 'AUTH_SERVICE_URL',
};

@Injectable()
export class GatewayService {
  constructor(private readonly httpService: HttpService, private readonly config: ConfigService) {}

  services(): Array<{ prefix: string; swaggerUrl: string }> {
    return Object.entries(ROUTES).map(([prefix, key]) => ({ prefix: `/${prefix}`, swaggerUrl: `${this.baseUrl(key)}/api` }));
  }

  async proxy(request: Request, response: Response): Promise<void> {
    const prefix = request.path.split('/').filter(Boolean)[0];
    const configKey = prefix ? ROUTES[prefix] : undefined;
    if (!configKey) throw new NotFoundException(`No downstream service is registered for /${prefix ?? ''}`);
    const upstreamUrl = `${this.baseUrl(configKey)}${request.originalUrl}`;
    const headers = { ...request.headers } as Record<string, string | string[] | undefined>;
    delete headers.host;
    delete headers['content-length'];
    const upstreamRequest: AxiosRequestConfig = { method: request.method, url: upstreamUrl, data: request.body, headers, validateStatus: () => true, responseType: 'arraybuffer' };
    let upstreamResponse: AxiosResponse<ArrayBuffer>;
    try {
      upstreamResponse = await firstValueFrom(this.httpService.request<ArrayBuffer>(upstreamRequest));
    } catch {
      throw new BadGatewayException(`Unable to reach the ${prefix} service`);
    }
    response.status(upstreamResponse.status);
    forwardResponseHeaders(response, upstreamResponse.headers);
    response.send(Buffer.from(upstreamResponse.data));
  }

  private baseUrl(configKey: string): string { return this.config.getOrThrow<string>(configKey).replace(/\/$/, ''); }
}

function forwardResponseHeaders(response: Response, headers: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined && !['connection', 'content-encoding', 'content-length', 'transfer-encoding'].includes(key.toLowerCase())) response.setHeader(key, value as string | string[]);
  }
}
