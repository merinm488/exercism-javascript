//
// This is only a SKELETON file for the 'List Ops' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export class List {
  constructor(list1=[]) {
    this.values = list1;
  }

  append(list2) { 
    let result = [...this.values , ...list2.values]; //because as per test list2 is a List object (list2 = {values: [2, 3, 4, 5]})
    return new List(result);
  }

  concat(listofLists) {
    let combinedResult = [...this.values];
    
    for (let item of listofLists.values)
    {
      let result = [...combinedResult, ...item.values]
      combinedResult = result;
    }
    return new List (combinedResult);
  }

  filter(fn) {
    let result = [];
    for (let item of this.values)
    {
      if(fn(item))
        result = [...result, item];
    }
    return new List(result);
  }

  map(fn) {
    let result = [];
    for (let item of this.values)
    {
      result = [...result, fn(item)]
    }
    return new List(result);
  }

  length() {
    let count = 0;
    for (let item of this.values)
      count++;
    return count;
  }

  foldl(fn,acc) {
    for (let item of this.values)
    {
      acc = fn(acc, item);
    }
    return acc;
  }

  foldr(fn,acc) {
    for (let i=this.values.length-1; i>=0; i--)
    {
      acc = fn(acc, this.values[i]);
    }
    return acc;
  }

  reverse() {
    let result = [];
    for (let i=this.values.length-1; i>=0; i--)
      result = [...result, this.values[i]];
    return new List(result);
  }
}
