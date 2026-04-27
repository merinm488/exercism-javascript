//
// This is only a SKELETON file for the 'Tournament' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const tournamentTally = (input) => {
  if (input === '')
  {
    return 'Team                           | MP |  W |  D |  L |  P'
  }
  let matchLine = input.split('\n');
  let tally = {};
  let match;
  for (let item of matchLine)
  {
    match = item.split(';')
    if(!tally[match[0]]) // checking if players anme is already in tally object
    {
      tally[match[0]] = {'MP':0, 'W':0, 'D':0, 'L':0, 'P':0}; //if team name not in start with 0 points
    }
    if(!tally[match[1]])
    {
      tally[match[1]] = {'MP':0, 'W':0, 'D':0, 'L':0, 'P':0}
    }
    if(match[2] == 'win')
    {
      tally[match[0]]['MP']+=1
      tally[match[1]]['MP']+=1
      tally[match[0]]['W']+=1
      tally[match[1]]['L']+=1
      tally[match[0]]['P']+=3
    }
    else if (match[2] == 'loss')
    {
      tally[match[0]]['MP']+=1
      tally[match[1]]['MP']+=1
      tally[match[1]]['W']+=1
      tally[match[0]]['L']+=1
      tally[match[1]]['P']+=3
    }
    else
    {
      tally[match[0]]['MP']+=1
      tally[match[1]]['MP']+=1
      tally[match[0]]['D']+=1
      tally[match[1]]['D']+=1
      tally[match[0]]['P']+=1
      tally[match[1]]['P']+=1
    }
  }
  let output = 'Team                           | MP |  W |  D |  L |  P\n';
  let players = Object.keys(tally); // gives the array of tally keys
  players.sort((a,b) => tally[b].P != tally[a].P ? tally[b].P-tally[a].P : a.localeCompare(b)); //sort based on points or alphabetically
  for (let item of players)
  {
    output+= item.padEnd(30) + ' | ' + String(tally[item]['MP']).padStart(2) + ' | ' + String(tally[item]['W']).padStart(2) + ' | ' + String(tally[item]['D']).padStart(2) + ' | ' + String(tally[item]['L']).padStart(2) + ' | ' + String(tally[item]['P']).padStart(2) + '\n'; 
  }
  return output.trim();
}