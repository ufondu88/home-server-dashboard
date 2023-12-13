import { Component, Input, OnInit, inject } from '@angular/core';
import { NodeStorage } from 'interfaces/node-storage.interface';
import { getItemColor } from 'src/constants';
import { ProxmoxService } from '../proxmox.service';

@Component({
  selector: 'app-server-storage',
  templateUrl: './server-storage.component.html',
  styleUrls: ['./server-storage.component.scss'],
})
export class ServerStorageComponent implements OnInit {
  @Input() storage: NodeStorage[]
  sortAscending = true
  proxmoxService = inject(ProxmoxService)
  getItemColor = getItemColor

  constructor() { }

  ngOnInit() {
  }

  trackStorage(index: number, storage: NodeStorage) {
    return storage
  }

  
}
