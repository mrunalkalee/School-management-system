import { Controller, Get, Param } from '@nestjs/common'; import { DashboardSnapshotService } from './dashboard.service';
@Controller('dashboards') export class DashboardSnapshotController {constructor(private readonly service:DashboardSnapshotService){} @Get() all(){return this.service.findAll();} @Get(':id') one(@Param('id') id:string){return this.service.findOne(id);}}
