import { Controller, Post, Body } from '@nestjs/common';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { TransactionService } from '../../domain/services/transaction.service';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    console.log('CREATEEEE DTO',createTransactionDto)
    const result= await this.transactionService.createTransaction(createTransactionDto);
    return { message: 'Transaction submitted and is being processed', data: result };
  }
}
