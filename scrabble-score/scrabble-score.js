//
// This is only a SKELETON file for the 'Scrabble Score' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const score = (input) => {
  if (input.length === 0) return 0;
  let score = 0;
  let score_board = [[1,'A','E','I','O','U','L','N','R','S','T'],[2,'D','G'],[3,'B','C','M','P'],[4,'F','H','V','W','Y'],[5,'K'],[8,'J','X'],[10,'Q','Z']];
  input = input.toUpperCase();
  for (let i=0; i<input.length; i++)
  {
    for (let item of score_board)
    {
      if (item.slice(1).includes(input[i])) score+=item[0];
    }
  }
  return score;
};
