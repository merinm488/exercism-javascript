//
// This is only a SKELETON file for the 'Diffie Hellman' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export class DiffieHellman {
  
  constructor(p, g) {
    this.p = p;
    this.g = g;
    let arr = [this.p,this.g];
    let isPrime = true;
    for (let num of arr)
    {
      
      if(num<=1) isPrime = false;
      else
      {
        for (let i=2;i<num;i++)
        {
          if(num%i === 0) {isPrime = false
          break;
          }
        }
      }
      if(!isPrime) break;
    }
    if (!isPrime) throw new Error ('Both p and g should be prime numbers')
  }

  getPublicKey(privateKey) {
    if(privateKey>1 && privateKey<this.p)
    {
      return this.g**privateKey % this.p
    }
    else throw new Error ("Invalid Private key range")
  }

  getSecret(theirPublicKey, myPrivateKey) {
    return theirPublicKey**myPrivateKey % this.p;
  }

  static getPrivateKey(p) 
  {
    return Math.floor(Math.random()*(p-2))+2
    
  }

}
