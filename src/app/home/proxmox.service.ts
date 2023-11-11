import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ProxmoxInfo } from 'interfaces/proxmox-info.interface';
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
}
