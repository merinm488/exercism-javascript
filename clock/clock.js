//
// This is only a SKELETON file for the 'Clock' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export class Clock {
  constructor(hour,minute = 0) {
    this.hour = hour;
    this.minute = minute;
  }

  toString() {
  let totalMinutes = this.hour*60 + this.minute;
  totalMinutes = ((totalMinutes % 1440) + 1440) % 1440; 
  let hr = Math.floor(totalMinutes/60);
  let min = totalMinutes % 60;
  return `${String(hr).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
  }

  plus(addMin) {
    return new Clock(this.hour,this.minute+addMin)
  }

  minus(subMin) {
    return new Clock(this.hour,this.minute-subMin);
  }

  equals(clock1) {
    return clock1.toString() == this.toString(); //one of those clocks is already available as this. based on the the test suite  new Clock(15, 37).equals(new Clock(15, 37))
  }
}
