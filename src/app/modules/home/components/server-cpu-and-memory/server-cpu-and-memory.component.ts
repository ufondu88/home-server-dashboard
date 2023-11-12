import { Component, Input, OnInit } from '@angular/core';
import { NodeInfo } from 'interfaces/node.interface';

@Component({
  selector: 'app-server-cpu-and-memory',
  templateUrl: './server-cpu-and-memory.component.html',
  styleUrls: ['./server-cpu-and-memory.component.scss'],
})
export class ServerCpuAndMemoryComponent  implements OnInit {
  @Input() node: NodeInfo
  constructor() { }

  ngOnInit() {}

}
