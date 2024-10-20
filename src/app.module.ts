import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { DynamoService } from './infrastructure/persistence/dynamo.service';
import { TransactionRepository } from './infrastructure/persistence/transaction.repository';
import { AccountRepository } from './infrastructure/persistence/account.repository';
import { MerchantRepository } from './infrastructure/persistence/merchant.repository';
import { SqsService } from './infrastructure/queue/sqs.service';
import { TransactionController } from './application/controllers/transaction.controller';
import { TransactionService } from './domain/services/transaction.service';
import { ConfigModule } from '@nestjs/config';
import { AntifraudMiddleware } from './infrastructure/middleware/antifraud.middleware';
import { HashService } from './domain/services/hash.service';
import { AntifraudService } from './domain/services/antifraud.service';
import { GeoIpProvider } from './infrastructure/providers/geoip.provider';
import { HttpService } from './infrastructure/http/http.service';


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
    HashService,
    AntifraudService,
    TransactionService,
    TransactionRepository,
    AccountRepository,
    MerchantRepository,
    GeoIpProvider, 
    HttpService,  
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AntifraudMiddleware)
      .forRoutes({ path: 'transactions', method: RequestMethod.POST });
  }
}
