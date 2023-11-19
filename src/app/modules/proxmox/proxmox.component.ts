import { Component, Input, OnInit, inject } from '@angular/core';
import { LXCContainer } from 'interfaces/container.interface';
import { Integration } from 'interfaces/integration.interface';
import { NodeStorage } from 'interfaces/node-storage.interface';
import { NodeInfo } from 'interfaces/node.interface';
import { VirtualMachine } from 'interfaces/vm.interface';
import { Observable, combineLatest, forkJoin, interval, startWith, switchMap, tap } from 'rxjs';
import { sorted } from '../shared/functions/sort.function';
import { ProxmoxService } from './proxmox.service';
import { objectUptimesAreTheSame, objectArraysAreTheSame } from 'src/constants';

@Component({
  selector: 'app-proxmox',
  templateUrl: './proxmox.component.html',
  styleUrls: ['./proxmox.component.scss'],
})
export class ProxmoxComponent implements OnInit {
  @Input() app: Integration;
  proxmoxUrl: string
  nodes: NodeInfo[]
  vms: { [key: string]: VirtualMachine[] } = {}
  containers: { [key: string]: LXCContainer[] } = {}
  storages: { [key: string]: NodeStorage[] } = {}

  proxmoxService = inject(ProxmoxService)

  constructor() { }

  ngOnInit() {
    this.proxmoxUrl = `https://${this.app.internal_address}:${this.app.port}`

    const id = this.app.id!

    interval(5000).pipe(
      startWith(0),
      switchMap(() => {
        return this.proxmoxService.getNodeSummaries(id).pipe(
          tap(nodes => this.nodes = nodes),
          switchMap(nodes => {
            const vms$: Observable<VirtualMachine[]>[] = []
            const containers$: Observable<LXCContainer[]>[] = []
            const storages$: Observable<NodeStorage[]>[] = []

            nodes.forEach(node => {
              const nodename = node.node

              vms$.push(this.proxmoxService.getNodeVMs(id, nodename).pipe(
                tap(vms => this.checkArrays(vms, nodename, 'vms'))
              ))
              containers$.push(this.proxmoxService.getNodeContainers(id, nodename).pipe(
                tap(containers => this.checkArrays(containers, nodename, 'containers'))
              ))
              storages$.push(this.proxmoxService.getNodeStorage(id, nodename).pipe(
                tap(storages => this.checkArrays(storages, nodename, 'storages'))
              ))
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

  private checkArrays(array: any[], nodename: string, property: string) {
    switch (property) {
      case 'vms':
        if (!(nodename in this.vms) || !objectUptimesAreTheSame(this.vms[nodename], array)) {
          this.vms[nodename] = array
        }
        break;
      case 'containers':
        if (!(nodename in this.containers) || !objectUptimesAreTheSame(this.containers[nodename], array)) {
          this.containers[nodename] = array
        }
        break;
      case 'storages':
        if (!(nodename in this.storages) || !objectArraysAreTheSame(this.storages[nodename], array)) {
          this.storages[nodename] = sorted(array, 'storage')
        }
        break;

      default:
        break;
    }
  }

  goToApp(url: string) {
    window.open(url, '_blank'); // open page in new tab
  }

}
