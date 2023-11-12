import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ConvertBytesPipe } from 'src/app/pipes/convert-bytes.pipe';
import { ConvertSecondsPipe } from 'src/app/pipes/convert-seconds.pipe';
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';



@NgModule({
  declarations: [
    ConvertSecondsPipe,
    ConvertBytesPipe,
    ProgressBarComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [ConvertSecondsPipe, ConvertBytesPipe, ProgressBarComponent]
})
export class SharedModule { }
