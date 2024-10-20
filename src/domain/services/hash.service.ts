import * as crypto from 'crypto';
import { Injectable } from '@nestjs/common';

@Injectable()
export class HashService {
  generateCustomerHash(fullName: string, documentNumber: string): string {
    const dataToHash = `${fullName.toLocaleLowerCase()}-${documentNumber}`;
    return crypto.createHash('sha256').update(dataToHash).digest('hex');
  }
}
