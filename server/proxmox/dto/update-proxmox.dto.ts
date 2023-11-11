import { PartialType } from '@nestjs/mapped-types';
import { CreateProxmoxDto } from './create-proxmox.dto';

export class UpdateProxmoxDto extends PartialType(CreateProxmoxDto) {}
