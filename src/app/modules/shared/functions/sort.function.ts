export function sorted(array: any[], property: string, asc = true) {
  const sortOrder = asc === true ? -1 : 1;

  return array.sort((a, b) => {
    if (a[property] < b[property]) return -1 * sortOrder;
    if (a[property] > b[property]) return 1 * sortOrder;
    return 0;
  });
}