import { Component, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IonModal, ModalController } from '@ionic/angular';
import { Integration } from 'interfaces/integration.interface';
import { NodeInfo } from 'interfaces/node.interface';
import { ProxmoxService } from '../proxmox/proxmox.service';
import { IntegrationService } from './integration.service';
import { IntegrationFormModalComponent } from './modals/dashboard-app-form-modal/dashboard-app-form-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild(IonModal) modal: IonModal;
  serviceForm: FormGroup;
  formOpen = false;
  allApps: Integration[] = []
  selectedSegment = 'custom'

  constructor(
    private dashboarAppService: IntegrationService,
    public modalController: ModalController
  ) { }

  ngOnInit() {
    this.dashboarAppService.ALL_APPS.subscribe(res => this.allApps = res)
  }

  async openFormModal() {
    const modal = await this.modalController.create({
      component: IntegrationFormModalComponent,
      cssClass: "modal"
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      return this.dashboarAppService.create(data)
    }

    return
  }

  goToApp(url: string) {
    window.open(url, '_blank'); // open page in new tab
  }
}
