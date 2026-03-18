//
// This is only a SKELETON file for the 'Resistor Color Duo' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

import { String } from "core-js";

export const decodedValue = (COLORS) => {
  const color = ['black','brown','red','orange','yellow','green','blue','violet','grey','white'];
  let colorCode = (color.indexOf(COLORS[0])) * 10 + (color.indexOf(COLORS[1]));
  return colorCode;
};
