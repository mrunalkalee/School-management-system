import { All, Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { GatewayService } from './gateway.service';

@Controller()
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Get()
  index() {
    return {
      name: 'BrightBoard API Gateway',
      description: 'All downstream Swagger documentation URLs. All routes other than /auth/* require a verified Bearer token through this gateway.',
      services: this.gatewayService.services(),
    };
  }

  @All('{*path}')
  async proxy(@Req() request: Request, @Res() response: Response): Promise<void> {
    await this.gatewayService.proxy(request, response);
  }
}
