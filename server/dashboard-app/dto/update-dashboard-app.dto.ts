import { PartialType } from '@nestjs/mapped-types';
import { CreateDashboardAppDto } from './create-dashboard-app.dto';

export class UpdateDashboardAppDto extends PartialType(CreateDashboardAppDto) {}
