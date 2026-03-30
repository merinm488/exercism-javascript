//
// This is only a SKELETON file for the 'Triangle' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export class Triangle {
  constructor(a,b,c) {
    this.a = a;
    this.b = b;
    this.c = c;
  }
  //method
  isValid()
  {
    if (this.a>0 && this.b>0 && this.c>0 && (this.a+this.b)>=this.c && (this.b+this.c)>=this.a && (this.a+this.c)>=this.b) return true;
    else return false;
  }

  get isEquilateral() {
    if(!this.isValid(this.a,this.b,this.c)) return false;  
    else
      {
        if (this.a==this.b && this.b==this.c) return true;
        else return false;
      }
  }

  get isIsosceles() {
    if(!this.isValid(this.a,this.b,this.c)) return false;
    else{
      if(this.a==this.b || this.b==this.c || this.a==this.c) return true;
      else return false;
    }
  }

  get isScalene() 
  {
    if(!this.isValid(this.a,this.b,this.c)) return false;
    else
    {
      if(this.a!=this.b && this.b!=this.c && this.a!=this.c) return true;
      else return false;
    }
  }
}
