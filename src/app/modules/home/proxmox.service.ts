import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LXCContainer } from 'interfaces/container.interface';
import { NodeStorage } from 'interfaces/node-storage.interface';
import { ProxmoxInfo } from 'interfaces/proxmox-info.interface';
import { VirtualMachine } from 'interfaces/vm.interface';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProxmoxService {
  private apiUrl = 'http://localhost:3000/api/proxmox';
  proxmoxInfo: ProxmoxInfo;

  private readonly _PROXMOX_INFO = new BehaviorSubject<ProxmoxInfo>({nodes: [], vms: [], containers: []});

  // Use readonly to prevent external modification of observables
  readonly PROXMOX_INFO: Observable<ProxmoxInfo> = this._PROXMOX_INFO.asObservable();

  constructor(private http: HttpClient) { 
    this.getProxmoxInfo()
  }

  getProxmoxInfo() {
    console.log("Getting Proxmox info")
    
    return this.http.get<ProxmoxInfo>(this.apiUrl).subscribe(res => this._PROXMOX_INFO.next(res))
  }
  
  getNodeStorage(nodeName: string) {
    console.log(`Getting storage info for ${nodeName}`)

    const url = `${this.apiUrl}/node/storage?node=${nodeName}`
    
    return this.http.get<NodeStorage[]>(url)
  }
  
  getNodeVMs(nodeName: string) {
    console.log(`Getting VM info for ${nodeName}`)
  
    const url = `${this.apiUrl}/node/vms?node=${nodeName}`
    
    return this.http.get<VirtualMachine[]>(url)
  }

  getNodeContainers(nodeName: string) {
    console.log(`Getting container info for ${nodeName}`)

    const url = `${this.apiUrl}/node/containers?node=${nodeName}`

    return this.http.get<LXCContainer[]>(url)
  }
}
