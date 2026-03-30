//
// This is only a SKELETON file for the 'Difference Of Squares' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export class Squares {
  constructor(n) {
    this.n = n;
  }

  get sumOfSquares() {
    let sumSquare = 0;
    for (let i=1;i<=this.n;i++)
      sumSquare+=i*i;
    return sumSquare;
  }

  get squareOfSum() {
    let squareSum = 0;
    for(let i=1;i<=this.n;i++)
      squareSum+=i;
    return squareSum**2;
  }

  get difference() {
    let diff = this.squareOfSum - this.sumOfSquares;
    return diff;
  }
}
