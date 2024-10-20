import { Transaction } from "../interfaces/transaction.interface";
import DynamoDBService from "../utils/dynamo";
import { PaymentMethodBService } from "./paymentMethodB.service";


export class PaymentService {
  private dynamoDBService: DynamoDBService;
  constructor() {
    this.dynamoDBService = new DynamoDBService();

  }

  async processTransaction(transaction: Transaction): Promise<void> {
    console.log(`Processing payment for transaction: ${transaction.transactionId}`);
    const processorResponse= await PaymentMethodBService.submitRequest(transaction);
    const status = processorResponse.status;
    await this.dynamoDBService.updateTransactionStatus(transaction.transactionId,status);
  }
}
