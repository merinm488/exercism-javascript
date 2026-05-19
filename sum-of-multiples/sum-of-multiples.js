//
// This is only a SKELETON file for the 'Sum Of Multiples' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const sum = (base,level) => {
  let multiples = new Set();
  for (let item of base)
  {
    if (item ==0) continue;
    let i=1;
    while (item*i < level)
    {
      multiples.add(item*i);
      i++
    }
  }
  return [...multiples].reduce((acc,curr) => acc+curr,0);
};
