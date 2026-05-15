//
// This is only a SKELETON file for the 'Twelve Days' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const recite = (startVerse,endVerse = 0) => {
  const day = ['first','second','third','fourth','fifth','sixth','seventh','eighth','ninth','tenth','eleventh','twelfth'];
  const gifts = ['a Partridge in a Pear Tree.','two Turtle Doves, and', 'three French Hens,','four Calling Birds,','five Gold Rings,','six Geese-a-Laying,','seven Swans-a-Swimming,','eight Maids-a-Milking,','nine Ladies Dancing,','ten Lords-a-Leaping,','eleven Pipers Piping,','twelve Drummers Drumming,'];
  let line = '';
  if (endVerse == 0) //when second argument is not given
  {
    let index = startVerse-1;
    let commonLine = `On the ${day[index]} day of Christmas my true love gave to me: `
    while (index>=0)
    {
      line += index == 0 ? `${gifts[index]}`+ '\n' : `${gifts[index]}` + ' ';
      index--
    }
    return commonLine + line;
  }
  else 
  {
    let song = "";
    for (let i=startVerse;i<=endVerse;i++)
    {
      song += i===endVerse ? recite(i) : recite(i) + '\n';
    }
    return song;
  }
  
};
