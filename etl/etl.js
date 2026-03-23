//
// This is only a SKELETON file for the 'ETL' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const transform = (old) => {
  let output = {};
  for (let arr in old)
  {
    for (let letter of old[arr])
    {
      output[letter.toLowerCase()] = Number(arr);
    }
  }
  return output;
}


