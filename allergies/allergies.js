//
// This is only a SKELETON file for the 'Allergies' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export class Allergies 
{
  constructor(num) {
    this.num = num;
    this.allergen = {'eggs':1,'peanuts':2,'shellfish':4,'strawberries':8,'tomatoes':16,'chocolate':32,'pollen':64,'cats':128};
  }
 
  list() {
    let result = [];
    return Object.keys(this.allergen).filter((allergy) => this.allergicTo(allergy));
  }


  allergicTo(item) {
    return (this.num & this.allergen[item]) != 0;
  }
}

