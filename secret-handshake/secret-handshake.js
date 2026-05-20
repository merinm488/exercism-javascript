//
// This is only a SKELETON file for the 'Secret Handshake' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

//import { padStart } from "core-js/core/string";

export const commands = (num) => {
  let binary = num.toString(2); //converting to binary number 
  binary = binary.slice(-5).padStart(5, '0');; //slice to get last 5 char and if length is <5 then pad it with 0
  let actions = ['reverse','jump','close your eyes','double blink','wink'];
  let result = [];
  for (let i=4; i>=0; i--)
  {
    if (binary[i] == 1 && actions[i] !== 'reverse')
      result.push(actions[i]);
    else if (binary[i] == 1 && actions[i] === 'reverse')
      result.reverse();
  }
  return result;
};
