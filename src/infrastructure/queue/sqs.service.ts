import { Injectable } from '@nestjs/common';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import { Transaction } from '../../domain/entities/transaction.entity';


@Injectable()
export class SqsService {
  private sqsClient = new SQSClient({ region: process.env.AWS_REGION });

  async sendMessage(transaction: Transaction,transactionQueue:string): Promise<void> {
    const params = {
      QueueUrl: transactionQueue,  
      MessageBody: JSON.stringify(transaction),
    };

    try {
      const command = new SendMessageCommand(params);
      await this.sqsClient.send(command);
      console.log('Message sent to SQS:', params.MessageBody);
    } catch (error) {
      console.error('Error sending message to SQS:', error);
    }
  }
}
