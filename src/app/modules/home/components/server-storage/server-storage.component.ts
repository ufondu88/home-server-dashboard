import { Component, Input, OnInit } from '@angular/core';
import { NodeStorage } from 'interfaces/node-storage.interface';

@Component({
  selector: 'app-server-storage',
  templateUrl: './server-storage.component.html',
  styleUrls: ['./server-storage.component.scss'],
})
export class ServerStorageComponent  implements OnInit {
  @Input() storage: NodeStorage[]

  constructor() { }

  ngOnInit() { }
  
  sortedStorage() {
    return this.storage.sort((a, b) => {
      const nameA = a.storage.toUpperCase(); // ignore upper and lowercase
      const nameB = b.storage.toUpperCase(); // ignore upper and lowercase

      if (nameA < nameB) {
        return -1;
      }

      if (nameA > nameB) {
        return 1;
      }

      // names must be equal
      return 0;
    });
  }
}
