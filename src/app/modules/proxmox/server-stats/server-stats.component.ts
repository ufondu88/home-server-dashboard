import { Component, Input, OnInit } from '@angular/core';
import { NodeInfo } from 'interfaces/node.interface';

@Component({
  selector: 'app-server-stats',
  templateUrl: './server-stats.component.html',
  styleUrls: ['./server-stats.component.scss'],
})
export class ServerStatsComponent implements OnInit {
  @Input() node: NodeInfo
  nodename: string

  constructor() { }

  ngOnInit() {
    this.nodename = this.node.node
  }

}
