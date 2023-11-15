import { Component, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IonModal, ModalController } from '@ionic/angular';
import { DashboardApp } from 'interfaces/dashboard-service.interface';
import { ProxmoxInfo } from 'interfaces/proxmox-info.interface';
import { tap } from 'rxjs';
import { DashboardAppService } from './dashboard-app.service';
import { DashboardAppFormModalComponent } from './modals/dashboard-app-form-modal/dashboard-app-form-modal.component';
import { ProxmoxService } from './proxmox.service';
import { NodeInfo } from 'interfaces/node.interface';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild(IonModal) modal: IonModal;
  serviceForm: FormGroup;
  formOpen = false;
  allApps: DashboardApp[] = []
  proxmoxUrl = 'https://192.168.86.53:8006'
  nodes: NodeInfo[]

  constructor(
    private dashboarAppService: DashboardAppService,
    private proxmoxService: ProxmoxService,
    public modalController: ModalController
  ) { }

  ngOnInit() {
    this.dashboarAppService.ALL_APPS.subscribe(res => this.allApps = res)
    this.proxmoxService.NODES_INFO.subscribe(res => this.nodes = res)
  }

  async openFormModal() {
    const modal = await this.modalController.create({
      component: DashboardAppFormModalComponent,
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      console.log('sending data to service')
      return this.dashboarAppService.create(data)
    }

    return
  }

  goToApp(url: string) {
    window.open(url, '_blank'); // open page in new tab
  }

}
