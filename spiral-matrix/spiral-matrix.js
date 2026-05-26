//
// This is only a SKELETON file for the 'Spiral Matrix' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const spiralMatrix = (n) => {
  const grid = Array.from({length: n}, () => new Array(n).fill(0));
  let count = 1;
  let top=0;
  let bottom = n-1;
  let left = 0;
  let right = n-1;
  while(count<=n*n)
  {

    for(let col=left; col<=right; col++)
    {
      grid[top][col] = count
      count++
    }
    top++;
    for(let row = top; row<=bottom;row++)
    {
      grid[row][right] = count;
      count++;
    }
    right--;
    for(let col=right; col>=left; col--)
    {
      grid[bottom][col] = count;
      count++;
    }
    bottom--;
    for(let row=bottom; row>=top; row--)
    {
      grid[row][left] = count;
      count++;
    }
    left++;
  }
  return grid;
};
