import { Transaction } from "../interfaces/transaction.interface";
import DynamoDBService from "../utils/dynamo";
import { PaymentMethodAService } from "./paymentMethodA.service";


export class PaymentService {
  private dynamoDBService: DynamoDBService;
  constructor() {
    this.dynamoDBService = new DynamoDBService();

  }

  async processTransaction(transaction: Transaction): Promise<void> {
    let status:string;
    console.log(`Processing payment for transaction: ${transaction.transactionId}`);

    const processorResponse= await PaymentMethodAService.submitRequest(transaction);

    if(processorResponse){ status = 'APPROVED'}
    else {status = 'ERROR'}

    await this.dynamoDBService.updateTransactionStatus(transaction.transactionId,status);
  }
}
