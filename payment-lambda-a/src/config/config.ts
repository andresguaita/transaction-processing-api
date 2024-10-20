import dotenv from 'dotenv';
dotenv.config();

export const config = {
    TABLE_NAME: process.env.TABLE_NAME || 'Transactions',
    DYNAMO_ENDPOINT: process.env.DYNAMO_ENDPOINT || 'http://host.docker.internal:4566',
    AWS_REGION: process.env.AWS_REGION || 'us-east-1'
};
