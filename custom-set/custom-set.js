//
// This is only a SKELETON file for the 'Custom Set' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export class CustomSet {
  constructor(list = []) {
    list = list.filter((num,index) => {return list.indexOf(num) === index})
    this.list = list;
  }

  empty() {
    return this.list.length == 0;
  }

  contains(num) {
    return this.list.includes(num);
  }

  add(num) {
      this.list.push(num);
      return new CustomSet(this.list);
  }

  subset(list2) {
    return this.list.every(num => list2.list.includes(num));
  }

  disjoint(list2) {
    return !this.list.some(num => list2.list.includes(num));
  }

  eql(list2) {
    return this.subset(list2) && list2.subset(this) //this.list is an array. But 'this' is a CustomSet object.
  }

  union(list2) {
    for (let item of list2.list)
    {
      this.list.push(item);
    }
    return new CustomSet(this.list);
  }

  intersection(list2) {
     let newList = this.list.filter(num => list2.list.includes(num));
     return new CustomSet(newList);
  }

  difference(list2) {
    let newList = this.list.filter(num => !list2.list.includes(num));
    return new CustomSet(newList);
  }
}
