//
// This is only a SKELETON file for the 'Conway's Game of Life' exercise. It's been provided
// as a convenience to get you started writing code faster.
//

export class GameOfLife {
  constructor(matrix) {
    this.matrix = matrix;
  }

  tick() {
    const result = this.matrix.map(row => row.map(() => 0));
    for (let i=0; i<this.matrix.length;i++)
    {
      for(let j=0;j<this.matrix[i].length; j++)
      {
        let count = 0;
        if((j+1)<this.matrix[i].length && this.matrix[i][j+1] == 1) count++
        if((j-1)>=0 && this.matrix[i][j-1] == 1) count++
        if((i+1)<this.matrix.length && this.matrix[i+1][j] == 1) count++
        if((i-1)>=0 && this.matrix[i-1][j] == 1) count++
        if((i-1)>=0 && (j-1)>=0 && this.matrix[i-1][j-1] == 1) count++
        if((i-1)>=0 && (j+1)<this.matrix[i].length && this.matrix[i-1][j+1] == 1) count++
        if((i+1)<this.matrix.length && (j-1)>=0 && this.matrix[i+1][j-1] == 1) count++
        if((i+1)<this.matrix.length && (j+1)<this.matrix[i].length && this.matrix[i+1][j+1] == 1) count++

      
        if(this.matrix[i][j] == 1 && (count == 2 || count == 3)) result[i][j] = 1
        else if (this.matrix[i][j] == 0 && count == 3) result[i][j] = 1
      }
    }
    return this.matrix = result;
  }

  state() {
    return this.matrix;
  }
}
