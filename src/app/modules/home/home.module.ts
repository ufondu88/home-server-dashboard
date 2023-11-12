import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HomePage } from './home.page';

import { HttpClientModule } from '@angular/common/http';
import { DashboardAppService } from './dashboard-app.service';
import { HomePageRoutingModule } from './home-routing.module';
import { DashboardAppFormModalComponent } from './modals/dashboard-app-form-modal/dashboard-app-form-modal.component';
import { ProxmoxService } from './proxmox.service';
import { SharedModule } from '../shared/shared.module';
import { ServerStatsComponent } from './components/server-stats/server-stats.component';
import { ServerCpuAndMemoryComponent } from './components/server-cpu-and-memory/server-cpu-and-memory.component';
import { ServerStorageComponent } from './components/server-storage/server-storage.component';
import { CardComponent } from './components/card/card.component';
import { RunningVmsComponent } from './components/running-vms/running-vms.component';
import { RunningContainersComponent } from './components/running-containers/running-containers.component';


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
  declarations: [
    HomePage,
    DashboardAppFormModalComponent,
    ServerStatsComponent,
    ServerCpuAndMemoryComponent,
    ServerStorageComponent,
    CardComponent,
    RunningVmsComponent,
    RunningContainersComponent
  ],
  providers: [DashboardAppService, ProxmoxService]
})
export class HomePageModule { }
