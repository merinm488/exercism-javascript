//
// This is only a SKELETON file for the 'Protein Translation' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const translate = (codons) => {
  
  let rna;
  let protein = [];
  let codon = {'AUG':'Methionine', 'UUU': 'Phenylalanine', 'UUC': 'Phenylalanine', 'UUA': 'Leucine', 'UUG':'Leucine', 'UCU': 'Serine', 'UCC':'Serine', 'UCA':'Serine', 'UCG': 'Serine', 'UAU': 'Tyrosine', 'UAC':'Tyrosine', 'UGU':'Cysteine', 'UGC': 'Cysteine', 'UGG': 'Tryptophan', 'UAA':'STOP', 'UAG':'STOP', 'UGA': 'STOP'};
  if(codons == undefined || codons =='') return protein;
  for (let i=0; i<codons.length; i+=3)
  {
    rna=codons.substr(i,3)
    if (codon[rna] == 'STOP')
      return protein
    else if(codon[rna] == undefined)
      throw new Error ('Invalid codon')
    else
    protein.push(codon[rna])
    
  }
  return protein;
};
