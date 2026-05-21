//
// This is only a SKELETON file for the 'Binary Search' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const find = (arr,value) => {
  let low = 0;
  let high = arr.length-1;
  
   while (low <= high)
   {
    let mid = Math.floor((high+low)/2);
    if (arr[mid] == value)
      return mid;
    else if (value<arr[mid])
    {
      high = mid-1;
    }
    else 
    {
      low = mid+1;
    }
   }
   throw new Error('Value not in array');
};
