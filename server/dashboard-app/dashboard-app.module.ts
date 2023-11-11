import { Module } from '@nestjs/common';
import { DashboardAppService } from './dashboard-app.service';
import { DashboardAppController } from './dashboard-app.controller';

@Module({
  controllers: [DashboardAppController],
  providers: [DashboardAppService],
})
export class DashboardAppModule {}
