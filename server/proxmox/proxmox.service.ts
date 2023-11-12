import { Injectable, Logger } from '@nestjs/common';
import { CreateProxmoxDto } from './dto/create-proxmox.dto';
import { UpdateProxmoxDto } from './dto/update-proxmox.dto';
import { Observable, combineLatest, forkJoin, map, switchMap, tap } from 'rxjs';
import { ProxmoxHttpService } from './proxmox-http-service.service';
import { ProxmoxHttp } from './classes/proxmox-http.class';
import { LXCContainer } from 'interfaces/container.interface';
import { NodeInfo } from 'interfaces/node.interface';
import { VirtualMachine } from 'interfaces/vm.interface';

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

  create(createProxmoxDto: CreateProxmoxDto) {
    return 'This action adds a new proxmox';
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
      tap((vms: VirtualMachine[]) => this.vms = vms)
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

  getNodeStorage(nodeName: string) {
    this.logger.log(`Getting storage info for node ${nodeName}`)

    const url = `${this.domain}/nodes/${nodeName}/storage`

    return this.get(url)!
  }

  getNodeVMs(nodeName: string) {
    this.logger.log(`Getting VM info for node ${nodeName}`)

    const url = `${this.domain}/nodes/${nodeName}/qemu`

    return this.get(url)!
  }

  getNodeContainers(nodeName: string) {
    this.logger.log(`Getting container info for node ${nodeName}`)

    const url = `${this.domain}/nodes/${nodeName}/lxc`

    return this.get(url)!
  }

  findOne(id: number) {
    return `This action returns a #${id} proxmox`;
  }

  update(id: number, updateProxmoxDto: UpdateProxmoxDto) {
    return `This action updates a #${id} proxmox`;
  }

  remove(id: number) {
    return `This action removes a #${id} proxmox`;
  }
}
