import { Injectable } from '@nestjs/common';
import { DynamoService } from './dynamo.service';
import { Account } from 'src/domain/entities/account.entity';

@Injectable()
export class AccountRepository {
  constructor(private readonly dynamoService: DynamoService) {}

  async save(account: Account): Promise<void> {
    const params = {
      TableName: process.env.DYNAMODB_ACCOUNTS_TABLE,
      Item: account,
    };
    await this.dynamoService.put(params);
  }

  async find(accountId: string): Promise<Account | null> {
    const params = {
      TableName: process.env.DYNAMODB_ACCOUNTS_TABLE,
      Key: { accountId },
    };
    const result = await this.dynamoService.get(params);
    return result.Item ? (result.Item as Account) : null;
  }

  async findByCurrency(currency: string): Promise<Account[]> {
    const params = {
      TableName: process.env.DYNAMODB_ACCOUNTS_TABLE,
      IndexName: 'CurrencyIndex',
      KeyConditionExpression: 'currency = :currency',
      ExpressionAttributeValues: {
        ':currency': currency,
      },
    };
    const result = await this.dynamoService.query(params);
    return result.Items ? (result.Items as Account[]) : [];
  }
}
