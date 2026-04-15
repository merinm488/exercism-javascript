export const transpose = (input) => {
  if (input.length === 0) return [];

  let result = [];

  let columns = input.reduce((max, str) => Math.max(max, str.length), 0);

  for (let i = 0; i < columns; i++) {
    let element = '';

    // find last meaningful row for this column
    let last = -1;
    for (let j = 0; j < input.length; j++) {
      if ((input[j][i] ?? '') !== '') {
        last = j;
      }
    }

    // build only up to last meaningful row
    for (let j = 0; j <= last; j++) {
      element += input[j][i] ?? ' ';
    }

    result.push(element);
  }

  return result;
};