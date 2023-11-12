import { Component, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DashboardAppService } from './dashboard-app.service';
import { IonModal, ModalController } from '@ionic/angular';
import { DashboardAppFormModalComponent } from './modals/dashboard-app-form-modal/dashboard-app-form-modal.component';
import { DashboardApp } from 'interfaces/dashboard-service.interface';
import { ProxmoxService } from './proxmox.service';
import { ProxmoxInfo } from 'interfaces/proxmox-info.interface';
import { tap } from 'rxjs';

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
  proxmoxInfo: ProxmoxInfo
  
  constructor(
    private dashboarAppService: DashboardAppService,
    private proxmoxService: ProxmoxService,
    public modalController: ModalController
  ) { }

  ngOnInit() { 
    this.dashboarAppService.ALL_APPS.subscribe(res => this.allApps = res)
    this.proxmoxService.PROXMOX_INFO.pipe(tap(console.log)).subscribe(res => this.proxmoxInfo = res)
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
