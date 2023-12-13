import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProxmoxModule } from './proxmox/proxmox.module';
import { IntegrationModule } from './integration/integration.module';
import { ImageModule } from './image/image.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    AppModule,
    IntegrationModule,
    ProxmoxModule,
    ImageModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
