import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, GetCommand, QueryCommand, DeleteCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DynamoService {
  private dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
  private dynamoDbDocumentClient = DynamoDBDocumentClient.from(this.dynamoDbClient);


  async put(params: any): Promise<void> {
    const command = new PutCommand(params);
    await this.dynamoDbDocumentClient.send(command);
  }


  async get(params: any): Promise<any> {
    const command = new GetCommand(params);
    const result = await this.dynamoDbDocumentClient.send(command);
    return result;
  }


  async query(params: any): Promise<any> {
    const command = new QueryCommand(params);
    const result = await this.dynamoDbDocumentClient.send(command);
    return result;
  }


  async delete(params: any): Promise<void> {
    const command = new DeleteCommand(params);
    await this.dynamoDbDocumentClient.send(command);
  }
}
