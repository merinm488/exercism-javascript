//
// This is only a SKELETON file for the 'Bob' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const hey = (message) => {
  let letter = /[a-zA-Z]/
  let trimmed = message.trim();
  const isUpper = (str) => str === str.toUpperCase()
  if (trimmed == "") return "Fine. Be that way!" 
  else if((letter.test(trimmed)) && isUpper(trimmed) && trimmed.at(-1) === '?') return "Calm down, I know what I'm doing!" 
  else if (letter.test(trimmed) && isUpper(trimmed)) return "Whoa, chill out!"
  else if(trimmed.at(-1) == '?') return "Sure."
  else return "Whatever."

};
