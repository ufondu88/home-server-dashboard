import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertSeconds'
})
export class ConvertSecondsPipe implements PipeTransform {

  transform(seconds: number, format = "full"): unknown {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    if (format == "full") {
      return `${days} days, ${hours} hours, ${minutes} minutes and ${remainingSeconds} seconds`
    }
    
    return {
      days,
      hours,
      minutes,
      seconds: remainingSeconds
    };
  }

}
