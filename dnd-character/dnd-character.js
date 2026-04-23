//
// This is only a SKELETON file for the 'D&D Character' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const abilityModifier = (score) => {
  if (score < 3) throw new Error('Ability scores must be at least 3')
  else if (score >18) throw new Error('Ability scores can be at most 18')
  else {let modifier = Math.floor((score-10)/2);
  return modifier;
  }
};

export class Character {
  static rollAbility() {
    let rolls = [];
    for (let roll=0; roll<4;roll++)
    {
      const diceRoll = Math.floor(Math.random() * 6) + 1;
      rolls.push(diceRoll)
    }
    rolls.sort((a,b) => b-a);
    rolls.pop();
    let total = rolls.reduce((a,b) => a+b,0)
    return total;
  }
  constructor() {
  this.s = Character.rollAbility();
  this.d = Character.rollAbility();
  this.c = Character.rollAbility();
  this.i = Character.rollAbility();
  this.w= Character.rollAbility();
  this.ch = Character.rollAbility();
}

  get strength() {
    return this.s;
  }

  get dexterity() {
    return this.d;
  }

  get constitution() {
    return this.s;
  }

  get intelligence() {
    return this.i;
  }

  get wisdom() {
    return this.w;
  }

  get charisma() {
    return this.ch;
  }

  get hitpoints() {
    let point = 10 + abilityModifier(this.constitution);
    return point;
  }
}
