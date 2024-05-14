import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import type { Construct } from 'constructs';

import { accountId, environment, region } from '../variables';

export const envVariables = (scope: Construct) => ({
    NODE_ENV: environment,
    SENTRY_DSN:
        'https://ab994d3b0e374c8a83ef95055069d63b@o157451.ingest.sentry.io/6531328',
    SERVERLESS_STAGE: environment,
    SM_NAME: 'talent-management-postgresql-credential',
    REDIS_SM_NAME: 'redis-credentials',
    REGION: region,
    AUTH0_SM_NAME: 'talent-management-auth0-m2m-credentials',
    AWS_ALB_DNS: StringParameter.valueForStringParameter(
        scope,
        '/configs/api/AWS_ALB_BASE_DNS',
    ),
    AUTH0_ENTERPRISE_DOMAIN: StringParameter.valueForStringParameter(
        scope,
        '/configs/api/AUTH0_ENTERPRISE_DOMAIN',
    ),
    AUTH0_ENTERPRISE_API_AUDIENCE: StringParameter.valueForStringParameter(
        scope,
        '/configs/auth0/AUTH0_ENTERPRISE_API_AUDIENCE',
    ),
    TALENT_MANAGEMENT_DOMAIN_FIFO_QUEUE:
        StringParameter.valueForStringParameter(
            scope,
            '/configs/api/AWS_SQS_BASE_DNS',
        ) + 'talent-management-domain-queue.fifo',
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
    GCP_CLIENT_LIBRARY_CONFIG: JSON.stringify({
        audience:
            '//iam.googleapis.com/projects/564311958262/locations/global/workloadIdentityPools/aws-sandbox/providers/pulsifi-aws-sandbox',
        credential_source: {
            environment_id: 'aws1',
            region_url:
                'http://169.254.169.254/latest/meta-data/placement/availability-zone',
            regional_cred_verification_url:
                'https://sts.{region}.amazonaws.com?Action=GetCallerIdentity\u0026Version=2011-06-15',
            url: 'http://169.254.170.2$AWS_CONTAINER_CREDENTIALS_RELATIVE_URI',
        },
        service_account_impersonation_url:
            'https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/talent-management-fn@data-sandbox-warehouse.iam.gserviceaccount.com:generateAccessToken',
        subject_token_type: 'urn:ietf:params:aws:token-type:aws4_request',
        token_url: 'https://sts.googleapis.com/v1/token',
        type: 'external_account',
    }),
    RECOMMENDATION_API_URL: StringParameter.valueForStringParameter(
        scope,
        '/talent-management-fn/RECOMMENDATION_API_URL',
    ),
    RECOMMENDATION_STATE_MACHINE_ARN: `arn:aws:states:${region}:${accountId}:stateMachine:feedback-recommendation-generator`,
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
