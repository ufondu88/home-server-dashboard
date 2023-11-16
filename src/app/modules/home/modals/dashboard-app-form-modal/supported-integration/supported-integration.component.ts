import { Component, OnInit } from '@angular/core';
import { SUPPORTED_INTEGRATIONS } from './constants/supported-integrations.constants'

const BLUR_TIMEOUT = 50

@Component({
  selector: 'app-supported-integration',
  templateUrl: './supported-integration.component.html',
  styleUrls: ['./supported-integration.component.scss'],
})
export class SupportedIntegrationComponent  implements OnInit {
  searchText = '';
  integrations = SUPPORTED_INTEGRATIONS
  isInputActive = false;
  selectedOption = ''

  constructor() { }

  ngOnInit() { }
  
  selectOption(option: any): void {
    setTimeout(() => {
      this.selectedOption = option.friendly_name
      this.searchText = option.name
    }, BLUR_TIMEOUT);
  }

  onInputFocus(): void {
    this.isInputActive = true;
  }

  onInputBlur(): void {
    // Introduce a small delay to allow click events to fire before hiding the list
    setTimeout(() => {
      this.isInputActive = false;
    }, BLUR_TIMEOUT * 2);
  }

}
