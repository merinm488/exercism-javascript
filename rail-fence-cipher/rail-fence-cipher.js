export const encode = (input, rail) => {
  let goingDown = 1;
  let railNo = 0;
  let cipher = new Array(rail).fill('');

  for (let i = 0; i < input.length; i++) {
    cipher[railNo] += input[i];

    if (railNo === 0)
      goingDown = 1;
    else if (railNo === rail - 1)
      goingDown = -1;

    railNo += goingDown;
  }

  return cipher.join('');
};

export const decode = (input, rail) => {
  // Step 1: Count how many characters belong to each rail
  let goingDown = 1;
  let railNo = 0;
  let counts = new Array(rail).fill(0);

  for (let i = 0; i < input.length; i++) {
    counts[railNo] += 1;

    if (railNo === 0)
      goingDown = 1;
    else if (railNo === rail - 1)
      goingDown = -1;

    railNo += goingDown;
  }

  // Step 2: Split the encoded string into chunks per rail
  let chunks = [];
  let start = 0;
  for (let i = 0; i < rail; i++) {
    chunks.push(input.slice(start, start + counts[i]));
    start += counts[i];
  }

  // Step 3: Read characters back in zig-zag order
  let indices = new Array(rail).fill(0);
  let result = '';
  goingDown = 1;
  railNo = 0;

  for (let i = 0; i < input.length; i++) {
    result += chunks[railNo][indices[railNo]];
    indices[railNo]++;

    if (railNo === 0)
      goingDown = 1;
    else if (railNo === rail - 1)
      goingDown = -1;

    railNo += goingDown;
  }

  return result;
};
