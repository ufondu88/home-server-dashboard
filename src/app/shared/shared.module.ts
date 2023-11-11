import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConvertSecondsPipe } from 'src/pipes/convert-seconds.pipe';
import { ConvertBytesPipe } from '../pipes/convert-bytes.pipe';



@NgModule({
  declarations: [ConvertSecondsPipe, ConvertBytesPipe],
  imports: [
    CommonModule
  ],
  exports: [ConvertSecondsPipe, ConvertBytesPipe]
})
export class SharedModule { }
