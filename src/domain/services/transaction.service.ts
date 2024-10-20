import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { TransactionRepository } from 'src/infrastructure/persistence/transaction.repository';
import { SqsService } from 'src/infrastructure/queue/sqs.service';
import { CreateTransactionDto } from 'src/application/dtos/create-transaction.dto';
import { Transaction } from '../entities/transaction.entity';

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly sqsService: SqsService
  ) {}

  async createTransaction(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const transaction = new Transaction(
        `txn_${Date.now()}`,              
        createTransactionDto.accountId,
        createTransactionDto.merchantId,
        'PENDING',                        
        new Date().toISOString(),  
        createTransactionDto.amount, 
        createTransactionDto.payment_type                    
      );

    try {

      await this.transactionRepository.save(transaction);
      this.logger.log(`Transaction ${transaction.transactionId} saved to DynamoDB`);
 

    if (createTransactionDto.payment_type === 'PaymentMethodA') {
        await this.sqsService.sendMessage(transaction, process.env.SQS_PAYMENT_METHOD_A_QUEUE);
        this.logger.log(`Transaction ${transaction.transactionId} sent to PaymentMethodA queue`);
      } else if (createTransactionDto.payment_type === 'PaymentMethodB') {
        await this.sqsService.sendMessage(transaction, process.env.SQS_PAYMENT_METHOD_B_QUEUE);
        this.logger.log(`Transaction ${transaction.transactionId} sent to PaymentMethodB queue`);
      } else {
        throw new Error(`Unsupported payment type: ${createTransactionDto.payment_type}`);
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

