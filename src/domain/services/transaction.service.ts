import { Injectable, InternalServerErrorException, Logger, BadRequestException } from '@nestjs/common';
import { TransactionRepository } from 'src/infrastructure/persistence/transaction.repository';
import { SqsService } from 'src/infrastructure/queue/sqs.service';
import { CreateTransactionDto } from 'src/application/dtos/create-transaction.dto';
import { Transaction } from '../entities/transaction.entity';
import { HashService } from 'src/domain/services/hash.service';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly sqsService: SqsService,
    private readonly hashService: HashService
  ) {}

  async createTransaction(createTransactionDto: CreateTransactionDto,clientIp:string): Promise<Transaction> {

    const customerHash = this.hashService.generateCustomerHash(
      createTransactionDto.customerData.full_name,
      createTransactionDto.customerData.document_number
    );

    const transaction = new Transaction(
      `txn_${Date.now()}`,              
      createTransactionDto.accountId,
      createTransactionDto.merchantId,
      'PENDING',                        
      new Date().toISOString(),  
      createTransactionDto.amount, 
      createTransactionDto.paymentType,
      customerHash,
      clientIp,
      createTransactionDto.customerData                
    );

    try {
      await this.transactionRepository.save(transaction);
      this.logger.log(`Transaction ${transaction.transactionId} saved to DynamoDB`);

      if (createTransactionDto.paymentType === 'PaymentMethodA') {
        await this.sqsService.sendMessage(transaction, process.env.SQS_PAYMENT_METHOD_A_QUEUE);
        this.logger.log(`Transaction ${transaction.transactionId} sent to PaymentMethodA queue`);
      } else if (createTransactionDto.paymentType === 'PaymentMethodB') {
        await this.sqsService.sendMessage(transaction, process.env.SQS_PAYMENT_METHOD_B_QUEUE);
        this.logger.log(`Transaction ${transaction.transactionId} sent to PaymentMethodB queue`);
      } else {
        throw new Error(`Unsupported payment type: ${createTransactionDto.paymentType}`);
      }

      return transaction;
      
    } catch (error) {
      this.logger.error(`Error processing transaction ${transaction.transactionId}: ${error.message}`);
      throw new InternalServerErrorException(`Failed to process transaction ${transaction.transactionId}`);
    }
  }

  async processTransaction(transaction: any): Promise<void> {
    try {
      this.logger.log(`Processing transaction ${transaction.transactionId}`);

      // Lógica personalizada de procesamiento de transacciones (actualización de estado)
      await this.transactionRepository.updateStatus(transaction.transactionId, {status: 'APPROVED'});

      this.logger.log(`Transaction ${transaction.transactionId} processed successfully`);
    } catch (error) {
      this.logger.error(`Error processing transaction ${transaction.transactionId}:`, error.message);
      throw error;
    }
  }
}
