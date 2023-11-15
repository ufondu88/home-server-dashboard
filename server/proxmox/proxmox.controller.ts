import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ProxmoxService } from './proxmox.service';

@Controller('proxmox')
export class ProxmoxController {
  constructor(private readonly proxmoxService: ProxmoxService) { }

  @Get()
  findAll() {
    return this.proxmoxService.getAllNodes();
  }

  @Get('containers')
  getAllContainers(@Query('node') node: string) {
    return this.proxmoxService.getAllContainers(node);
  }

  @Get('node/summary')
  getNodeSummary(@Query('node') node: string) {
    return this.proxmoxService.getNodeSummary(node);
  }

  @Get('node/storage')
  getNodeStorage(@Query('node') node: string) {
    return this.proxmoxService.getNodeStorage(node);
  }

  @Get('node/containers')
  getNodeContainers(@Query('node') node: string) {
    return this.proxmoxService.getNodeContainers(node);
  }

  @Get('node/vms')
  getNodeVMs(@Query('node') node: string) {
    return this.proxmoxService.getNodeVMs(node);
  }

  @Post('node/vm/toggle/:action/:vmid/:vmname/:nodename')
  toggleVM(@Param() params: { action: string, vmid: string, vmname: string, nodename: string }) {
    const { action, nodename, vmid, vmname } = params

    return this.proxmoxService.toggleVM(vmid, vmname, nodename, action);
  }
}
