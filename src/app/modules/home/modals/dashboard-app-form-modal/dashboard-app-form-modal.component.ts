import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-dashboard-app-form-modal',
  templateUrl: './dashboard-app-form-modal.component.html',
  styleUrls: ['./dashboard-app-form-modal.component.scss'],
})
export class DashboardAppFormModalComponent implements OnInit {
  serviceForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
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

    // Close the modal when done.
    return this.modalController.dismiss(this.serviceForm.value, 'confirm');
  }
  
  cancel() {
    return this.modalController.dismiss(null, 'cancel');
  }
}
