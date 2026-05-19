//
// This is only a SKELETON file for the 'Pascals Triangle' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const rows = (num) => {
  let triangle = [[1]];
  if (num == 0) return [];
  else if (num == 1) return triangle;
  else
  {
    let lastRow = [1]
    for (let i=1; i<num; i++)
    {
      let row = [1];
      for (let j=1; j<= lastRow.length; j++)
      {
        let element = lastRow[j-1] + (lastRow[j] || 0);
        row.push(element);
      }
      triangle.push(row);
      lastRow = triangle.at(-1);
    }
    return triangle;
  }
};
