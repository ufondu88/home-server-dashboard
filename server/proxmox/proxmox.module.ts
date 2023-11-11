import { Module } from '@nestjs/common';
import { ProxmoxService } from './proxmox.service';
import { ProxmoxController } from './proxmox.controller';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule],
  controllers: [ProxmoxController],
  providers: [ProxmoxService],
})
export class ProxmoxModule {}
