//
// This is only a SKELETON file for the 'Bank Account' exercise. It's been provided as a
// convenience to get you started writing code faster.
//

export class BankAccount {
  constructor() {
    this.isOpen = false;
    this._balance = 0;
  }

  open() {
    if (!this.isOpen)
    {
      this.isOpen = true;
      this._balance = 0;
      return this.isOpen;
    }
    else throw new ValueError;
  }

  close() {
    if (this.isOpen)
    {
      this.isOpen = false;
      return this.isOpen;
    }
    else throw new ValueError();
  }

  deposit(amount) {
    if (this.isOpen && amount>0) 
    {
      this._balance+=amount;
      return this.balance;
    }
    else throw new ValueError();
  }

  withdraw(amount) {
    if (this.isOpen && amount<=this._balance && amount >0) 
    {
      this._balance-=amount;
      return this.balance;
    }
    else throw new ValueError();
  }

  get balance() {
    if (this.isOpen) return this._balance
    else throw new ValueError();
  }
}

export class ValueError extends Error {
  constructor() {
    super('Bank account error');
  }
}
