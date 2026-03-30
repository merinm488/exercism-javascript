//
// This is only a SKELETON file for the 'High Scores' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export class HighScores {
  constructor(list) {
    this.list = list;
  }

  get scores() {
    return this.list;
  }

  get latest() {
    return this.list.at(-1);
  }

  get personalBest() {
    let top = this.list[0];
    for (let score of this.list)
      if (score>top) top = score;
    return top;
  }

  get personalTopThree() {
    let newList = [...this.list]; //to create a copy and work on the copy of the array
    let topThree = newList.sort((a,b) => b-a)
    return topThree.slice(0,3);
  }
}
