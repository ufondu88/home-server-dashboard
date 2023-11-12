import { Component, Input, OnInit } from '@angular/core';
import { LXCContainer } from 'interfaces/container.interface';

@Component({
  selector: 'app-running-containers',
  templateUrl: './running-containers.component.html',
  styleUrls: ['./running-containers.component.scss'],
})
export class RunningContainersComponent  implements OnInit {
  @Input() containers: LXCContainer[]

  constructor() { }

  ngOnInit() {}

}
