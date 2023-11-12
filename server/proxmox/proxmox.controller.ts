import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProxmoxService } from './proxmox.service';
import { CreateProxmoxDto } from './dto/create-proxmox.dto';
import { UpdateProxmoxDto } from './dto/update-proxmox.dto';

@Controller('proxmox')
export class ProxmoxController {
  constructor(private readonly proxmoxService: ProxmoxService) { }

  @Post()
  create(@Body() createProxmoxDto: CreateProxmoxDto) {
    return this.proxmoxService.create(createProxmoxDto);
  }

  @Get()
  findAll() {
    return this.proxmoxService.findAll();
  }

  @Get('containers')
  getAllContainers(@Query('node') node: string) {
    return this.proxmoxService.getAllContainers(node);
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.proxmoxService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProxmoxDto: UpdateProxmoxDto) {
    return this.proxmoxService.update(+id, updateProxmoxDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.proxmoxService.remove(+id);
  }
}
