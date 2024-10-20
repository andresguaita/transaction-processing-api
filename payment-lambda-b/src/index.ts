import { Context, Callback, SQSEvent } from 'aws-lambda';
import { Transaction } from './interfaces/transaction.interface';
import { PaymentService } from './services/payment.service';

export const handler = async (event: SQSEvent, context: Context, callback: Callback) => {
    try {
        // Los eventos SQS tienen un array "Records", toma el primer registro.
        const record = event.Records[0];
        if (!record || !record.body) {
            throw new Error("No valid SQS message found");
        }

        // El cuerpo del mensaje viene como un string, así que lo parseamos a JSON
        const transactionEvent: Transaction = JSON.parse(record.body);


        // Verificamos si el transactionId está presente
        if (!transactionEvent.transactionId) {
            throw new Error("Transaction ID is required");
        }

        const paymentService = new PaymentService();
        const result =  await paymentService.processTransaction(transactionEvent);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: `Transaction status updated ${transactionEvent.transactionId}` }),
            result
        }


    } catch (error) {
        callback(null, {
            statusCode: 500,
            body: JSON.stringify({ error: (error as Error).message }),
        });
    }
};
