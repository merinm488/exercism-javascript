//
// This is only a SKELETON file for the 'Gigasecond' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const gigasecond = (randomDate) => 
{
  const giga_ms = 1000000000*1000
  let date = new Date(randomDate);
  let ms = date.getTime() + giga_ms;
  return new Date(ms);
}
