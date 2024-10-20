import { Controller, Post, Body, Req } from '@nestjs/common';
import { Request } from 'express';
import { CreateTransactionDto } from '../dtos/create-transaction.dto';
import { TransactionService } from '../../domain/services/transaction.service';

@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Post()
  async createTransaction(@Body() createTransactionDto: CreateTransactionDto, @Req() req: Request) {
    let clientIp: string;
    if(req.headers['x-forwarded-for']){ [clientIp] = (<string>req.headers['x-forwarded-for']).split(',')}
    else{clientIp= '127.0.0.1'}
    console.log('REEEED IP',clientIp)
    req.body.clientIp = clientIp;
    const result = await this.transactionService.createTransaction(createTransactionDto, clientIp);
    return { message: 'Transaction submitted and is being processed', data: result };
  }
}
