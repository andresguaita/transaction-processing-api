import { Injectable } from '@nestjs/common';
import { Transaction } from '../entities/transaction.entity';
import { Account } from '../entities/account.entity';

@Injectable()
export class ValidationService {
  validate(transaction: Transaction, account: Account): boolean {
    return transaction.amount <= account.balance;
  }

  checkForFraud(transaction: Transaction): boolean {

    return false;
  }
}
