import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HttpClientModule } from '@angular/common/http';
import { ProxmoxModule } from '../proxmox/proxmox.module';
import { HomePageRoutingModule } from './home-routing.module';
import { IntegrationService } from './integration.service';
import { CustomIntegrationComponent } from './modals/dashboard-app-form-modal/custom-integration/custom-integration.component';
import { IntegrationFormModalComponent } from './modals/dashboard-app-form-modal/dashboard-app-form-modal.component';
import { SupportedIntegrationComponent } from './modals/dashboard-app-form-modal/supported-integration/supported-integration.component';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';
import { CreateProxmoxComponent } from './modals/dashboard-app-form-modal/supported-integration/components/create-proxmox/create-proxmox.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    HomePageRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    ProxmoxModule,
    SharedModule
  ],
  declarations: [
    HomePage,
    CreateProxmoxComponent,
    IntegrationFormModalComponent,
    CustomIntegrationComponent,
    SupportedIntegrationComponent,
  ],
  providers: [IntegrationService]
})
export class HomePageModule { }
