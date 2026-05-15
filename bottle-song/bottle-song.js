//
// This is only a SKELETON file for the 'Bottle Song' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const recite = (initialBottlesCount, takeDownCount) => {
  const words = ['no', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten']; 
  
  let result = [];
  for(let i=0; i<takeDownCount; i++) //loop will handles the different verses
  {
    let bottlesCurrent = initialBottlesCount == 1 ? 'bottle' : 'bottles';
    let bottlesRemaining = initialBottlesCount-1 == 1 ? 'bottle' : 'bottles';
    let line1 = `${words[initialBottlesCount]} green ${bottlesCurrent} hanging on the wall,`;
    let line3 = `And if one green bottle should accidentally fall,`;
    let lastLine = `There'll be ${words[initialBottlesCount-1].toLowerCase()} green ${bottlesRemaining} hanging on the wall.`;
    let lines = [line1,line1,line3,lastLine];
    for (let j=0; j<4; j++)
    {
      result.push(lines[j]) 
    }
    if (i !== takeDownCount-1) result.push(""); //if its not the last line then ad an empty string
    initialBottlesCount--
  }
  return result;
};
