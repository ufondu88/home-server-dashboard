import { ProxmoxHttpService } from "../proxmox-http-service.service"

export class ProxmoxHttp {
  constructor(protected http: ProxmoxHttpService) {}

  get(url: string) {
    return this.http.request('get', url)
  }

  put(url: string, object?: any) {
    return this.http.request('put', url, object)
  }

  post(url: string, object?: any) {
    return this.http.request('post', url, object)
  }

  delete(url: string) {
    return this.http.request('delete', url)
  }
}