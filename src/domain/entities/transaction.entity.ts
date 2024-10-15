export class Transaction {
    constructor(
      public transactionId: string,   
      public accountId: string,       
      public merchantId: string,     
      public status: string,          
      public createdAt: string,     
      public amount: number       
    ) {}
  }
  