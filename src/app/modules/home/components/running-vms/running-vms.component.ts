import { Component, Input, OnInit } from '@angular/core';
import { VirtualMachine } from 'interfaces/vm.interface';

@Component({
  selector: 'app-running-vms',
  templateUrl: './running-vms.component.html',
  styleUrls: ['./running-vms.component.scss'],
})
export class RunningVmsComponent implements OnInit {
  @Input() VMs: VirtualMachine[]

  constructor() { }

  ngOnInit() {}

}
