import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { DashboardAppService } from './dashboard-app.service';
import { DashboardAppFormModalComponent } from './modals/dashboard-app-form-modal/dashboard-app-form-modal.component';
import { ProxmoxService } from './proxmox.service';
import { SharedModule } from '../shared/shared.module';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    SharedModule
  ],
  declarations: [HomePage, DashboardAppFormModalComponent],
  providers: [DashboardAppService, ProxmoxService]
})
export class HomePageModule {}
