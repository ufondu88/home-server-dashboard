import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LXCContainer } from 'interfaces/container.interface';
import { NodeStorage } from 'interfaces/node-storage.interface';
import { NodeInfo } from 'interfaces/node.interface';
import { VirtualMachine } from 'interfaces/vm.interface';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProxmoxService {
  private apiUrl = 'http://localhost:3000/api/proxmox';
  private existingVMs: { [key: string]: VirtualMachine[] } = {}

  private readonly _VMS = new BehaviorSubject<{ [key: string]: VirtualMachine[] }>({})

  // Use readonly to prevent external modification of observables
  readonly VMS: Observable<{ [key: string]: VirtualMachine[] }> = this._VMS.asObservable();

  constructor(private http: HttpClient) { }

  getNodeSummaries(integrationID: string) {
    const url = `${this.apiUrl}?id=${integrationID}`

    return this.http.get<NodeInfo[]>(url)
  }

  getNodeStorage(integrationID: string, nodename: string) {
    const url = `${this.apiUrl}/node/storage?id=${integrationID}&node=${nodename}`

    return this.http.get<NodeStorage[]>(url)
  }

  getNodeVMs(integrationID: string, nodename: string) {
    const url = `${this.apiUrl}/node/vms?id=${integrationID}&node=${nodename}`

    return this.http.get<VirtualMachine[]>(url)
  }

  getNodeContainers(integrationID: string, nodename: string) {
    const url = `${this.apiUrl}/node/containers?id=${integrationID}&node=${nodename}`

    return this.http.get<LXCContainer[]>(url)
  }

  toggleVM(vmid: number, vmname: string, nodename: string, action: string) {
    const url = `${this.apiUrl}/node/vm/toggle/${action}/${vmid}/${vmname}/${nodename}`

    return this.http.post(url, null)
  }

  private objectUptimesAreTheSame(array: any[], comparator: any[]) {
    // Check if the length of both arrays is the same
    if (array.length !== comparator.length) {
      return false;
    }

    // Iterate through array
    for (let i = 0; i < array.length; i++) {
      const obj1 = array[i];

      // Find the corresponding object in comparator based on the "name" property
      const obj2 = comparator.find(item => item.name === obj1.name);

      // If no corresponding object is found or "convertedUptime" values are different, return false
      if (!obj2 || obj1.convertedUptime !== obj2.convertedUptime) {
        return false;
      }

      // If no corresponding object is found or "status" values are different, return false
      if (!obj2 || obj1.status !== obj2.status) {
        return false;
      }
    }

    // If all checks pass, return true
    return true;
  }
}
