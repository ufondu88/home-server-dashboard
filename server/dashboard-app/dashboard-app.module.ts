import { Module } from '@nestjs/common';
import { IntegrationController } from './dashboard-app.controller';
import { IntegrationService } from './dashboard-app.service';

@Module({
  controllers: [IntegrationController],
  providers: [IntegrationService],
})
export class IntegrationModule { }
