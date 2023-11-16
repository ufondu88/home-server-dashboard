import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';;
import { ProgressBarComponent } from './components/progress-bar/progress-bar.component';
import { CardComponent } from './components/card/card.component';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ConvertBytesPipe } from './pipes/convert-bytes.pipe';
import { ConvertSecondsPipe } from './pipes/convert-seconds.pipe';



@NgModule({
  declarations: [
    ConvertSecondsPipe,
    ConvertBytesPipe,
    ProgressBarComponent,
    CardComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
  ],
  exports: [ConvertSecondsPipe, ConvertBytesPipe, ProgressBarComponent, CardComponent]
})
export class SharedModule { }
