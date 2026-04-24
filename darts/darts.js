//
// This is only a SKELETON file for the 'Darts' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const score = (x,y) => {
  let point = 0;
  let dist = Math.sqrt(x**2 + y**2);
  if (dist <= 1) point = 10
  else if(dist <= 5) point = 5
  else if (dist <= 10) point = 1
  else point = 0;
  return point;
};
