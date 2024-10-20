import { Transaction } from "src/domain/entities/transaction.entity";

export interface AntifraudEngine {
    validateTransaction(transaction: Transaction): Promise<boolean>;
  }
  