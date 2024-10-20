import { Transaction } from "../interfaces/transaction.interface";

export class PaymentMethodAService {
    
    public static async submitRequest(transaction: Transaction): Promise<{ success: boolean }> {
      const randomFailure = Math.random() < 0.3; 
      if (randomFailure) {
        return { success: false };
      }
      return { success: true };
    }
  }
  