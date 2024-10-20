import { IsJSON, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { CustomerData } from '../interfaces/customer-data.interface';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  accountId: string;

  @IsString()
  @IsNotEmpty()
  merchantId: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsNotEmpty()
  paymentType: string;

  @IsJSON()
  @IsNotEmpty()
  customerData: CustomerData;

}
