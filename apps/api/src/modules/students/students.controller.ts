import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiConflictResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentStatus } from './schemas/student.schema';
import { StudentsQuery, StudentsService } from './students.service';

/** Replace these lightweight guards with the app-wide auth guards when an auth module is added. */
class JwtAuthGuard { canActivate(): boolean { return true; } }
class RolesGuard { canActivate(): boolean { return true; } }

@ApiTags('students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}
  @Post() @ApiOkResponse({ description: 'Student created' }) @ApiConflictResponse({ description: 'Roll or admission number exists' })
  create(@Body() dto: CreateStudentDto) { return this.studentsService.create(dto); }
  @Get() @ApiOkResponse({ description: 'Paginated students ({ data, meta })' })
  findAll(@Query('page') page?: string, @Query('limit') limit?: string, @Query('class') className?: string, @Query('section') section?: string, @Query('status') status?: StudentStatus, @Query('search') search?: string) {
    return this.studentsService.findAll({ page: Number(page), limit: Number(limit), class: className, section, status, search } as StudentsQuery);
  }
  @Get(':id') @ApiOkResponse({ description: 'Student' }) findOne(@Param('id') id: string) { return this.studentsService.findOne(id); }
  @Patch(':id') @ApiOkResponse({ description: 'Student updated' }) update(@Param('id') id: string, @Body() dto: UpdateStudentDto) { return this.studentsService.update(id, dto); }
  @Delete(':id') @HttpCode(200) @ApiOkResponse({ description: 'Student soft-deleted (status set to inactive)' }) remove(@Param('id') id: string) { return this.studentsService.remove(id); }
}
