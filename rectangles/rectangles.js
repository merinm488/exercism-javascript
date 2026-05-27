//
// This is only a SKELETON file for the 'Rectangles' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

// Helper: verify all 4 edges of a potential rectangle are complete
function isValidRectangle(grid, topRow, bottomRow, c1, c2) {
  // Check top edge: every char between c1 and c2 on topRow must be '+' or '-'
  for (let col = c1 + 1; col < c2; col++) {
    if (grid[topRow][col] !== '+' && grid[topRow][col] !== '-') return false;
  }

  // Check bottom edge: every char between c1 and c2 on bottomRow must be '+' or '-'
  for (let col = c1 + 1; col < c2; col++) {
    if (grid[bottomRow][col] !== '+' && grid[bottomRow][col] !== '-') return false;
  }

  // Check left edge: every char between topRow and bottomRow at column c1 must be '+' or '|'
  for (let row = topRow + 1; row < bottomRow; row++) {
    if (grid[row][c1] !== '+' && grid[row][c1] !== '|') return false;
  }

  // Check right edge: every char between topRow and bottomRow at column c2 must be '+' or '|'
  for (let row = topRow + 1; row < bottomRow; row++) {
    if (grid[row][c2] !== '+' && grid[row][c2] !== '|') return false;
  }

  return true;
}

export function count(rectangle) {
  // Edge case: empty input
  if (rectangle.length === 0) return 0;

  // Step 1: Find all '+' positions (corners)
  let corners = [];
  rectangle.forEach((row, r) => {
    [...row].forEach((char, c) => {
      if (char === '+') corners.push([r, c]);
    });
  });

  // Step 2: Group corners by row
  // e.g. { "0": [0, 2, 5], "2": [0, 2, 5] }
  let cornersByRow = {};
  for (let item of corners) {
    if (!cornersByRow[item[0]])
      cornersByRow[item[0]] = [item[1]];
    else
      cornersByRow[item[0]].push(item[1]);
  }

  // Step 3: Generate all column pairs per row (potential top edges)
  // Each entry: [row, c1, c2]
  let columnPairs = [];
  for (let row in cornersByRow) {
    let columns = cornersByRow[row];
    for (let i = 0; i < columns.length; i++) {
      for (let j = i + 1; j < columns.length; j++) {
        columnPairs.push([Number(row), columns[i], columns[j]]);
      }
    }
  }

  // Step 4: For each potential top edge, look for a matching bottom row
  // If found, verify all 4 edges are valid
  let rectCount = 0;
  for (let pair of columnPairs) {
    let topRow = pair[0];
    let c1 = pair[1];
    let c2 = pair[2];

    for (let r in cornersByRow) {
      let bottomRow = Number(r);
      // bottomRow must be below topRow, and both c1 and c2 must have '+' on bottomRow
      if (bottomRow > topRow && cornersByRow[r].includes(c1) && cornersByRow[r].includes(c2)) {
        // Found 4 corners — now verify the edges between them
        if (isValidRectangle(rectangle, topRow, bottomRow, c1, c2)) {
          rectCount++;
        }
      }
    }
  }

  return rectCount;
}
