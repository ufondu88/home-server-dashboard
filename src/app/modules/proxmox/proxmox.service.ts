import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LXCContainer } from 'interfaces/container.interface';
import { NodeStorage } from 'interfaces/node-storage.interface';
import { NodeInfo } from 'interfaces/node.interface';
import { VirtualMachine } from 'interfaces/vm.interface';
import { PROXMOX_API_URL } from 'src/constants';

@Injectable({
  providedIn: 'root'
})
export class ProxmoxService {

  constructor(private http: HttpClient) { }

  getNodeSummaries(integrationID: string) {
    const url = `${PROXMOX_API_URL}?id=${integrationID}`

    return this.http.get<NodeInfo[]>(url)
  }

  getNodeStorage(integrationID: string, nodename: string) {
    const url = `${PROXMOX_API_URL}/node/storage?id=${integrationID}&node=${nodename}`

    return this.http.get<NodeStorage[]>(url)
  }

  getNodeVMs(integrationID: string, nodename: string) {
    const url = `${PROXMOX_API_URL}/node/vms?id=${integrationID}&node=${nodename}`

    return this.http.get<VirtualMachine[]>(url)
  }

  getNodeContainers(integrationID: string, nodename: string) {
    const url = `${PROXMOX_API_URL}/node/containers?id=${integrationID}&node=${nodename}`

    return this.http.get<LXCContainer[]>(url)
  }

  toggleVM(vmid: number, vmname: string, nodename: string, action: string) {
    const url = `${PROXMOX_API_URL}/node/vm/toggle/${action}/${vmid}/${vmname}/${nodename}`

    return this.http.post(url, null)
  }
}
