//
// This is only a SKELETON file for the 'ETL' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const transform = (old) => {
  let output = {};
  for (let i in old)
  {
    for (let j in old[i])
    {
      output[old[i][j].toLowerCase()] = Number(i);
    }
  }
  return output;
}


