import { PartialType } from '@nestjs/mapped-types';
import { CreateIntegrationDto } from './create-dashboard-app.dto';

export class UpdateIntegrationDto extends PartialType(CreateIntegrationDto) { }
