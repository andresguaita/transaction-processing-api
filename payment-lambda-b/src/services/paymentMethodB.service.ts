import { Transaction } from "../interfaces/transaction.interface";

export class PaymentMethodBService {
    
    public static async submitRequest(transaction: Transaction): Promise<{ success: boolean }> {
      const randomFailure = Math.random() < 0.5; 
      if (randomFailure) {
        return { success: false };
      }
      return { success: true };
    }
  }
  