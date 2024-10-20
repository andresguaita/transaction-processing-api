import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { Transaction } from '../entities/transaction.entity';
import { AntifraudEngine } from '../../application/interfaces/antifraud-engine.interface';
import { TransactionRepository } from '../../infrastructure/persistence/transaction.repository';
import { TransactionService } from './transaction.service';
import { GeoIpProvider } from '../../infrastructure/providers/geoip.provider';
import { GeoIPResponse } from 'src/application/interfaces/geo-ip-response.interface';



// Lista de países restringidos para este ejemplo
const restrictedCountries = ['CountryA', 'CountryB'];

@Injectable()
export class AntifraudService implements AntifraudEngine {
  private readonly logger = new Logger(TransactionService.name);
  private readonly transactionAttemptLimit = 4;
  private readonly allowedCountry = 'AR';
  private readonly allowedIps = ['127.0.0.1', '::1'];
  constructor(
    private readonly transactionRepository: TransactionRepository,
    private readonly geoIpProvider: GeoIpProvider,

  ) { }
  async validateTransaction(transaction: Transaction): Promise<boolean> {
    const amoutLimitByTransaction = parseInt(process.env.LIMIT_BY_TRANSACTIONS);


    if (transaction.amount > amoutLimitByTransaction) {
      console.log(`Transacción marcada como fraudulenta: monto mayor a $1000`);
      return false;
    }
    console.log('PASOOOOOO MONNTOOOO VALIDO')
    const recentTransactions = await this.transactionRepository.findLastTenMinutesByCustomerHash(transaction.customer_hash);
    if (recentTransactions.length >= this.transactionAttemptLimit) {
      this.logger.warn(`Transaction ${transaction.transactionId} marked as fraudulent due to high frequency`);
      return false;
    }

    const currentGeoData = await this.geoIpProvider.getGeoData(transaction.source_ip);

    if (!this.allowedIps.includes(transaction.source_ip) && recentTransactions.length !== 0) {
      const isIpValid = await this.validateIpAgainstHistory(currentGeoData, recentTransactions);
      if (!isIpValid) {
        this.logger.warn(`Transaction blocked: IP ${transaction.source_ip} is unusual for customer hash: ${transaction.customer_hash}`);
        return false;
      }
    }

    return true;
  }

  private async validateIpAgainstHistory(
    currentGeoData: GeoIPResponse,
    previousTransactions: Transaction[],
  ): Promise<boolean> {
    const previousGeoDataPromises = previousTransactions.map((tx) =>
      this.geoIpProvider.getGeoData(tx.source_ip)
    );
    const previousGeoDataList = await Promise.all(previousGeoDataPromises);

    const matchingCountry = previousGeoDataList.some(
      (geoData) => geoData.countryCode === currentGeoData.countryCode
    );


    const matchingIp = previousTransactions.some(
      (tx) => tx.source_ip === currentGeoData.query
    );

    return matchingCountry || matchingIp;
  }
}
