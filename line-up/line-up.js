//
// This is only a SKELETON file for the 'Line Up' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const format = (name, ticket) => {
  const lastDigit = ticket % 10;
  const lastTwoDigits = ticket % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
    return `${name}, you are the ${ticket}th customer we serve today. Thank you!`;
  } else if (lastDigit === 1) {
    return `${name}, you are the ${ticket}st customer we serve today. Thank you!`;
  } else if (lastDigit === 2) {
    return `${name}, you are the ${ticket}nd customer we serve today. Thank you!`;
  } else if (lastDigit === 3) {
    return `${name}, you are the ${ticket}rd customer we serve today. Thank you!`;
  } else {
    return `${name}, you are the ${ticket}th customer we serve today. Thank you!`;
  }
};