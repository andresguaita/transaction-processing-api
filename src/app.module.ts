import { Module } from '@nestjs/common';
import { DynamoService } from './infrastructure/persistence/dynamo.service';
import { TransactionRepository } from './infrastructure/persistence/transaction.repository';
import { AccountRepository } from './infrastructure/persistence/account.repository';
import { MerchantRepository } from './infrastructure/persistence/merchant.repository';
import { SqsService } from './infrastructure/queue/sqs.service';


@Module({
  imports: [],
  controllers: [],
  providers: [
    DynamoService,
    SqsService,
    TransactionRepository,
    AccountRepository,
    MerchantRepository
  ],
})
export class AppModule {}
