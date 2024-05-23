import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import type { Construct } from 'constructs';

import { CommonCDKEnvironmentVariables } from '../interfaces';
import { accountId, environment, region } from '../variables';

export const commonEnvironmentVariables = (
    scope: Construct,
): CommonCDKEnvironmentVariables => ({
    NODE_ENV: environment,
    SENTRY_DSN:
        'https://d6994d3b0e374c8a83ef95055069d63b@o157451.ingest.sentry.io/6531328',
    SERVERLESS_STAGE: environment,
    SM_NAME: 'talent-management-postgresql-credential',
    REDIS_SM_NAME: 'redis-credentials',
    REGION: region,
    AUTH0_SM_NAME: 'talent-management-auth0-m2m-credentials',
    AWS_ALB_DNS: StringParameter.valueForStringParameter(
        scope,
        '/configs/AWS_ALB_BASE_DNS',
    ),
    AUTH0_ENTERPRISE_DOMAIN: StringParameter.valueForStringParameter(
        scope,
        '/configs/api/AUTH0_ENTERPRISE_DOMAIN',
    ),
    AUTH0_ENTERPRISE_API_AUDIENCE: StringParameter.valueForStringParameter(
        scope,
        '/configs/auth0/AUTH0_ENTERPRISE_API_AUDIENCE',
    ),
    TALENT_MANAGEMENT_DOMAIN_FIFO_QUEUE: `${StringParameter.valueForStringParameter(
        scope,
        '/configs/api/AWS_SQS_BASE_DNS',
    )}talent-management-domain-queue.fifo`,
    TALENT_MANAGEMENT_SNS_DOMAIN_FIFO_TOPIC: `arn:aws:sns:${region}:${accountId}:talent-management-domain-topic.fifo`,
    EMPLOYEE_APP_URL: StringParameter.valueForStringParameter(
        scope,
        '/configs/PULSIFI_EMPLOYEE_APP_URL',
    ),
    PULSIFI_ASSETS_DOMAIN: StringParameter.valueForStringParameter(
        scope,
        '/configs/PULSIFI_ASSETS_DOMAIN',
    ),
    GCP_PROJECT_ID: StringParameter.valueForStringParameter(
        scope,
        '/configs/GOOGLE_CLOUD_PROJECT',
    ),
    GCP_REGION: StringParameter.valueForStringParameter(
        scope,
        '/configs/GCP_REGION',
    ),
    RECOMMENDATION_STATE_MACHINE_ARN: `arn:aws:states:${region}:${accountId}:stateMachine:feedbackRecommendationGenerator`,
    UNLEASH_API_KEY: StringParameter.valueForStringParameter(
        scope,
        '/configs/UNLEASH_API_KEY',
    ),
    UNLEASH_API_URL: StringParameter.valueForStringParameter(
        scope,
        '/configs/UNLEASH_API_URL',
    ),
    UNLEASH_ENV: StringParameter.valueForStringParameter(
        scope,
        '/configs/UNLEASH_ENV',
    ),
    UNLEASH_PROJECT_ID: StringParameter.valueForStringParameter(
        scope,
        '/configs/UNLEASH_PROJECT_ID',
    ),
});
