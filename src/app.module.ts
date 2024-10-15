import { Module } from '@nestjs/common';
import { DynamoService } from './infrastructure/persistence/dynamo.service';
import { TransactionRepository } from './infrastructure/persistence/transaction.repository';
import { AccountRepository } from './infrastructure/persistence/account.repository';
import { MerchantRepository } from './infrastructure/persistence/merchant.repository';
import { SqsService } from './infrastructure/queue/sqs.service';
import { TransactionController } from './application/controllers/transaction.controller';
import { TransactionService } from './domain/services/transaction.service';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
  ],
  controllers: [TransactionController],
  providers: [
    DynamoService,
    SqsService,
    TransactionService,
    TransactionRepository,
    AccountRepository,
    MerchantRepository
  ],
})
export class AppModule {}
