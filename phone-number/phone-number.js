export const clean = (input) => {

  if (/[a-zA-Z]/.test(input)) 
    throw new Error('Letters not permitted');

  else if (/[^\d+()\- .]/.test(input))
    throw new Error('Punctuations not permitted');

  let number = input.replace(/[^0-9]+/g, '');

  if (number.length === 11) { 
    if (number[0] === '1') {
      number = number.slice(1);
    } else {
      throw new Error('11 digits must start with 1');
    }
  }

  if (number.length < 10)
    throw new Error('Must not be fewer than 10 digits');

  if (number.length > 10)
    throw new Error('Must not be greater than 11 digits');

  if (number[0] === '0')
    throw new Error('Area code cannot start with zero');

  if (number[0] === '1')
    throw new Error('Area code cannot start with one');

  if (number[3] === '0')
    throw new Error('Exchange code cannot start with zero');

  if (number[3] === '1')
    throw new Error('Exchange code cannot start with one');

  return number;
};