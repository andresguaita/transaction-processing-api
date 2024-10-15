import { Injectable } from '@nestjs/common';
import { DynamoService } from './dynamo.service';
import { Transaction } from 'src/domain/entities/transaction.entity';

@Injectable()
export class TransactionRepository {
  constructor(private readonly dynamoService: DynamoService) {}

  async save(transaction: Transaction): Promise<void> {
    const params = {
      TableName: process.env.DYNAMODB_TRANSACTIONS_TABLE,
      Item:  {
        transaction_id: transaction.transactionId,
        account_id: transaction.accountId,
        merchant_id: transaction.merchantId,
        amount: transaction.amount,
        status: transaction.status,
        created_at: transaction.createdAt
      },
    };
    await this.dynamoService.put(params);
  }

  async find(transactionId: string): Promise<Transaction | null> {
    const params = {
      TableName: process.env.DYNAMODB_TRANSACTIONS_TABLE,
      Key: { transactionId },
    };
    const result = await this.dynamoService.get(params);
    return result.Item ? (result.Item as Transaction) : null;
  }

  async findByAccount(accountId: string): Promise<Transaction[]> {
    const params = {
      TableName: process.env.DYNAMODB_TRANSACTIONS_TABLE,
      IndexName: 'AccountIndex',
      KeyConditionExpression: 'account_id = :account_id',
      ExpressionAttributeValues: {
        ':account_id': accountId,
      },
    };
    const result = await this.dynamoService.query(params);
    return result.Items ? (result.Items as Transaction[]) : [];
  }

  async findByMerchant(merchantId: string): Promise<Transaction[]> {
    const params = {
      TableName: process.env.DYNAMODB_TRANSACTIONS_TABLE,
      IndexName: 'MerchantIndex',
      KeyConditionExpression: 'merchant_id = :merchant_id',
      ExpressionAttributeValues: {
        ':merchant_id': merchantId,
      },
    };
    const result = await this.dynamoService.query(params);
    return result.Items ? (result.Items as Transaction[]) : [];
  }
}
