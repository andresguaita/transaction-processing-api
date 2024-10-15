export class Merchant {
    constructor(
      public merchantId: string,     
      public accountId: string,       
      public documentType: string,    
      public merchantType: string,   
      public name: string,     
      public legalName: string,
      public created_at: string
    ) {}
  }
  