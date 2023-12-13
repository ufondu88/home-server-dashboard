import { Injectable, Logger } from '@nestjs/common';
import { Observable, catchError, map, of, retry, tap } from 'rxjs';
import { ProxmoxHttp } from './classes/proxmox-http.class';
import { ProxmoxHttpService } from './proxmox-http-service.service';
import { LXCContainer } from 'interfaces/container.interface';
import { NodeStorage } from 'interfaces/node-storage.interface';
import { NodeInfo } from 'interfaces/node.interface';
import { VirtualMachine } from 'interfaces/vm.interface';
import { Time } from 'interfaces/time.interface';

@Injectable()
export class ProxmoxService extends ProxmoxHttp {
  private logger = new Logger('ProxmoxService')


  domain = "https://192.168.86.53:8006/api2/json"

  containers: LXCContainer[] = []
  vms: VirtualMachine[] = []
  nodes: NodeInfo[] = []

  constructor(http: ProxmoxHttpService) {
    super(http)
  }

  getAllContainers(id: string, nodename: string): Observable<LXCContainer[]> {
    this.logger.log(`Getting all containers for node ${nodename}`)

    const url = `${this.domain}/nodes/${nodename}/lxc`

    return this.get(url, id).pipe(
      tap((containers: LXCContainer[]) => this.containers = containers)
    )
  }

  getAllVMs(id: string, nodename: string) {
    this.logger.log(`Getting all VMs for node ${nodename}`)

    const url = `${this.domain}/nodes/${nodename}/qemu`

    return this.get(url, id).pipe(
      tap((vms: VirtualMachine[]) => this.vms = vms),
      map(vms => {
        vms.forEach(vm => vm.node = nodename)

        return vms
      })
    )
  }

  getAllNodes(id: string) {
    this.logger.log(`Getting all nodes for ${id}`)

    const url = `${this.domain}/nodes`

    return this.get(url, id).pipe(
      map((nodes: NodeInfo[]) => {
        if (nodes) {
          nodes.forEach(node => {
            node.cpu = +(node.cpu * 100).toFixed(2)
          })
          return nodes
        }
      }),
      retry(2),
      catchError(res => {
        this.logger.error(res)
        return of({ message: res.message, status: 500 })
      }),
    );
  }

  getNodeSummary(id: string, nodename: string) {
    this.logger.log(`Getting node summary for node ${nodename}`)

    const url = `${this.domain}/nodes/${nodename}`

    return this.get(url, id)
  }

  getNodeStorage(id: string, nodename: string) {
    this.logger.log(`Getting storage info for node ${nodename}`)

    const url = `${this.domain}/nodes/${nodename}/storage`

    return this.get(url, id).pipe(
      map((storages: NodeStorage[]) => {
        storages.forEach(storage => storage.node = nodename)

        return storages
      })
    )
  }

  getNodeVMs(id: string, nodename: string) {
    this.logger.log(`Getting VM info for node ${nodename}`)

    const url = `${this.domain}/nodes/${nodename}/qemu`

    return this.get(url, id).pipe(
      map((vms: VirtualMachine[]) => {
        vms.forEach(vm => {
          vm.node = nodename
          vm.convertedUptime = this.convertSeconds(vm.uptime)
        })

        return vms
      })
    )
  }

  getNodeContainers(id: string, nodename: string) {
    this.logger.log(`Getting container info for node ${nodename}`)

    const url = `${this.domain}/nodes/${nodename}/lxc`

    return this.get(url, id).pipe(
      map((containers: LXCContainer[]) => {
        containers.forEach(container => {
          container.node = nodename
          container.convertedUptime = this.convertSeconds(container.uptime)
        })

        return containers
      })
    )
  }

  toggleVM(vmid: string, vmname: string, nodename: string, action: string) {
    if (action == 'shutdown') {
      this.logger.warn(`Shutting down VM ${vmname} in ${nodename}`)
    } else {
      this.logger.warn(`Starting VM ${vmname} in ${nodename}`)
    }

    const url = `${this.domain}/nodes/${nodename}/qemu/${vmid}/status/${action}`

    return this.post(url, null)
  }

  convertSeconds(seconds: number, format = "vm") {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const time: Time = {
      days,
      hours,
      minutes,
      seconds: remainingSeconds
    }

    return this.formatUptime(time, format);
  }

  formatUptime(time: Time, type: string) {
    const { days, hours, minutes, seconds } = time;

    const formatValue = (value: number, unit: string) => `${value} ${value === 1 ? unit : unit + 's'}`;

    switch (type) {
      case 'full':
        if (days == 0) {
          if (hours == 0) {
            if (minutes == 0) {
              return formatValue(seconds, 'second')
            } else {
              return `${formatValue(minutes, 'minute')} and ${formatValue(seconds, 'second')}`
            }
          } else {
            return `${formatValue(hours, 'hour')} ${formatValue(minutes, 'minute')} and ${formatValue(seconds, 'second')}`
          }
        } else {
          return `${formatValue(days, 'day')} ${formatValue(hours, 'hour')} ${formatValue(minutes, 'minute')} and ${formatValue(seconds, 'second')}`
        }

      case 'vm':
        if (days == 0) {
          if (hours == 0) {
            if (minutes == 0) {
              return formatValue(seconds, 'second')
            } else {
              return `${formatValue(minutes, 'minute')} and ${formatValue(seconds, 'second')}`
            }
          } else {
            return `${formatValue(hours, 'hour')} and ${formatValue(minutes, 'minute')}`
          }
        } else {
          return `${formatValue(days, 'day')} and ${formatValue(hours, 'hour')}`
        }
      default:
        return `${formatValue(days, 'day')} ${formatValue(hours, 'hour')} ${formatValue(minutes, 'minute')} and ${formatValue(seconds, 'second')}`
    }
  }
}
