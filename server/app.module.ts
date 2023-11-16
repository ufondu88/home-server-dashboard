import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { IntegrationModule } from './dashboard-app/dashboard-app.module';
import { ProxmoxModule } from './proxmox/proxmox.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    AppModule,
    IntegrationModule,
    ProxmoxModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
