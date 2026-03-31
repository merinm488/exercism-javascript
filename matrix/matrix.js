//
// This is only a SKELETON file for the 'Matrix' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export class Matrix {
  constructor(matrix) {
    this.matrix = matrix;
  }

  get rows() {
    let newRows = this.matrix.split('\n'); //gets an arrays of string values ['1 2 3' , '3 4 5']
    let eachRow = [];
    for (let row of newRows)
    {
      eachRow.push(row.split(' ').map(n => Number(n))); //to convert each string element in newRows to number and push to an emtpy array
    }
    return eachRow;
  }

  get columns() {
    let columnArray = [];
    let rowCount = this.rows[0].length;
    for (let col = 0; col<rowCount; col++)
    {
      let column = [];
      for (let row of this.rows)
        column.push(row[col]);   //for each column looping through the rows and pushing the value to empty array.

      columnArray.push(column); //pushing the single array to empty column matrix
    }
    return columnArray;
  }
}
