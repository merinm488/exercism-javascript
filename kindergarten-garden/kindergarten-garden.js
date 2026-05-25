//
// This is only a SKELETON file for the 'Kindergarten Garden' exercise.
// It's been provided as a convenience to get you started writing code faster.
//

const DEFAULT_STUDENTS = [
  'Alice',
  'Bob',
  'Charlie',
  'David',
  'Eve',
  'Fred',
  'Ginny',
  'Harriet',
  'Ileana',
  'Joseph',
  'Kincaid',
  'Larry',
];

const PLANT_CODES = {
  G: 'grass',
  V: 'violets',
  R: 'radishes',
  C: 'clover',
};

export class Garden {
  constructor(diagram, students = DEFAULT_STUDENTS) {
    this.diag = diagram;
    this.sorted = [...students].sort(); //sort modeifies the original array, so using the sorted copy
  }

  plants(student) {
    let student_plants = [];
    let row1 = this.diag.split('\n')[0];
    let row2 = this.diag.split('\n')[1];
    let plantIndex = this.sorted.indexOf(student) * 2;
    student_plants.push(row1[plantIndex],row1[plantIndex+1],row2[plantIndex],row2[plantIndex+1]);
    let result = student_plants.map(code => PLANT_CODES[code]);
    return result;
  }
}
