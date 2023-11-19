import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LXCContainer } from 'interfaces/container.interface';
import { NodeStorage } from 'interfaces/node-storage.interface';
import { NodeInfo } from 'interfaces/node.interface';
import { ProxmoxInfo } from 'interfaces/proxmox-info.interface';
import { VirtualMachine } from 'interfaces/vm.interface';
import { BehaviorSubject, Observable, combineLatest, forkJoin, interval, startWith, switchMap, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProxmoxService {
  private apiUrl = 'http://localhost:3000/api/proxmox';
  proxmoxInfo: ProxmoxInfo;
  private existingVMs: { [key: string]: VirtualMachine[] } = {}
  private existingContainers: { [key: string]: LXCContainer[] } = {}
  private existingStorages: { [key: string]: NodeStorage[] } = {}

  private readonly _NODES_INFO = new BehaviorSubject<NodeInfo[]>([]);
  private readonly _VMS = new BehaviorSubject<{ [key: string]: VirtualMachine[] }>({})
  private readonly _CONTAINERS = new BehaviorSubject<{ [key: string]: LXCContainer[] }>({})
  private readonly _STORAGES = new BehaviorSubject<{ [key: string]: NodeStorage[] }>({})

  // Use readonly to prevent external modification of observables
  readonly NODES_INFO: Observable<NodeInfo[]> = this._NODES_INFO.asObservable();
  readonly VMS: Observable<{ [key: string]: VirtualMachine[] }> = this._VMS.asObservable();
  readonly CONTAINERS: Observable<{ [key: string]: LXCContainer[] }> = this._CONTAINERS.asObservable();
  readonly STORAGES: Observable<{ [key: string]: NodeStorage[] }> = this._STORAGES.asObservable();

  constructor(private http: HttpClient) {
    // this.getNodeSummaries()
  }

  getNodeSummariesForIntegration(id: string) {
    const url = `${this.apiUrl}?id=${id}`

    return this.http.get<NodeInfo[]>(url)
  }

  private getNodeSummaries() {
    // console.log("Getting Proxmox info")

    interval(5000).pipe(
      startWith(0),
      switchMap(() => {
        return this.http.get<NodeInfo[]>(this.apiUrl).pipe(
          tap(res => this._NODES_INFO.next(res)),
          switchMap(nodes => {
            const vms$: Observable<VirtualMachine[]>[] = []
            const containers$: Observable<LXCContainer[]>[] = []
            const storages$: Observable<NodeStorage[]>[] = []

            nodes.forEach(node => {
              const nodename = node.node

              vms$.push(this.getNodeVMs(nodename))
              containers$.push(this.getNodeContainers(nodename))
              storages$.push(this.getNodeStorage(nodename))
            })

            const vmsForkJoin$ = combineLatest(vms$)
            const containersForkJoin$ = combineLatest(containers$)
            const storagesForkJoin$ = combineLatest(storages$)

            // Use forkJoin to wait for all observables to complete
            return forkJoin([vmsForkJoin$, containersForkJoin$, storagesForkJoin$])
          })
        )
      }),
    ).subscribe()
  }

  getNodeStorageForIntegration(id: string, nodename: string) {
    const url = `${this.apiUrl}/node/storage?id=${id}&node=${nodename}`

    return this.http.get<NodeStorage[]>(url)
  }

  private getNodeStorage(nodename: string) {
    const url = `${this.apiUrl}/node/storage?node=${nodename}`

    return this.http.get<NodeStorage[]>(url).pipe(
      tap(storages => {
        if (!(nodename in this.existingStorages) || !this.objectArraysAreTheSame(this.existingStorages[nodename], storages)) {
          this.existingStorages[nodename] = storages

          this._STORAGES.next(this.existingStorages)
        }
      })
    )
  }

  getNodeVMsForIntegration(id: string, nodename: string) {
    const url = `${this.apiUrl}/node/vms?id=${id}&node=${nodename}`

    return this.http.get<VirtualMachine[]>(url)
  }

  private getNodeVMs(nodename: string) {
    // console.log(`Getting VM info for ${nodename}`)

    const url = `${this.apiUrl}/node/vms?node=${nodename}`

    return this.http.get<VirtualMachine[]>(url).pipe(
      tap(vms => {
        if (!(nodename in this.existingVMs) || !this.objectUptimesAreTheSame(this.existingVMs[nodename], vms)) {
          this.existingVMs[nodename] = vms

          this._VMS.next(this.existingVMs)
        }
      })
    )
  }

  getNodeContainersForIntegration(id: string, nodename: string) {
    const url = `${this.apiUrl}/node/containers?id=${id}&node=${nodename}`

    return this.http.get<LXCContainer[]>(url)
  }

  private getNodeContainers(nodename: string) {
    // console.log(`Getting container info for ${nodename}`)

    const url = `${this.apiUrl}/node/containers?node=${nodename}`

    return this.http.get<LXCContainer[]>(url).pipe(
      tap(containers => {
        if (!(nodename in this.existingContainers) || !this.objectUptimesAreTheSame(this.existingContainers[nodename], containers)) {
          this.existingContainers[nodename] = containers

          this._CONTAINERS.next(this.existingContainers)
        }
      })
    )
  }

  toggleVM(vmid: number, vmname: string, nodename: string, action: string) {
    const url = `${this.apiUrl}/node/vm/toggle/${action}/${vmid}/${vmname}/${nodename}`

    this.http.post(url, null).subscribe(res => {
      this.getNodeVMs(nodename)
    })
  }

  private objectArraysAreTheSame(array: any[], comparator: any[]) {
    // Check if the length of both arrays is the same
    if (array.length !== comparator.length) {
      return false;
    }

    // Check if every object in array exists in comparator
    return array.every(obj1 => comparator.some(obj2 => JSON.stringify(obj1) === JSON.stringify(obj2)));
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
