//
// This is only a SKELETON file for the 'Saddle Points' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const saddlePoints = (trees) => {
  let saddlePoints = [];

  for (let [r, item] of trees.entries()) {
    let max = Math.max(...item);
    let maxCols = [];
    for (let c = 0; c < item.length; c++) {
      if (item[c] === max) maxCols.push(c);
    }

    for (let maxCol of maxCols) 
    {
      let min = Infinity;
      for (let i = 0; i < trees.length; i++) {
        if (trees[i][maxCol] < min) {
          min = trees[i][maxCol];
        }
      }
      if (max === min) {
        saddlePoints.push({ row: r + 1, column: maxCol + 1 });
      }
    }
  }

  return saddlePoints;
};
