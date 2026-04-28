//
// This is only a SKELETON file for the 'Micro-blog' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const truncate = (input) => {
  let character = [...input];
  let microBlog = ''
  if(character.length<=5) return input
  else
  {
    for(let i=0; i<5;i++)
      microBlog+=character[i];
  }
  return microBlog;
};
