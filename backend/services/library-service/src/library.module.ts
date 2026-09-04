import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Book, BookSchema } from './book.schema';
import { BooksController, HealthController } from './books.controller';
import { BooksService } from './books.service';
import { IssueRecord, IssueRecordSchema } from './issue-record.schema';
import { IssueRecordsController } from './issue-records.controller';
import { IssueRecordsService } from './issue-records.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    HttpModule,
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({ uri: config.getOrThrow<string>('MONGODB_URI') }),
    }),
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
      { name: IssueRecord.name, schema: IssueRecordSchema },
    ]),
  ],
  controllers: [BooksController, IssueRecordsController, HealthController],
  providers: [BooksService, IssueRecordsService],
})
export class LibraryModule {}
