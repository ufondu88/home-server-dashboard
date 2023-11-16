import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { IntegrationService } from '../../../integration.service';

@Component({
  selector: 'app-custom-integration',
  templateUrl: './custom-integration.component.html',
  styleUrls: ['./custom-integration.component.scss'],
})
export class CustomIntegrationComponent implements OnInit {
  serviceForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private integrationService: IntegrationService,
    private modalController: ModalController
  ) {
    this.serviceForm = this.formBuilder.group({
      name: ['', Validators.required],
      friendly_name: [''],
      url: ['', Validators.required],
      port: [''],
      token: [''],
    });
  }

  ngOnInit() { }

  submit() {
    if (this.serviceForm.invalid) {
      // Handle form validation errors, e.g., display an error message to the user.
      return;
    }

    this.integrationService.create(this.serviceForm.value).subscribe(res => {
      console.log(res)
      this.modalController.dismiss()
    })
  }

  cancel() {
    // return this.modalController.dismiss(null, 'cancel');
  }

}
