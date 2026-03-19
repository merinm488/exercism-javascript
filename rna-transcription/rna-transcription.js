//
// This is only a SKELETON file for the 'RNA Transcription' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

//import { random } from "core-js/core/number";

export const toRna = (DNA) => {
  const convert = {G:'C',C:'G',T:'A',A:'U'};
  if (DNA === null) return "";
  let RNA = ''
  for (let i=0; i<DNA.length;i++)
  {
    RNA+=convert[DNA[i]];
  }
  return RNA;
}
  
