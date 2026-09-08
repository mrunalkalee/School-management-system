import { HttpModule } from '@nestjs/axios';
import { APP_GUARD } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GatewayAuthGuard } from './gateway-auth.guard';
import { GatewayController } from './gateway.controller';
import { GatewayService } from './gateway.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule],
  controllers: [GatewayController],
  providers: [GatewayService, { provide: APP_GUARD, useClass: GatewayAuthGuard }],
})
export class GatewayModule {}
