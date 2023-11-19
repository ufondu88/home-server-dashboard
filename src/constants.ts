export const API_URL = 'http://localhost:3000/api'
export const PROXMOX_API_URL = `${API_URL}/proxmox`
export const INTEGRATION_API_URL = `${API_URL}/integration`

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