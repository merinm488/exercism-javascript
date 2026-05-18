//
// This is only a SKELETON file for the 'Say' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const say = (n) => {
  if (n<0 || n>999999999999) throw new Error('Number must be between 0 and 999,999,999,999.');
  const ones = ['zero','one','two','three','four','five','six','seven','eight','nine'];
  const teens = ['ten','eleven','twelve','thirteen','fourteen','fifteen','sixteen','seventeen','eighteen','nineteen',];
  const tens = [,,'twenty','thirty','forty','fifty','sixty','seventy','eighty','ninety'];
  const scales = ['','thousand','million','billion'];
  

  function SayChunk(n) //function to handle 0-999
  { 
    if (n==0) return 'zero';
    let result = '';
    while(n>=20)
    {
       if (n>=20 && n<100)
      {
        let first = tens[Math.floor(n/10)];
        let last = ones[n%10];
        result += (result !== '' ? ' ' : '') + `${first}` + (last == 'zero' ? `` : `-${last}`);
        n = 0;
      }
      else if (n>=100 && n<1000)
      {
        let first = ones[Math.floor(n/100)];
        result += (result !== '' ? ' ' : '') + `${first} hundred`;
        n = n%100;
      }
    }
    if (n>0 && n<10) result += (result !== '' ? ' ' : '') + ones[n];
    else if (n>=10 && n<20) result += (result !== '' ? ' ' : '') + teens[n%10];
    return result;
  }


  let result = []; //to put the number with its scales
  let chunks = []; //to put the number chunks
  if (n>=1000)
  {
    while (n>0)
    {
      chunks.push(n%1000)
      n = Math.floor(n/1000)
    }

    for (let i=0; i<chunks.length;i++)
    {
      if (chunks[i]) 
      {
        let str = SayChunk(chunks[i]);
        if (scales[i]) str += ' ' + scales[i];
        result.unshift(str)
      }
    }
    return result.join(' ');
  }
  else return SayChunk(n);
};

