import { Component, Input, OnInit, inject } from '@angular/core';
import { LXCContainer } from 'interfaces/container.interface';
import { sorted } from '../../functions/sort.function';
import { ProxmoxService } from '../../proxmox.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-running-containers',
  templateUrl: './running-containers.component.html',
  styleUrls: ['./running-containers.component.scss'],
})
export class RunningContainersComponent  implements OnInit {
  @Input() nodeName: string
  containers: LXCContainer[] = []
  sortAscending = true
  proxmoxService = inject(ProxmoxService)

  constructor() { }

  ngOnInit() {
    this.proxmoxService.CONTAINERS.pipe(
      map(res => res[this.nodeName])
    ).subscribe(containers => {
      this.containers = containers ? sorted(containers, 'name') : []
    })
  }
  
  trackContainers(index: number, container: LXCContainer) {
    return container
  }

  sort(sortBy: string) {
    this.sortAscending = !this.sortAscending
    return sorted(this.containers, sortBy, this.sortAscending)
  }

}
