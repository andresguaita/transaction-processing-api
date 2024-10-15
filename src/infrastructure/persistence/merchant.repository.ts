import { Injectable } from '@nestjs/common';
import { DynamoService } from './dynamo.service';
import { Merchant } from 'src/domain/entities/merchant.entity';

@Injectable()
export class MerchantRepository {
  constructor(private readonly dynamoService: DynamoService) {}

  async save(merchant: Merchant): Promise<void> {
    const params = {
      TableName: process.env.DYNAMODB_MERCHANTS_TABLE,
      Item: merchant,
    };
    await this.dynamoService.put(params);
  }

  async find(merchantId: string): Promise<Merchant | null> {
    const params = {
      TableName: process.env.DYNAMODB_MERCHANTS_TABLE,
      Key: { merchantId },
    };
    const result = await this.dynamoService.get(params);
    return result.Item ? (result.Item as Merchant) : null;
  }

  async findByAccount(accountId: string): Promise<Merchant[]> {
    const params = {
      TableName: process.env.DYNAMODB_MERCHANTS_TABLE,
      IndexName: 'AccountIdIndex',
      KeyConditionExpression: 'account_id = :account_id',
      ExpressionAttributeValues: {
        ':account_id': accountId,
      },
    };
    const result = await this.dynamoService.query(params);
    return result.Items ? (result.Items as Merchant[]) : [];
  }

  async findByDocumentType(documentType: string): Promise<Merchant[]> {
    const params = {
      TableName: process.env.DYNAMODB_MERCHANTS_TABLE,
      IndexName: 'DocumentTypeIndex',
      KeyConditionExpression: 'document_type = :document_type',
      ExpressionAttributeValues: {
        ':document_type': documentType,
      },
    };
    const result = await this.dynamoService.query(params);
    return result.Items ? (result.Items as Merchant[]) : [];
  }
}
