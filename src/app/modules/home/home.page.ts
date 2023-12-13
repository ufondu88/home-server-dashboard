import { Component, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { IonModal, ModalController } from '@ionic/angular';
import { Integration } from 'interfaces/integration.interface';
import { IntegrationService } from './integration.service';
import { IntegrationFormModalComponent } from './modals/dashboard-app-form-modal/dashboard-app-form-modal.component';
import { map, shareReplay } from 'rxjs';
import { API_URL } from 'src/constants';

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
  regularApps: Integration[] = []
  specialApps: Integration[] = []
  selectedSegment = 'custom'

  constructor(
    private integrationService: IntegrationService,
    public modalController: ModalController
  ) { }

  ngOnInit() {
    this.integrationService.ALL_APPS.subscribe(integrations => {
      this.specialApps = integrations.filter(app => 'type' in app)
      this.regularApps = integrations.filter(app => !('type' in app))
    })
  }

  private sortedApps(apps: typeof this.allApps) {
    return apps.sort((appA, appB) => {
      // Check if the "type" property is present
      const hasTypeA = 'type' in appA;
      const hasTypeB = 'type' in appB;

      // Compare based on the presence of "type" property
      if (hasTypeA && !hasTypeB) {
        return 1; // appA comes after appB
      } else if (!hasTypeA && hasTypeB) {
        return -1; // appA comes before appB
      } else {
        // Both objects either have or don't have "type" property
        // Sort by name if both have "type" or both don't have "type"
        return appA.name.localeCompare(appB.name);
      }
    });
  }

  async openFormModal() {
    const modal = await this.modalController.create({
      component: IntegrationFormModalComponent,
      cssClass: "modal"
    });

    modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirm') {
      return this.integrationService.create(data)
    }

    return
  }

  getIconUrl(filename: string) {   
    return `${API_URL}/image/${filename}`
  }

  goToApp(url: string) {
    window.open(url, '_blank'); // open page in new tab
  }
}
