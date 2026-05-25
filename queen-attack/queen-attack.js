//
// This is only a SKELETON file for the 'Queen Attack' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export class QueenAttack {
  constructor({
    black: [blackRow, blackColumn] = [0,3], //default queen positions
    white: [whiteRow, whiteColumn] = [7,3],
  } = {}) 
  {
    this.black = [blackRow,blackColumn]; //this.black and this.white assigned from the destructured variables
    this.white = [whiteRow,whiteColumn];
    if(this.black.some(el => (el>7 || el<0)))
      throw new Error('Queen must be placed on the board');
    if(this.white.some(el => (el>7 || el<0)))
      throw new Error('Queen must be placed on the board');
    if (this.black[0] == this.white[0] && this.black[1] == this.white[1])
      throw new Error("Queens cannot share the same space");
}

  toString() {
    let chessBoard = [];
    let str = [];
    for(let i=0; i<8; i++)
    {
      for(let j=0;j<8;j++)
      {
        if(i == this.black[0] && j == this.black[1])
          str.push('B');
        else if (i == this.white[0] && j == this.white[1])
          str.push('W');
        else str.push('_');
      }
      chessBoard.push(str.join(' '));
      str = [];
    }
    return chessBoard.join('\n');
  }

  get canAttack() {
    if(this.black[0] == this.white[0] || this.black[1] == this.white[1])
      return true
    else{
      let rowDiff = Math.abs(this.black[0] - this.white[0]);
      let colDiff = Math.abs(this.black[1] - this.white[1]);
      return rowDiff == colDiff;
    }
  }
}
