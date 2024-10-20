import { CustomerData } from '../../application/interfaces/customer-data.interface';
export class Transaction {
    constructor(
      public transactionId: string,   
      public accountId: string,       
      public merchantId: string,     
      public status: string,          
      public created_at: string,     
      public amount: number,
      public payment_type: string,
      public customer_hash: string,
      public source_ip: string,
      public customer_data: CustomerData
    ) {}
  }
  