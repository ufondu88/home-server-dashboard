import { Injectable, Logger } from '@nestjs/common';
import { Observable, combineLatest, forkJoin, map, switchMap, tap } from 'rxjs';
import { ProxmoxHttpService } from './proxmox-http-service.service';
import { ProxmoxHttp } from './classes/proxmox-http.class';
import { LXCContainer } from 'interfaces/container.interface';
import { NodeInfo } from 'interfaces/node.interface';
import { VirtualMachine } from 'interfaces/vm.interface';
import { NodeStorage } from 'interfaces/node-storage.interface';
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

  findAll() {
    return this.getAllNodes().pipe(
      switchMap(nodes => {
        this.nodes = nodes;

        const vms$: Observable<VirtualMachine[]>[] = []
        const containers$: Observable<LXCContainer[]>[] = []

        nodes.forEach(node => {
          const nodeName = node.node

          vms$.push(this.getAllVMs(nodeName))
          containers$.push(this.getAllContainers(nodeName))
        })

        const vmsForkJoin$ = combineLatest(vms$)
        const containersForkJoin$ = combineLatest(containers$)

        // Use forkJoin to wait for all observables to complete
        return forkJoin([vmsForkJoin$, containersForkJoin$])
      }),
      map((res: [VirtualMachine[][], LXCContainer[][]]) => {
        const vms = res[0][0]
        const containers = res[1][0]

        this.logger.log(vms)

        return { nodes: this.nodes, vms, containers }
      })
    )
  }

  getAllContainers(nodeName: string) {
    this.logger.log(`Getting all containers for node ${nodeName}`)

    const url = `${this.domain}/nodes/${nodeName}/lxc`

    return this.get(url)!.pipe(
      tap((containers: LXCContainer[]) => this.containers = containers)
    )
  }

  getAllVMs(nodeName: string) {
    this.logger.log(`Getting all VMs for node ${nodeName}`)

    const url = `${this.domain}/nodes/${nodeName}/qemu`

    return this.get(url)!.pipe(
      tap((vms: VirtualMachine[]) => this.vms = vms),
      map(vms => {
        vms.forEach(vm => vm.node = nodeName)

        return vms
      })
    )
  }

  getAllNodes() {
    this.logger.log('Getting all nodes')

    const url = `${this.domain}/nodes`

    return this.get(url)!.pipe(
      map((nodes: NodeInfo[]) => {
        nodes.forEach(node => {
          node.cpu = +(node.cpu * 100).toFixed(2)
        })

        return nodes
      })
    );
  }

  getNodeSummary(nodeName: string) {
    this.logger.log(`Getting node summary for node ${nodeName}`)

    const url = `${this.domain}/nodes/${nodeName}`

    return this.get(url)
  }

  getNodeStorage(nodeName: string) {
    this.logger.log(`Getting storage info for node ${nodeName}`)

    const url = `${this.domain}/nodes/${nodeName}/storage`

    return this.get(url)!.pipe(
      map((storages: NodeStorage[]) => {
        storages.forEach(storage => storage.node = nodeName)

        return storages
      })
    )
  }

  getNodeVMs(nodeName: string) {
    this.logger.log(`Getting VM info for node ${nodeName}`)

    const url = `${this.domain}/nodes/${nodeName}/qemu`

    return this.get(url)!.pipe(
      map((vms: VirtualMachine[]) => {
        vms.forEach(vm => {
          vm.node = nodeName
          vm.convertedUptime = convertSeconds(vm.uptime)
        })

        return vms
      })
    )
  }

  getNodeContainers(nodeName: string) {
    this.logger.log(`Getting container info for node ${nodeName}`)

    const url = `${this.domain}/nodes/${nodeName}/lxc`

    return this.get(url)!.pipe(
      map((containers: LXCContainer[]) => {
        containers.forEach(container => {
          container.node = nodeName
          container.convertedUptime = convertSeconds(container.uptime)
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
}

function convertSeconds(seconds: number, format = "vm") {
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

  return formatUptime(time, format);
}

function formatUptime(time: Time, type: string) {
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