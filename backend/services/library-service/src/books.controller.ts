import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';

@ApiTags('Library - Books')
@Controller('library/books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @ApiOperation({ summary: 'Add a book to the catalog' })
  @ApiResponse({ status: 201, description: 'Book created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid book payload' })
  @ApiResponse({ status: 409, description: 'ISBN already exists' })
  create(@Body() createBookDto: CreateBookDto) { return this.booksService.create(createBookDto); }

  @Get()
  @ApiOperation({ summary: 'List books, optionally filtered by title, author, ISBN, or category' })
  @ApiQuery({ name: 'search', required: false, example: 'alchemist' })
  @ApiResponse({ status: 200, description: 'Books returned successfully' })
  findAll(@Query('search') search?: string) { return this.booksService.findAll(search); }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('library')
  @ApiOperation({ summary: 'Check library-service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() { return { status: 'ok', service: 'library-service' }; }
}
