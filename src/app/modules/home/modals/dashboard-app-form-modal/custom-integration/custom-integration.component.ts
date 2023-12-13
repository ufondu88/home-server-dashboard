import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { IntegrationService } from '../../../integration.service';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-custom-integration',
  templateUrl: './custom-integration.component.html',
  styleUrls: ['./custom-integration.component.scss'],
})
export class CustomIntegrationComponent implements OnInit {
  serviceForm: FormGroup;
  selectedFile: File;

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
      token: ['']
    });
  }

  ngOnInit() { }

  onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.files && inputElement.files.length > 0) {
      this.selectedFile = inputElement.files[0];
    }
  }

  private createIntegration() {
    return this.integrationService.create(this.serviceForm.value)
  }

  private handleIntegrationCreation() {
    this.createIntegration().subscribe({
      next: (res) => {
        console.log(res);
        this.modalController.dismiss();
      },
      error: (error) => {
        console.error("Integration creation failed:", error);
      }
    });
  }

  submit() {
    if (this.serviceForm.invalid) {
      // Handle form validation errors, e.g., display an error message to the user.
      return;
    }

    if (this.selectedFile) {
      this.integrationService.uploadIcon(this.selectedFile).pipe(
        switchMap(res => {
          this.serviceForm.value.icon = res.filename
          
          return this.createIntegration()
        })
      ).subscribe(() => this.handleIntegrationCreation())
    } else {
      this.handleIntegrationCreation()
    }
  }

  cancel() {
    // return this.modalController.dismiss(null, 'cancel');
  }

}
