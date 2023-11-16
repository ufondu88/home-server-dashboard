import { Component, OnInit, inject } from '@angular/core';
import { NodeInfo } from 'interfaces/node.interface';
import { ProxmoxService } from './proxmox.service';

@Component({
  selector: 'app-proxmox',
  templateUrl: './proxmox.component.html',
  styleUrls: ['./proxmox.component.scss'],
})
export class ProxmoxComponent implements OnInit {
  proxmoxUrl = 'https://192.168.86.53:8006'
  nodes: NodeInfo[]
  proxmoxService = inject(ProxmoxService)

  constructor() { }

  ngOnInit() { 
    this.proxmoxService.NODES_INFO.subscribe(res => this.nodes = res)
  }
  
  goToApp(url: string) {
    window.open(url, '_blank'); // open page in new tab
  }

}
