import { Component, Input, OnInit } from '@angular/core';
import { NodeInfo } from 'interfaces/node.interface';
import { ProxmoxService } from '../../proxmox.service';
import { NodeStorage } from 'interfaces/node-storage.interface';
import { VirtualMachine } from 'interfaces/vm.interface';
import { LXCContainer } from 'interfaces/container.interface';

@Component({
  selector: 'app-server-stats',
  templateUrl: './server-stats.component.html',
  styleUrls: ['./server-stats.component.scss'],
})
export class ServerStatsComponent implements OnInit {
  @Input() node: NodeInfo
  storageInfo: NodeStorage[] = []
  VMs: VirtualMachine[] = []
  containers: LXCContainer[] = []

  constructor(private proxmoxService: ProxmoxService) {    
  }
  
  ngOnInit() {    
    this.proxmoxService.getNodeStorage(this.node.node).subscribe(res => {
      this.storageInfo = res      
    })

    this.proxmoxService.getNodeVMs(this.node.node).subscribe(res => this.VMs = res)

    this.proxmoxService.getNodeContainers(this.node.node).subscribe(res => this.containers = res)

  }

}
