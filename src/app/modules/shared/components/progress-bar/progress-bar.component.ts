import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
})
export class ProgressBarComponent  implements OnInit {
  @Input() value: number = 0;
  @Input() backgroundColor: string = '#4caf50';
  @Input() containerHeight: string = '16px';

  
  constructor() { }

  ngOnInit() {}

}
