import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SharedModule } from '../shared/shared.module';
import { ProxmoxService } from './proxmox.service';
import { RunningContainersComponent } from './running-containers/running-containers.component';
import { RunningVmsComponent } from './running-vms/running-vms.component';
import { ServerCpuAndMemoryComponent } from './server-cpu-and-memory/server-cpu-and-memory.component';
import { ServerStatsComponent } from './server-stats/server-stats.component';
import { ServerStorageComponent } from './server-storage/server-storage.component';
import { ProxmoxComponent } from './proxmox.component';



@NgModule({
  declarations: [
    ServerStatsComponent,
    ServerCpuAndMemoryComponent,
    ServerStorageComponent,
    RunningVmsComponent,
    RunningContainersComponent,
    ProxmoxComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  exports: [
    ServerStatsComponent,
    ServerCpuAndMemoryComponent,
    ServerStorageComponent,
    RunningVmsComponent,
    RunningContainersComponent,
    ProxmoxComponent
    ],
  providers: [ProxmoxService]
})
export class ProxmoxModule { }
