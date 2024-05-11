# Talent Management Lambda

-   Process assessment and fit score from Person Score Calculation
-   Process cron scheduler to perform learning and feedback notification

## Setup

-   check that SQS / SNS are configured properly in serverless.yml
-   check that an IAM role similar to 'notification-fn-role' is assigned

```bash
- sls deploy --stage sandbox --awsAccountId xxxxxxxx --awsIAMRole <optional>
```

## AWS VPC setup

-   lambda: must have VPC and subnets similar to RDS assigned
-   lambda: create a security group 'aws-lambda-sqs-to-rds-sg', allow inbound by RDS security group
-   RDS security group: allow inbound by 'aws-lambda-sqs-to-rds-sg'

## Local testing

```bash
success:

RDS -> sls invoke local --stage sandbox --function receiver --path tests/samples/candidate_application_submitted.json
SNS -> sls invoke local --stage sandbox --awsAccountId xxxxxxx --function handler --path tests/sample-sqs-to-sns.json

failure:

sls invoke local --stage sandbox --awsAccountId xxxxxxx --function handler
```

-   For SNS testing, check that your message is generated in the SQS attached to the SNS.

## Deploy to AWS from local

1. Run `yarn install`
2. Run the following command:

```bash
TAG_VERSION=local-$(date -u +%Y%m%d-%H%M%S) yarn sls deploy --stage {{ ENVIRONMENT }} --region {{ REGION }}
```

For Window Powershell:

```shell
$Env:TAG_VERSION="0."+$(Get-Date -UFormat +%Y%m%d.%H%M%S)
yarn sls deploy --stage {{ ENVIRONMENT }} --region {{ REGION }}
```

**Note**: Replace `{{ ENVIRONMENT }}` and `{{ REGION }}` with the environment and region that you are intended to deploy
