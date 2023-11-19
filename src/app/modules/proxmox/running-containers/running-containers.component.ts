import { Component, Input, OnInit, inject } from '@angular/core';
import { LXCContainer } from 'interfaces/container.interface';
import { map } from 'rxjs';
import { sorted } from '../../shared/functions/sort.function';
import { ProxmoxService } from '../proxmox.service';

@Component({
  selector: 'app-running-containers',
  templateUrl: './running-containers.component.html',
  styleUrls: ['./running-containers.component.scss'],
})
export class RunningContainersComponent implements OnInit {
  @Input() containers: LXCContainer[] = []
  sortAscending = true
  proxmoxService = inject(ProxmoxService)

  constructor() { }

  ngOnInit() {
    this.containers = this.containers ? sorted(this.containers, 'name') : []
  }

  trackContainers(index: number, container: LXCContainer) {
    return container
  }

  sort(sortBy: string) {
    this.sortAscending = !this.sortAscending
    return sorted(this.containers, sortBy, this.sortAscending)
  }

}
