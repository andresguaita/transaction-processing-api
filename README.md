
# Transaction Processing API

## Project Description

This project is a **Transaction Processing API** that handles large-scale financial transactions. The API is designed to manage transactions asynchronously using a queuing system. By simulating parts of AWS infrastructure with **LocalStack** and managing the infrastructure with **Terraform**, the API is scalable, fault-tolerant, and follows **Domain-Driven Design (DDD)** principles. Additionally, a **validation algorithm** is implemented for fraud detection and transaction integrity.

## Project Architecture

The API is built following scalability principles and Domain-Driven Design (DDD). The architecture includes several key components described below:

### 1. **NestJS for the API**:
   - The API is implemented using **NestJS** to handle incoming requests and enqueue transactions in **SQS** (simulated with **LocalStack**).
   - DDD principles are followed, with entities like `Transaction` and `Account`.

### 2. **Asynchronous Processing with AWS Lambda**:
   - Transactions are enqueued in **SQS** for asynchronous processing.
   - **AWS Lambda** functions (simulated with LocalStack) are used to consume transactions from the queue and process them in the background, ensuring the API remains scalable and highly available.
   - **Retry Logic**: Lambdas are configured with retry logic to handle transient failures, ensuring that transactions are processed correctly even in case of temporary errors.

### 3. **DynamoDB for Storing Results**:
   - Transaction results (success, failure, error) are stored in **DynamoDB** (simulated with LocalStack).
   - The database architecture follows eventual consistency principles, allowing the system to be scalable while validating transactions asynchronously.

### 4. **Transaction Validation Algorithm**:
   - An algorithm validates each transaction based on specific rules:
     - **Validation of the amount allowed on the platform**: It validates that the amount that the user tries to pay does not exceed the amount established for a transaction.
     - **Fraud Detection**: Based on historical transaction patterns, the system decides if the transaction is suspicious or valid.
   - The logic is implemented within a separate service following DDD principles to maintain modularity and code reuse.

### 5. **Infrastructure Setup with Terraform**:
   - The infrastructure (SQS, DynamoDB, and Lambdas) is defined and provisioned using **Terraform** and simulated with **LocalStack** for local development.
   - Terraform scripts configure the necessary resources for the API to operate autonomously and scalably.

## Architectural Decision: Scalability vs. Consistency

In the development of our **Transaction Processing API**, scalability has been prioritized. The main reason behind this decision is the nature of a payment gateway, where processing transactions efficiently and at a large scale is crucial. If a payment is not processed due to capacity limitations, this directly translates into revenue loss and customer dissatisfaction. Therefore, ensuring the system can handle high volumes of transactions without bottlenecks is essential.

### Technical Justification for Scalability

1. **Use of AWS Lambda for Asynchronous Processing**:
   - AWS Lambda functions are used to process transactions asynchronously from the queue (SQS).
   - **Benefits**:
     - **Scalability**: Lambdas automatically scale according to the load, ensuring that even during high-demand transaction periods, the system can process multiple transactions concurrently without manual intervention.
     - **Fault Tolerance**: AWS Lambda’s retry mechanisms and integration with SQS provide robust error handling and retry logic, allowing the system to recover efficiently from transient failures.
     - **Cost Efficiency**: Lambdas operate on a pay-per-use model, ensuring resources are only used when needed, which is ideal for high-transaction environments that may experience activity spikes.

2. **Eventual Consistency Approach**:
   - Although the system prioritizes scalability, **eventual consistency** is used to ensure that data remains consistent over time. This approach allows the system to process transactions quickly while maintaining a background process to ensure data integrity.
   - **How It Works**:
     - Transactions are processed and validated asynchronously, enabling the API to handle high performance.
     - In cases where inconsistencies arise (e.g., when a transaction temporarily fails due to a network issue), the system reprocesses these transactions and corrects any discrepancies asynchronously.
     - This approach allows for a balance between high performance and data consistency, ensuring the integrity of transactions without compromising processing speed.

3. **Trade-offs and Considerations**:
   - **Consistency**: By choosing scalability, we acknowledge that **strict consistency** (where each transaction is validated and processed end-to-end immediately) is not fully guaranteed. However, the implementation of eventual consistency ensures that any temporary inconsistencies are resolved over time.
   - **High Availability**: The use of scalable serverless functions (Lambdas) ensures that the system remains highly available, distributing transaction processing workloads efficiently and avoiding system downtime.

![System Architecture Diagram](https://res.cloudinary.com/dxymci4b6/image/upload/v1729465252/m26f7s09f9ahpryvzjq4.png)
![Flow Chart](https://res.cloudinary.com/dxymci4b6/image/upload/v1729465248/gd879xfw1oo0s2fcqsge.png)

## Setup Instructions

1. **Generate Lambda Zips**:
   - Generate zip for lambdas payment method a and b .
      1.- Move to terraform folder `cd payment-lambda-a`.
      2.- Run  `npm install`
      3.- Run `npx tsc`
      4.- If you are in mac/linux `zip -r src/handler.zip src/ node_modules/ package.json` or if you are in windows `Compress-Archive -Path .\src\*, .\node_modules\*, .\package.json -DestinationPath .\src\handler.zip`.
      5.- Repeat for lambda payment-lambda-b .

2. **Run LocalStack**:
   - Install and configure LocalStack with docker `docker-compose up -d`.
   - Run the Terraform scripts to provision the AWS resources simulated in LocalStack
      1.- Move to terraform folder `cd scripts/terraform`.
      2.- Run  `terraform init`
      3.- Run `terraform apply --auto-approve`

3. **Run the API**:
   - Install dependencies with `npm install`.
   - Start the NestJS API with `npm run start:dev`.

## Endpoints

### 1. **POST /transactions**

This endpoint allows the creation of a financial transaction that will be processed asynchronously.

- **URL**: `/transactions`
- **Method**: `POST`
- **Request Body (JSON)**:
  ```json
    {
  "accountId": "123456789",
  "merchantId": "987654321",
  "amount": 100,
  "paymentType": "PaymentMethodA",
	"customerData": {
		"full_name": "Jaime Perez",
		"documentNumber": "1000000000"
	 }
   }
  ```
- **Field Descriptions**:
  - `accountId`: ID of the account making the transaction.
  - `merchanId`: ID of the merchant for which the transaction is made.
  - `amount`: The amount of the transaction.
  - `paymentType`: The payment method used for transaction.
  - `customerData`: Data of customer.

- **Response**: The system returns a 201 status if the transaction is successfully submitted to the queue for processing.

- **Example Response (201 - Created)**:
  ```json
    {
	"message": "Transaction submitted and is being processed",
	"data": {
		"transactionId": "txn_1729460408158",
		"accountId": "123456789",
		"merchantId": "987654321",
		"status": "PENDING",
		"created_at": "2024-10-20T21:40:08.158Z",
		"amount": 100,
		"payment_type": "PaymentMethodA",
		"customer_hash": "8f6f2898504d836c8c75c14628afdafd63ee9c017802b4c36d6fa3c879c5f4e5",
		"source_ip": "127.0.0.1",
		"customer_data": {
			"full_name": "Jaime Perez",
			"documentNumber": "1000000000"
		}
	}
   }
  ```