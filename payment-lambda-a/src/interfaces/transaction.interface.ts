export interface Transaction{
    transactionId: string,
    accountId: string,
    merchantId: string,
    status: string,
    created_at: string,
    amount:number,
    payment_type: string

}