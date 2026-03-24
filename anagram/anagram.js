//
// This is only a SKELETON file for the 'Anagram' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const findAnagrams = (target,candidates) => {
  let anagram = [];
  for (let item of candidates)
  {
      let lowerTarget = target.toLowerCase();
      let lowerItem = item.toLowerCase();
      if (lowerTarget.length == lowerItem.length && lowerTarget !== lowerItem)
      {
        if ([...lowerTarget].sort().join('') === [...lowerItem].sort().join(''))
        anagram.push(item);
      }
  }
  return anagram;
};
