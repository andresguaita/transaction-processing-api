provider "aws" {

  access_key                  = "mock_access_key"
  secret_key                  = "mock_secret_key"
  region                      = "us-east-1"

  s3_use_path_style           = true
  skip_credentials_validation = true
  skip_metadata_api_check     = true
  skip_requesting_account_id  = true

  endpoints {
    dynamodb = "http://localhost:4566"
    sqs = "http://localhost:4566"
  }
}
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

  # GSI to created_at
  global_secondary_index {
    name               = "CreatedAtIndex"
    hash_key           = "created_at"
    projection_type    = "ALL"
  }

    # GSI to balance
  global_secondary_index {
    name               = "BalanceIndex"
    hash_key           = "balance"
    projection_type    = "ALL"
  }

  # GSI to currency
  global_secondary_index {
    name               = "CurrencyIndex"
    hash_key           = "currency"
    projection_type    = "ALL"
  }

  # GSI to updated_at
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

  # GSI to account_id
  global_secondary_index {
    name               = "AccountIndex"
    hash_key           = "account_id"
    projection_type    = "ALL"
  }

    # GSI to status
  global_secondary_index {
    name               = "StatusIndex"
    hash_key           = "status"
    projection_type    = "ALL"
  }

  # GSI to merchant_id
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

  # Global Secondary Index for document_type
  global_secondary_index {
    name               = "DocumentTypeIndex"
    hash_key           = "document_type"
    projection_type    = "ALL"
  }

    # Global Secondary Index for amount_limit
  global_secondary_index {
    name               = "AmountLimitIndex"
    hash_key           = "amount_limit"
    projection_type    = "ALL"
  }

  # Global Secondary Index for created_at
  global_secondary_index {
    name               = "CreatedAtIndex"
    hash_key           = "created_at"
    projection_type    = "ALL"
  }

  # Global Secondary Index for merchant_type
  global_secondary_index {
    name               = "MerchantTypeIndex"
    hash_key           = "merchant_type"
    projection_type    = "ALL"
  }

  # Global Secondary Index for name
  global_secondary_index {
    name               = "NameIndex"
    hash_key           = "name"
    projection_type    = "ALL"
  }

  # Global Secondary Index for legal_name
  global_secondary_index {
    name               = "LegalNameIndex"
    hash_key           = "legal_name"
    projection_type    = "ALL"
  }

  # Global Secondary Index for account_id
  global_secondary_index {
    name               = "AccountIdIndex"
    hash_key           = "account_id"
    projection_type    = "ALL"
  }
}



resource "aws_sqs_queue" "transaction_queue" {
  name = "transaction-queue"
}
