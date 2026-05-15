//
// This is only a SKELETON file for the 'House' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

const subjects = [
    'the house that Jack built.','the malt', 'the rat','the cat', 'the dog','the cow with the crumpled horn','the maiden all forlorn','the man all tattered and torn',
    'the priest all shaven and shorn','the rooster that crowed in the morn','the farmer sowing his corn','the horse and the hound and the horn',];

const actions = ['lay in','ate','killed','worried','tossed','milked','kissed','married','woke','kept','belonged to']; 

export class House {
  static verse(num) {
    let song = [];
    song.push(`This is ${subjects[num-1]}`);
    for (let i=num-1;i>=1;i--)
    {
      song.push(`that ${actions[i-1]} ${subjects[i-1]}`);
    }
    return song;
  }

  static verses(start,end) {
    let song = [];
    for (let i=start; i<=end;i++)
    {
      song.push(House.verse(i));
      song.push('');
    }
    let result = song.flat()
    result.pop();
    return result;
  }
}
