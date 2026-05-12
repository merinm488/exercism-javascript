//
// This is only a SKELETON file for the 'Grade School' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export class GradeSchool {
  constructor(){
    this.school = {}
  }

  roster() {
    let newOrder = Object.keys(this.school).sort((a,b) => a-b); //sorts the key first
    return newOrder.map(key => this.school[key].sort()).flat(); //in sorted order, map the key values and sort them alphabetically and flatten the array.
  }

  add(studentName, grade) {
    if (!Object.values(this.school).flat().includes(studentName)) //checks if the studentname is already in the school, if not add
    {
      if (!this.school[grade]) //checks if there is no student in that grade then add the first student in the grade
        this.school[grade] = [studentName]
      else this.school[grade].push(studentName);//otherwise push the student to the existing list in that grade
      return true;
    }
    else return false;
  }

  grade(gradeNumber) {
    if (!this.school[gradeNumber]) return []; 
    return this.school[gradeNumber].sort()
  }
}
