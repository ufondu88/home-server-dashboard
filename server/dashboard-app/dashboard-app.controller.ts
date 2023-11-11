import { Controller, Get, Post, Body, Patch, Param, Delete, Logger } from '@nestjs/common';
import { DashboardAppService } from './dashboard-app.service';
import { CreateDashboardAppDto } from './dto/create-dashboard-app.dto';
import { UpdateDashboardAppDto } from './dto/update-dashboard-app.dto';

@Controller('dashboard-app')
export class DashboardAppController {
  private logger = new Logger('dashboard-controller')
  
  constructor(private readonly dashboardAppService: DashboardAppService) {}

  @Post()
  create(@Body() createDashboardAppDto: CreateDashboardAppDto) {
    this.logger.log(createDashboardAppDto)
    return this.dashboardAppService.create(createDashboardAppDto);
  }

  @Get()
  findAll() {
    return this.dashboardAppService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dashboardAppService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDashboardAppDto: UpdateDashboardAppDto) {
    return this.dashboardAppService.update(+id, updateDashboardAppDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.dashboardAppService.remove(+id);
  }
}
