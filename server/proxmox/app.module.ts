import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DashboardAppModule } from './dashboard-app/dashboard-app.module';
import { ProxmoxModule } from './proxmox/proxmox.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    AppModule,
    DashboardAppModule,
    ProxmoxModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
