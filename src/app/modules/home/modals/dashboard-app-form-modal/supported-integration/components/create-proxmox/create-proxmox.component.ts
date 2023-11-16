import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Integration } from 'interfaces/integration.interface';
import { IntegrationService } from 'src/app/modules/home/integration.service';
import { SUPPORTED_INTEGRATIONS } from '../../constants/supported-integrations.constants';

@Component({
  selector: 'app-create-proxmox',
  templateUrl: './create-proxmox.component.html',
  styleUrls: ['./create-proxmox.component.scss'],
})
export class CreateProxmoxComponent implements OnInit {
  proxmoxIntegrationInfo = SUPPORTED_INTEGRATIONS.filter(res => res.friendly_name = 'proxmox')[0]
  proxmoxForm: FormGroup
  formBuilder = inject(FormBuilder)
  integrationService = inject(IntegrationService)

  constructor() {
    this.proxmoxForm = this.formBuilder.group({
      name: ['', Validators.required],
      username: ['', Validators.required],
      password: ['', Validators.required],
      internal_address: [''],
      external_address: [''],
      port: [this.proxmoxIntegrationInfo.port],
    });
  }

  ngOnInit() { }

  submit() {
    if (this.proxmoxForm.invalid) {
      const invalid = [];
      const controls = this.proxmoxForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          invalid.push(name);
        }
      }

      console.log(invalid);

      return;
    }

    const integration = this.proxmoxForm.value as Integration
    integration.type = this.proxmoxIntegrationInfo.type

    this.integrationService.create(integration).subscribe(res => {
      console.log(res)
    })
  }

}
