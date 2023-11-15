import { Component, Input, OnInit, inject } from '@angular/core';
import { VirtualMachine } from 'interfaces/vm.interface';
import { map } from 'rxjs';
import { sorted } from '../../functions/sort.function';
import { ProxmoxService } from '../../proxmox.service';

@Component({
  selector: 'app-running-vms',
  templateUrl: './running-vms.component.html',
  styleUrls: ['./running-vms.component.scss'],
})
export class RunningVmsComponent implements OnInit {
  @Input() nodeName: string
  VMs: VirtualMachine[] = []
  sortAscending = true
  proxmoxService = inject(ProxmoxService)

  constructor() { }

  ngOnInit() {
    this.proxmoxService.VMS.pipe(
      map(res => res[this.nodeName])
    ).subscribe(vms => {
      this.VMs = vms ? sorted(vms, 'name') : []
    })
  }

  trackVMs(index: number, vm: VirtualMachine) {
    return vm.pid
  }

  toggleVM(vm: VirtualMachine) {
    const action = vm.status == 'running' ? 'shutdown' : 'start'
    
    this.proxmoxService.toggleVM(vm.vmid, vm.name, this.nodeName, action)
  }

  sort(sortBy: string) {
    this.sortAscending = !this.sortAscending

    return sorted(this.VMs, sortBy, this.sortAscending)
  }

}
