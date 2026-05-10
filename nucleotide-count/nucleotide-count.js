//
// This is only a SKELETON file for the 'Nucleotide Count' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export function countNucleotides(strand) {
  let nucleotide = {'A':0,'C':0,'G':0,'T':0};
  let strands = strand.split('');
  for (let item of strands)
  {
    if(nucleotide[item] != undefined) nucleotide[item]++;
    else throw new Error('Invalid nucleotide in strand');
  }
  return Object.values(nucleotide).join(' ')
}
