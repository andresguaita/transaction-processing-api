import { Transaction } from "../interfaces/transaction.interface";

export class PaymentMethodAService {
    
    public static async submitRequest(transaction: Transaction): Promise<{ success: boolean, status: string }> {
      const randomError = Math.random() < 0.3; 
      const randomDeclined = Math.random() < 0.5; 
      if (randomError) {
        return { success: false, status : 'ERROR' };
      }
      else if(randomDeclined){
        return { success: false, status: 'DECLINED' };
      }
      return { success: true, status: 'APPROVED' };
    }
  }
  