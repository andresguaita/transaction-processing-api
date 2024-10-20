export interface Transaction{
    transactionId: string,
    accountId: string,
    merchantId: string,
    status: string,
    createdAt: string,
    amount:number,
    payment_type: string

}