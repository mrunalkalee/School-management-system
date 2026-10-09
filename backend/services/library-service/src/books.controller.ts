import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { BooksService } from './books.service';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';

@ApiTags('Library - Books')
@Controller('library/books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiHeader({ name: 'x-user-id', required: false, description: 'Set by API Gateway after JWT verification.' })
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'], description: 'Set by API Gateway. Only admin may add books.' })
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

  @Patch(':id') @UseGuards(RolesGuard) @Roles('admin')
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'] })
  @ApiOperation({ summary: 'Update a catalog book' }) @ApiParam({ name: 'id' }) @ApiResponse({ status: 200, description: 'Book updated successfully' }) @ApiResponse({ status: 404, description: 'Book not found' }) @ApiResponse({ status: 409, description: 'ISBN already exists' })
  update(@Param('id') id: string, @Body() dto: UpdateBookDto) { return this.booksService.update(id, dto); }

  @Delete(':id') @UseGuards(RolesGuard) @Roles('admin')
  @ApiHeader({ name: 'x-user-role', required: false, enum: ['admin', 'teacher', 'student', 'parent'] })
  @ApiOperation({ summary: 'Delete a book when no issued or overdue copies remain' }) @ApiParam({ name: 'id' }) @ApiResponse({ status: 200, description: 'Book deleted successfully' }) @ApiResponse({ status: 400, description: 'Book has active issue records' }) @ApiResponse({ status: 404, description: 'Book not found' })
  remove(@Param('id') id: string) { return this.booksService.remove(id); }
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get('library')
  @ApiOperation({ summary: 'Check library-service health' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  health() { return { status: 'ok', service: 'library-service' }; }
}
