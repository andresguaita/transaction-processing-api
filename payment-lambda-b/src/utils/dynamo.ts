import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { config } from '../config/config';

class DynamoDBService {
    private client: DynamoDBClient;
    private tableName: string;

    constructor() {
        this.client = new DynamoDBClient({
            region: config.AWS_REGION,
            endpoint: config.DYNAMO_ENDPOINT
        });
        this.tableName = config.TABLE_NAME;
    }

    public async updateTransactionStatus(transactionId: string, status: string): Promise<void> {
        const params = {
            TableName: this.tableName,
            Key: {
                transaction_id: { S: transactionId },
            },
            UpdateExpression: 'set #status = :status',
            ExpressionAttributeNames: { '#status': 'status' },
            ExpressionAttributeValues: { ':status': { S: status } },
            ReturnValues: "UPDATED_NEW" as const
        };

        const command = new UpdateItemCommand(params);
        await this.client.send(command);
    }
}

export default DynamoDBService;
