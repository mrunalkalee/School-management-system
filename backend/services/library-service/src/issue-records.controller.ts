import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { IssueBookDto } from './dto/issue-book.dto';
import { IssueRecordsService } from './issue-records.service';

@ApiTags('Library - Issue Records')
@Controller('library')
export class IssueRecordsController {
  constructor(private readonly issueRecordsService: IssueRecordsService) {}

  @Post('issue')
  @ApiOperation({ summary: 'Issue a book after validating the student or teacher borrower' })
  @ApiResponse({ status: 201, description: 'Book issued successfully' })
  @ApiResponse({ status: 400, description: 'Invalid payload, unavailable book, or invalid due date' })
  @ApiResponse({ status: 404, description: 'Book or borrower not found' })
  @ApiResponse({ status: 503, description: 'Borrower service unavailable' })
  issue(@Body() issueBookDto: IssueBookDto) { return this.issueRecordsService.issue(issueBookDto); }

  @Patch('return/:issueId')
  @ApiOperation({ summary: 'Return an issued book and calculate a ₹5 per late day fine' })
  @ApiParam({ name: 'issueId', example: '66b5d38acd65f26429ab4ce3' })
  @ApiResponse({ status: 200, description: 'Book returned successfully' })
  @ApiResponse({ status: 404, description: 'Issue record not found' })
  @ApiResponse({ status: 409, description: 'Book has already been returned' })
  returnBook(@Param('issueId') issueId: string) { return this.issueRecordsService.returnBook(issueId); }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get a student borrower’s complete library issue history' })
  @ApiParam({ name: 'studentId', example: '66b5d38acd65f26429ab4ce2' })
  @ApiResponse({ status: 200, description: 'Student issue history returned successfully' })
  history(@Param('studentId') studentId: string) { return this.issueRecordsService.findStudentHistory(studentId); }
}
