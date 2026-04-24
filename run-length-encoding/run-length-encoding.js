//
// This is only a SKELETON file for the 'Run Length Encoding' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const encode = (rle) => {
  let count = 1;
  let result = '';
  if (rle.length<1) return rle;
  else
  {
    for (let i=1; i<rle.length; i++)
    {
      if(rle[i-1] == rle[i]) count++
      else 
      {
        count == 1 ? result+=rle[i-1] : result+=count.toString()+rle[i-1]
        count=1
      }
    }
    count == 1 ? result+=rle[rle.length - 1] : result+=count.toString()+rle[rle.length - 1] //to count the last group when the loop ends.
    return result;
  } 
} 

export const decode = (rle) => {
  let count = 1;
  let result = '';
  let digit = '';
  for (let i=0;i<rle.length;i++)
  {
    if(rle[i]>='0' && rle[i]<='9') digit+=rle[i]
    else
    {
      digit == '' ? result += rle[i] : result += rle[i].repeat(Number(digit))
      digit = ''
    }
  }
  return result;
};
