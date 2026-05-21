//
// This is only a SKELETON file for the 'Sublist' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export class List {
  constructor(list = []) {
    this.list = list;
  }

  compare(otherList) {
    if (this.list.length == otherList.list.length)
      if (this.list.every((num,index) => num == otherList.list[index]))
        return 'EQUAL';
      else return 'UNEQUAL';
    else
    {
      // Check SUBLIST: is this.list a contiguous sub-sequence of otherList.list?
      let sublistFound = false;
      for (let i = 0; i <= otherList.list.length - this.list.length; i++) {
        let slice = otherList.list.slice(i, i + this.list.length);
        if (slice.every((num, index) => num === this.list[index])) {
          sublistFound = true;
          break;
        }
      }
      if (sublistFound) return 'SUBLIST';

      // Check SUPERLIST: is otherList.list a contiguous sub-sequence of this.list?
      let superlistFound = false;
      for (let i = 0; i <= this.list.length - otherList.list.length; i++) {
        let slice = this.list.slice(i, i + otherList.list.length);
        if (slice.every((num, index) => num === otherList.list[index])) {
          superlistFound = true;
          break;
        }
      }
      if (superlistFound) return 'SUPERLIST';

      return 'UNEQUAL';
    }

  }
}
