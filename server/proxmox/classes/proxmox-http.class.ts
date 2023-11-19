import { ProxmoxHttpService } from "../proxmox-http-service.service"

export class ProxmoxHttp {
  constructor(protected http: ProxmoxHttpService) { }

  get(url: string, id: string) {
    return this.http.request('get', url, id)
  }

  put(url: string, id: string, object?: any) {
    return this.http.request('put', url, object)
  }

  post(url: string, id: string | null, object?: any) {
    return this.http.request('post', url, object)
  }

  delete(url: string, id: string) {
    return this.http.request('delete', url, id)
  }
}