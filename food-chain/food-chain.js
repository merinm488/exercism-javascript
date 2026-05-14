//
// This is only a SKELETON file for the 'Food Chain' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export class Song {
  verse(num) {
    const animals = ['fly', 'spider', 'bird', 'cat', 'dog', 'goat', 'cow', 'horse'];
    const reactions = { 'fly': "I don't know why she swallowed the fly. Perhaps she'll die.",
                        'spider': "It wriggled and jiggled and tickled inside her.",
                        'bird': "How absurd to swallow a bird!",
                        'cat':"Imagine that, to swallow a cat!",
                        'dog':"What a hog, to swallow a dog!",
                        'goat':"Just opened her throat and swallowed a goat!",
                        'cow':"I don't know how she swallowed a cow!",
                        'horse':"She's dead, of course!"
                      }
    let firstLine = `I know an old lady who swallowed a ${animals[num-1]}.`+'\n';
    let secondLine = reactions[animals[num-1]]+'\n';
    let middleLines = "";
    let lastLine = "I don't know why she swallowed the fly. Perhaps she'll die.\n";
    
    if (num == 8) return "I know an old lady who swallowed a horse.\nShe's dead, of course!\n";
    
    while (num>1)
    {
      let currentAnimal = animals[num-1];
      let previousAnimal = animals[num-2];
      if (previousAnimal == 'spider')
        middleLines += `She swallowed the ${currentAnimal} to catch the spider that wriggled and jiggled and tickled inside her.`+'\n';
      else
        middleLines += `She swallowed the ${currentAnimal} to catch the ${previousAnimal}.`+'\n';
      num--
    }   
    if (num==1 && !middleLines)
      return firstLine + secondLine;
    else return firstLine + secondLine + middleLines + lastLine;
  }

  verses(start,end) {
    let song = []
    for (let i=start;i<=end;i++)
    {
      song.push(this.verse(i));
    }
    return song.join('\n') + '\n';
  }
}
