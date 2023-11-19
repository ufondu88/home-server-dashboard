import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ProxmoxService } from './proxmox.service';

@Controller('proxmox')
export class ProxmoxController {
  constructor(private readonly proxmoxService: ProxmoxService) { }

  @Get()
  findAll(@Query('id') id: string) {
    return this.proxmoxService.getAllNodes(id);
  }

  @Get('containers')
  getAllContainers(@Query() query: { node: string, id: string }) {
    const { id, node } = query

    return this.proxmoxService.getAllContainers(id, node);
  }

  @Get('node/summary')
  getNodeSummary(@Query() query: { node: string, id: string }) {
    const { id, node } = query

    return this.proxmoxService.getNodeSummary(id, node);
  }

  @Get('node/storage')
  getNodeStorage(@Query() query: { node: string, id: string }) {
    const { id, node } = query

    return this.proxmoxService.getNodeStorage(id, node);
  }

  @Get('node/containers')
  getNodeContainers(@Query() query: { node: string, id: string }) {
    const { id, node } = query

    return this.proxmoxService.getNodeContainers(id, node);
  }

  @Get('node/vms')
  getNodeVMs(@Query() query: { node: string, id: string }) {
    const { id, node } = query

    return this.proxmoxService.getNodeVMs(id, node);
  }

  @Post('node/vm/toggle/:action/:vmid/:vmname/:nodename')
  toggleVM(@Param() params: { action: string, vmid: string, vmname: string, nodename: string }) {
    const { action, nodename, vmid, vmname } = params

    return this.proxmoxService.toggleVM(vmid, vmname, nodename, action);
  }
}
