import { Component, Input, OnInit, inject } from '@angular/core';
import { VirtualMachine } from 'interfaces/vm.interface';
import { sorted } from '../../shared/functions/sort.function';
import { ProxmoxService } from '../proxmox.service';

@Component({
  selector: 'app-running-vms',
  templateUrl: './running-vms.component.html',
  styleUrls: ['./running-vms.component.scss'],
})
export class RunningVmsComponent implements OnInit {
  @Input() VMs: VirtualMachine[] = []
  sortAscending = true
  proxmoxService = inject(ProxmoxService)

  constructor() { }

  ngOnInit() {
    this.VMs = this.VMs ? sorted(this.VMs, 'name') : []
  }

  trackVMs(index: number, vm: VirtualMachine) {
    return vm.pid
  }

  toggleVM(vm: VirtualMachine) {
    const action = vm.status == 'running' ? 'shutdown' : 'start'

    // this.proxmoxService.toggleVM(vm.vmid, vm.name, this.nodename, action)
  }

  sort(sortBy: string) {
    this.sortAscending = !this.sortAscending

    return sorted(this.VMs, sortBy, this.sortAscending)
  }

}
