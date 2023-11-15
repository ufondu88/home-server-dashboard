import { Component, Input, OnInit } from '@angular/core';
import { NodeInfo } from 'interfaces/node.interface';

@Component({
  selector: 'app-server-stats',
  templateUrl: './server-stats.component.html',
  styleUrls: ['./server-stats.component.scss'],
})
export class ServerStatsComponent implements OnInit {
  @Input() node: NodeInfo
  nodeName: string

  constructor() {}
  
  ngOnInit() {    
    this.nodeName = this.node.node
  }

}
