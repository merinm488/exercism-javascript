//
// This is only a SKELETON file for the 'Meetup' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export const meetup = (year,month,nth,day) => {
  let week = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  let weekValue = ['first','second','third','fourth'];
  let lastDay = new Date(year,month,0).getDate(); //to get the last day of month for loop
  let count = 0;
  let nthIndex = weekValue.indexOf(nth)+1; //to get the index and compare with the count
  //testing the last day
  if (nth == 'last')
  {
    for (let i=lastDay;i>=0;i--)
    {
      let date = new Date(year,month-1,i);
      if (date.getDay() == week.indexOf(day))
        return date;
    }
  }
  //testing the teenth day
  else if (nth == 'teenth')
  {
    for (let i=13; i<20;i++)
    {
      let date = new Date(year,month-1,i);
      if (date.getDay() == week.indexOf(day))
        return date;
    }
  }
  else
  {
    for (let i=0;i<lastDay;i++)
    {
      let date = new Date(year,month-1,i+1);
      if (date.getDay() == week.indexOf(day))
      {
        count++
        if (count == nthIndex)
          return date; 
      }
    }
  }
};
