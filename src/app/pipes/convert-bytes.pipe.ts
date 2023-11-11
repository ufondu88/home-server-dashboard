import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertBytes'
})
export class ConvertBytesPipe implements PipeTransform {

  transform(value: number): unknown {
    const GB = 1024 * 1024 * 1024;
    const MB = 1024 * 1024;
    const KB = 1024;

    if (value >= GB) {
      return (value / GB).toFixed(2) + ' GB';
    } else if (value >= MB) {
      return (value / MB).toFixed(2) + ' MB';
    } else {
      return (value / KB).toFixed(2) + ' KB';
    }
  }

}
