//
// This is only a SKELETON file for the 'Series' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

//import { slice } from "core-js/core/array";

export class Series {
  constructor(series) {
    this.series = series;
  }

  slices(sliceLength) {
    if (this.series.length == 0) throw new Error('series cannot be empty')
    if(sliceLength == 0) throw new Error('slice length cannot be zero');
    else if (sliceLength < 0) throw new Error('slice length cannot be negative');
    else if (sliceLength > this.series.length) throw new Error('slice length cannot be greater than series length');
    else 
    {
      let result = [];
      
      for (let i=0; i<=(this.series.length-sliceLength); i++)
      {
        let arr = this.series.slice(i,sliceLength+i).split('').map(Number);
        result.push(arr);
      }
      return result;
    }
  }
}
