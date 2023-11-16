import { Body, Controller, Delete, Get, Logger, Param, Patch, Post } from '@nestjs/common';
import { IntegrationService } from './dashboard-app.service';
import { CreateIntegrationDto } from './dto/create-dashboard-app.dto';
import { UpdateIntegrationDto } from './dto/update-dashboard-app.dto';

@Controller('dashboard-app')
export class IntegrationController {
  private logger = new Logger('dashboard-controller')

  constructor(private readonly integrationService: IntegrationService) { }

  @Post()
  create(@Body() createIntegrationDto: CreateIntegrationDto) {
    this.logger.log(createIntegrationDto)
    return this.integrationService.create(createIntegrationDto);
  }

  @Get()
  findAll() {
    return this.integrationService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.integrationService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIntegrationDto: UpdateIntegrationDto) {
    return this.integrationService.update(+id, updateIntegrationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.integrationService.remove(+id);
  }
}
