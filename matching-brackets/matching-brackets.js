//
// This is only a SKELETON file for the 'Matching Brackets' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const isPaired = (string) => {
  const openToClose = {
    '(': ')',
    '{': '}',
    '[': ']'
  };

  const closeToOpen = {
    ')': '(',
    '}': '{',
    ']': '['
  };

  let stack = [];

  for (let char of string) {
    if (char in openToClose) {
      stack.push(char);
    } 
    else if (char in closeToOpen) {
      if (stack.length === 0 || stack.at(-1) !== closeToOpen[char]) {
        return false;
      }
      stack.pop();
    }
  }

  return stack.length === 0;
};
