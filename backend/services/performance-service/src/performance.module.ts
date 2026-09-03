import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController, PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), HttpModule],
  controllers: [PerformanceController, HealthController],
  providers: [PerformanceService],
})
export class PerformanceModule {}
