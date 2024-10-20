provider "aws" {
  access_key                  = "test"
  secret_key                  = "test"
  region                      = "us-east-1"

  s3_use_path_style           = true
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    dynamodb = "http://localhost:4566"
    sqs      = "http://localhost:4566"
    lambda   = "http://localhost:4566"
    iam     = "http://localhost:4566"
  }
}

# DynamoDB Tables: Accounts, Transactions, and Merchants
resource "aws_dynamodb_table" "accounts_table" {
  name         = "Accounts"
  hash_key     = "account_id"
  billing_mode = "PAY_PER_REQUEST"

  attribute {
    name = "account_id"
    type = "S"
  }

  attribute {
    name = "balance"
    type = "N"
  }

  attribute {
    name = "created_at"
    type = "S"
  }

  attribute {
    name = "currency"
    type = "S"
  }

  attribute {
    name = "updated_at"
    type = "S"
  }

  global_secondary_index {
    name               = "CreatedAtIndex"
    hash_key           = "created_at"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "BalanceIndex"
    hash_key           = "balance"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "CurrencyIndex"
    hash_key           = "currency"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "UpdatedAtIndex"
    hash_key           = "updated_at"
    projection_type    = "ALL"
  }
}

resource "aws_dynamodb_table" "transactions_table" {
  name         = "Transactions"
  hash_key     = "transaction_id"
  billing_mode = "PAY_PER_REQUEST"

  attribute {
    name = "transaction_id"
    type = "S"
  }

  attribute {
    name = "account_id"
    type = "S"
  }

  attribute {
    name = "merchant_id"
    type = "S"
  }

  attribute {
    name = "status"
    type = "S"
  }

  attribute {
    name = "payment_type"
    type = "S"
  }

  global_secondary_index {
    name               = "AccountIndex"
    hash_key           = "account_id"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "StatusIndex"
    hash_key           = "status"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "PaymentTypeIndex"
    hash_key           = "payment_type"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "MerchantIndex"
    hash_key           = "merchant_id"
    projection_type    = "ALL"
  }
}

resource "aws_dynamodb_table" "merchants_table" {
  name         = "Merchants"
  hash_key     = "merchant_id"
  billing_mode = "PAY_PER_REQUEST"

  attribute {
    name = "merchant_id"
    type = "S"
  }

  attribute {
    name = "account_id"
    type = "S"
  }

  attribute {
    name = "created_at"
    type = "S"
  }

  attribute {
    name = "document_type"
    type = "S"
  }

  attribute {
    name = "amount_limit"
    type = "N"
  }

  attribute {
    name = "merchant_type"
    type = "S"
  }

  attribute {
    name = "name"
    type = "S"
  }

  attribute {
    name = "legal_name"
    type = "S"
  }

  global_secondary_index {
    name               = "DocumentTypeIndex"
    hash_key           = "document_type"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "AmountLimitIndex"
    hash_key           = "amount_limit"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "CreatedAtIndex"
    hash_key           = "created_at"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "MerchantTypeIndex"
    hash_key           = "merchant_type"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "NameIndex"
    hash_key           = "name"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "LegalNameIndex"
    hash_key           = "legal_name"
    projection_type    = "ALL"
  }

  global_secondary_index {
    name               = "AccountIdIndex"
    hash_key           = "account_id"
    projection_type    = "ALL"
  }
}


# Declarar la variable para la tabla Transactions
variable "dynamodb_transactions_table" {
  description = "Name of the DynamoDB Transactions table"
  type        = string
  default     = "Transactions"  # Establece un valor por defecto
}

# Declarar la variable para la tabla Accounts
variable "dynamodb_accounts_table" {
  description = "Name of the DynamoDB Accounts table"
  type        = string
  default     = "Accounts"  # Establece un valor por defecto
}

# Declarar la variable para la tabla Merchants
variable "dynamodb_merchants_table" {
  description = "Name of the DynamoDB Merchants table"
  type        = string
  default     = "Merchants"  # Establece un valor por defecto
}

# Declarar la variable para el endpoint de DynamoDB
variable "dynamodb_endpoint" {
  description = "DynamoDB endpoint (local or cloud)"
  type        = string
  default     = "http://localhost:4566"  
}

resource "aws_lambda_function" "lambda_payment_method_a" {
  function_name = "lambda-payment-method-a"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  timeout = 60
  filename      = "../../payment-lambda-a/src/handler.zip"
  role          = aws_iam_role.lambda_exec.arn
  environment {
    variables = {
      TABLE_NAME = "Transactions",
       URL = "http://host.docker.internal:4566"
    }
  } 
}

resource "aws_iam_role" "lambda_exec" {
  name = "lambda_exec_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "lambda_policy" {
  name = "lambda_policy"
  role = aws_iam_role.lambda_exec.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes"
        ]
        Effect   = "Allow"
        Resource = "arn:aws:sqs:us-east-1:000000000000:payment-method-a-queue"
      },
      {
        Action = [
          "dynamodb:UpdateItem",
          "dynamodb:GetItem"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

# Dead Letter Queue for PaymentMethodA and PaymentMethodB
resource "aws_sqs_queue" "dlq" {
  name                        = "payment-dead-letter-queue"
  message_retention_seconds    = 1209600  # 14 days retention
}

# SQS Queue for PaymentMethodA
resource "aws_sqs_queue" "payment_method_a_queue" {
  name                        = "payment-method-a-queue"
  visibility_timeout_seconds   = 30
  message_retention_seconds    = 86400
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount     = 5
  })
}

# SQS Queue for PaymentMethodB
resource "aws_sqs_queue" "payment_method_b_queue" {
  name                        = "payment-method-b-queue"
  visibility_timeout_seconds   = 30
  message_retention_seconds    = 86400
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.dlq.arn
    maxReceiveCount     = 5
  })

}
resource "aws_lambda_event_source_mapping" "sqs_lambda_trigger" {
  event_source_arn = aws_sqs_queue.payment_method_a_queue.arn
  function_name    = aws_lambda_function.lambda_payment_method_a.arn
  batch_size       = 1
  enabled          = true
    
  depends_on = [
    aws_lambda_function.lambda_payment_method_a
  ]
}

