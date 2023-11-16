import { Pipe, PipeTransform } from '@angular/core';

interface Time {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

@Pipe({
  name: 'convertSeconds'
})
export class ConvertSecondsPipe implements PipeTransform {

  transform(seconds: number, format = "full"): unknown {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const time: Time = {
      days,
      hours,
      minutes,
      seconds: remainingSeconds
    }

    return this.formatOutput(time, format);
  }

  formatOutput(time: Time, type: string) {
    const { days, hours, minutes, seconds } = time;

    const formatValue = (value: number, unit: string) => `${value} ${value === 1 ? unit : unit + 's'}`;

    switch (type) {
      case 'full':
        if (days == 0) {
          if (hours == 0) {
            if (minutes == 0) {
              return formatValue(seconds, 'second')
            } else {
              return `${formatValue(minutes, 'minute')} and ${formatValue(seconds, 'second')}`
            }
          } else {
            return `${formatValue(hours, 'hour')} ${formatValue(minutes, 'minute')} and ${formatValue(seconds, 'second')}`
          }
        } else {
          return `${formatValue(days, 'day')} ${formatValue(hours, 'hour')} ${formatValue(minutes, 'minute')} and ${formatValue(seconds, 'second')}`
        }
      
      case 'vm':
        if (days == 0) {
          if (hours == 0) {
            if (minutes == 0) {
              return formatValue(seconds, 'second')
            } else {
              return `${formatValue(minutes, 'minute')} and ${formatValue(seconds, 'second')}`
            }
          } else {
            return `${formatValue(hours, 'hour')} and ${formatValue(minutes, 'minute')}`
          }
        } else {
          return `${formatValue(days, 'day')} and ${formatValue(hours, 'hour')}`
        }
      default:
        return `${formatValue(days, 'day')} ${formatValue(hours, 'hour')} ${formatValue(minutes, 'minute')} and ${formatValue(seconds, 'second')}`
    }
  }

}
