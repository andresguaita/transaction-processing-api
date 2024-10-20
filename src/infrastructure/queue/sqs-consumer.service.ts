import { Injectable, Logger } from '@nestjs/common';
import { SQSClient, ReceiveMessageCommand, DeleteMessageCommand } from '@aws-sdk/client-sqs';
import { TransactionService } from 'src/domain/services/transaction.service';

@Injectable()
export class SqsConsumerService {
  private readonly logger = new Logger(SqsConsumerService.name);
  private sqsClient = new SQSClient({ region: process.env.AWS_REGION });

  constructor(private readonly transactionService: TransactionService) {}

  async consumeMessages(queueUrl: string): Promise<void> {
    try {
      const params = {
        QueueUrl: queueUrl,
        MaxNumberOfMessages: 10,
        WaitTimeSeconds: 20,
      };

      const command = new ReceiveMessageCommand(params);
      const response = await this.sqsClient.send(command);

      if (response.Messages) {
        for (const message of response.Messages) {
          this.logger.log(`Processing message: ${message.MessageId}`);
          await this.processMessage(message);
        }
      } else {
        this.logger.log('No messages received');
      }
    } catch (error) {
      this.logger.error('Error receiving messages from SQS:', error.message);
    }
  }

  private async processMessage(message: any): Promise<void> {
    try {
      const transaction = JSON.parse(message.Body);
      await this.transactionService.processTransaction(transaction);
      await this.deleteMessage(message.ReceiptHandle, process.env.SQS_PAYMENT_METHOD_A_QUEUE);
      this.logger.log(`Message ${message.MessageId} processed and deleted`);
    } catch (error) {
      this.logger.error(`Error processing message ${message.MessageId}:`, error.message);
    }
  }

  private async deleteMessage(receiptHandle: string, queueUrl: string): Promise<void> {
    try {
      const deleteParams = { QueueUrl: queueUrl, ReceiptHandle: receiptHandle };
      const deleteCommand = new DeleteMessageCommand(deleteParams);
      await this.sqsClient.send(deleteCommand);
      this.logger.log('Message deleted from the queue');
    } catch (error) {
      this.logger.error('Error deleting message from SQS:', error.message);
    }
  }
}
