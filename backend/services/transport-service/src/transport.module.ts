import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { BusAllocation, BusAllocationSchema } from './bus-allocation.schema';
import { BusAllocationsController } from './bus-allocations.controller';
import { BusAllocationsService } from './bus-allocations.service';
import { Route, RouteSchema } from './route.schema';
import { HealthController, RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({ uri: config.getOrThrow<string>('MONGODB_URI') }),
    }),
    MongooseModule.forFeature([
      { name: Route.name, schema: RouteSchema },
      { name: BusAllocation.name, schema: BusAllocationSchema },
    ]),
  ],
  controllers: [RoutesController, BusAllocationsController, HealthController],
  providers: [RoutesService, BusAllocationsService],
})
export class TransportModule {}
