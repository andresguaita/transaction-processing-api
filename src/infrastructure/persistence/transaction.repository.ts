import { Injectable } from '@nestjs/common';
import { DynamoService } from './dynamo.service';
import { Transaction } from 'src/domain/entities/transaction.entity';

@Injectable()
export class TransactionRepository {
  constructor(private readonly dynamoService: DynamoService) {}

  async save(transaction: Transaction): Promise<void> {
    const params = {
      TableName: process.env.DYNAMODB_TRANSACTIONS_TABLE,
      Item: {
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
      Key: { transaction_id: transactionId },
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


  async updateStatus(transactionId: string, updateData: Partial<Transaction>): Promise<void> {
    const updateExpressions = [];
    const expressionAttributeNames: { [key: string]: string } = {};
    const expressionAttributeValues: { [key: string]: any } = {};

    // Construir la expresión de actualización dinámica
    if (updateData.accountId) {
      updateExpressions.push('#account_id = :account_id');
      expressionAttributeNames['#account_id'] = 'account_id';
      expressionAttributeValues[':account_id'] = updateData.accountId;
    }

    if (updateData.merchantId) {
      updateExpressions.push('#merchant_id = :merchant_id');
      expressionAttributeNames['#merchant_id'] = 'merchant_id';
      expressionAttributeValues[':merchant_id'] = updateData.merchantId;
    }

    if (updateData.amount) {
      updateExpressions.push('#amount = :amount');
      expressionAttributeNames['#amount'] = 'amount';
      expressionAttributeValues[':amount'] = updateData.amount;
    }

    if (updateData.status) {
      updateExpressions.push('#status = :status');
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = updateData.status;
    }

    if (updateData.createdAt) {
      updateExpressions.push('#created_at = :created_at');
      expressionAttributeNames['#created_at'] = 'created_at';
      expressionAttributeValues[':created_at'] = updateData.createdAt;
    }

    // Si no hay campos para actualizar, no hacer nada
    if (updateExpressions.length === 0) {
      return;
    }

    const params = {
      TableName: process.env.DYNAMODB_TRANSACTIONS_TABLE,
      Key: { transaction_id: transactionId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    };

    await this.dynamoService.update(params);
  }
}
