export const API_URL = 'http://localhost:3000/api'
export const PROXMOX_API_URL = `${API_URL}/proxmox`
export const INTEGRATION_API_URL = `${API_URL}/integration`
export const ICON_API_URL = `${API_URL}/image`

export function goToApp(url: string) {
  window.open(url, '_blank'); // open page in new tab
}

export function objectArraysAreTheSame(array: any[], comparator: any[]) {
  // Check if the length of both arrays is the same
  if (array.length !== comparator.length) {
    return false;
  }

  // Check if every object in array exists in comparator
  return array.every(obj1 => comparator.some(obj2 => JSON.stringify(obj1) === JSON.stringify(obj2)));
}

export function objectUptimesAreTheSame(array: any[], comparator: any[]) {
  // Check if the length of both arrays is the same
  if (array.length !== comparator.length) {
    return false;
  }

  // Iterate through array
  for (let i = 0; i < array.length; i++) {
    const obj1 = array[i];

    // Find the corresponding object in comparator based on the "name" property
    const obj2 = comparator.find(item => item.name === obj1.name);

    // If no corresponding object is found or "convertedUptime" values are different, return false
    if (!obj2 || obj1.convertedUptime !== obj2.convertedUptime) {
      return false;
    }

    // If no corresponding object is found or "status" values are different, return false
    if (!obj2 || obj1.status !== obj2.status) {
      return false;
    }
  }

  // If all checks pass, return true
  return true;
}

export function getItemColor(value: number, convertToPercent = true) {
  const colors: string[] = []

  // Define start, middle, and end colors
  const startColor = "#74BF6B";
  const middleColor = "#DAB01B";
  const endColor = "#D34039";

  function interpolateColor(startColor: string, endColor: string, percentage: number): string {
    function hexToRgb(hex: string): number[] {
      return hex.match(/\w\w/g)!.map(hex => parseInt(hex, 16));
    }

    function rgbToHex(rgb: number[]): string {
      return "#" + rgb.map(value => ("0" + value.toString(16)).slice(-2)).join("");
    }

    const startRgb = hexToRgb(startColor);
    const endRgb = hexToRgb(endColor);

    const interpolatedRgb = startRgb.map((start, i) => Math.round(start + (endRgb[i] - start) * percentage));

    return rgbToHex(interpolatedRgb);
  }

  function generateColorGradient(startColor: string, middleColor: string, endColor: string, steps: number): string[] {
    const colors: string[] = [];

    for (let i = 0; i < steps; i++) {
      let percentage: number;
      if (i <= 50) {
        percentage = i / 50;
        colors.push(interpolateColor(startColor, middleColor, percentage));
      } else {
        percentage = (i - 50) / (steps - 50);
        colors.push(interpolateColor(middleColor, endColor, percentage));
      }
    }

    return colors;
  }

  const colorGradient = generateColorGradient(startColor, middleColor, endColor, 100);

  colorGradient.forEach(color => colors.push(color));

  colors.push(colors[99])

  if (convertToPercent) {
    value *= 100
  }

  value = Math.round(value)

  if (value < 0) {
    value = 0
  } else if (value > 100) {
    value = 100
  }

  return colors[value]
}