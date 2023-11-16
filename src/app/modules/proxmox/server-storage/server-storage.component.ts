import { Component, Input, OnInit, inject } from '@angular/core';
import { NodeStorage } from 'interfaces/node-storage.interface';
import { map } from 'rxjs';
import { sorted } from '../../shared/functions/sort.function';
import { ProxmoxService } from '../proxmox.service';

@Component({
  selector: 'app-server-storage',
  templateUrl: './server-storage.component.html',
  styleUrls: ['./server-storage.component.scss'],
})
export class ServerStorageComponent implements OnInit {
  @Input() nodeName: string
  storage: NodeStorage[]
  sortAscending = true
  proxmoxService = inject(ProxmoxService)

  constructor() { }

  ngOnInit() {
    this.proxmoxService.STORAGES.pipe(
      map(res => res[this.nodeName])
    ).subscribe(storage => {
      this.storage = storage ? sorted(storage, 'storage') : []
    })
  }

  trackStorage(index: number, storage: NodeStorage) {
    return storage
  }
}
