import { Body, Controller, Delete, Get, Logger, Param, Patch, Post } from '@nestjs/common';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';
import { IntegrationService } from './integration.service';

@Controller('integration')
export class IntegrationController {
  private logger = new Logger('IntegrationController')

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
