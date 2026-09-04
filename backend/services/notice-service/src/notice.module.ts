import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Event, EventSchema } from './event.schema';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { Notice, NoticeSchema } from './notice.schema';
import { HealthController, NoticesController } from './notices.controller';
import { NoticesService } from './notices.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), HttpModule,
    MongooseModule.forRootAsync({ inject: [ConfigService], useFactory: (configService: ConfigService) => ({ uri: configService.getOrThrow<string>('MONGODB_URI') }) }),
    MongooseModule.forFeature([{ name: Notice.name, schema: NoticeSchema }, { name: Event.name, schema: EventSchema }]),
  ],
  controllers: [NoticesController, EventsController, HealthController],
  providers: [NoticesService, EventsService],
})
export class NoticeModule {}
