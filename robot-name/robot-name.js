// This is only a SKELETON file for the 'Robot Name' exercise. It's been
// provided as a convenience to get your started writing code faster.

function getRandomUpper() {
  // 65 is 'A', there are 26 letters
  return String.fromCharCode(Math.floor(Math.random() * 26) + 65);
}
function getRandomDigit() {
  return String(Math.floor(Math.random() * 10));
}


export class Robot {
    static nameUsed = new Set();

    generateUniqueName() 
    {
      let name = getRandomUpper() + getRandomUpper() + getRandomDigit() + getRandomDigit() + getRandomDigit();
      while (Robot.nameUsed.has(name)) {
          name = getRandomUpper() + getRandomUpper() + getRandomDigit() + getRandomDigit() + getRandomDigit();
      }
      Robot.nameUsed.add(name);
      return name;
    }

    constructor(){  
        this._name = this.generateUniqueName();
    }

    get name(){
        return this._name;
    }

    reset() {
      this._name = this.generateUniqueName();
    }
}

Robot.releaseNames = () => {
    Robot.nameUsed = new Set();
};
