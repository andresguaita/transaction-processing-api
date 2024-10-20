import { Injectable, NestMiddleware, BadRequestException, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AntifraudService } from 'src/domain/services/antifraud.service';
import { Transaction } from 'src/domain/entities/transaction.entity';
import { HashService } from '../../domain/services/hash.service';

@Injectable()
export class AntifraudMiddleware implements NestMiddleware {
    private readonly logger = new Logger(AntifraudMiddleware.name);

    constructor(
        private readonly antifraudService: AntifraudService,
        private readonly hashService: HashService
    ) { }

    async use(req: Request, res: Response, next: NextFunction) {
        let clientIp: string;
        if(req.headers['x-forwarded-for']){ [clientIp] = (<string>req.headers['x-forwarded-for']).split(',')}
        else{clientIp= '127.0.0.1'}
        console.log('REEEED IP',clientIp)
        const { accountId, merchantId, amount, paymentType, customerData } = req.body;
        const customerHash = this.hashService.generateCustomerHash(
            customerData.full_name,
            customerData.document_number
        );
        const transaction = new Transaction(
            `txn_${Date.now()}`,
            accountId,
            merchantId,
            'PENDING',
            new Date().toISOString(),
            amount,
            paymentType,
            customerHash,
            clientIp,
            customerData
        );

        try {

            const isValid = await this.antifraudService.validateTransaction(transaction);
            if (!isValid) {
                this.logger.warn(`Transaction ${transaction.transactionId} marked as fraudulent`);
                throw new BadRequestException(`Transaction is marked as fraudulent`);
            }
            next();
        } catch (error) {
            this.logger.error(`Error validating transaction: ${error.message}`);
            res.status(400).json({ message: error.message });
        }
    }
}
