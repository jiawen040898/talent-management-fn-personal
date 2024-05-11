import { custom } from './custom';
import { functions } from './functions';
import { plugins } from './plugins';
import { stepFunctions } from './step-functions';

export const main = {
    service: 'talent-management-fn',
    frameworkVersion: '3',
    useDotenv: true,
    configValidationMode: 'warn',
    package: {
        individually: true,
    },
    provider: {
        name: 'aws',
        runtime: 'nodejs20.x',
        versionFunctions: true,
        stackName: 'talent-management-fn-${opt:stage}-stack',
        region: '${opt:region}',
        memorySize: 256,
        timeout: 30,
        logRetentionInDays: '${ssm:/configs/LOG_RETENTION_IN_DAYS}',
        iam: {
            role: 'arn:aws:iam::${aws:accountId}:role/talent-management-lambda-role',
        },
        vpc: {
            securityGroupIds: [
                '${ssm:/talent-management-fn/VPC_SECURITY_GROUP_IDS}',
            ],
            subnetIds: '${ssm:/configs/VPC_PRIVATE_SUBNET_IDS}',
        },
        stackTags: {
            Environment: '${opt:stage}',
            Owner: 'dev-team@pulsifi.me',
            Version: '${env:TAG_VERSION}',
        },
        environment: {
            NODE_ENV: '${opt:stage}',
            SENTRY_DSN:
                'https://ab994d3b0e374c8a83ef95055069d63b@o157451.ingest.sentry.io/6531328',
            SERVERLESS_STAGE: '${opt:stage}',
            SM_NAME: 'talent-management-postgresql-credential',
            REDIS_SM_NAME: 'redis-credentials',
            REGION: '${aws:region}',
            AUTH0_SM_NAME: 'talent-management-auth0-m2m-credentials',
            AWS_ALB_DNS: '${ssm:/configs/api/AWS_ALB_BASE_DNS}',
            AUTH0_ENTERPRISE_DOMAIN:
                '${ssm:/configs/api/AUTH0_ENTERPRISE_DOMAIN}',
            AUTH0_ENTERPRISE_API_AUDIENCE:
                '${ssm:/configs/auth0/AUTH0_ENTERPRISE_API_AUDIENCE}',
            TALENT_MANAGEMENT_DOMAIN_FIFO_QUEUE:
                '${ssm:/configs/api/AWS_SQS_BASE_DNS}talent-management-domain-queue.fifo',
            TALENT_MANAGEMENT_SNS_DOMAIN_FIFO_TOPIC:
                'arn:aws:sns:${aws:region}:${aws:accountId}:talent-management-domain-topic.fifo',
            EMPLOYEE_APP_URL: '${ssm:/configs/PULSIFI_EMPLOYEE_APP_URL}',
            PULSIFI_ASSETS_DOMAIN: '${ssm:/configs/PULSIFI_ASSETS_DOMAIN}',
            GCP_PROJECT_ID: '${ssm:/configs/GOOGLE_CLOUD_PROJECT}',
            GCP_REGION: '${ssm:/configs/GCP_REGION}',
            GCP_CLIENT_LIBRARY_CONFIG:
                '${ssm:/talent-management-fn/GCP_SVC_ACCOUNT_CONFIGS}',
            RECOMMENDATION_API_URL:
                '${ssm:/talent-management-fn/RECOMMENDATION_API_URL}',
            RECOMMENDATION_STATE_MACHINE_ARN:
                '${ssm:/talent-management-fn/RECOMMENDATION_STATE_MACHINE_ARN}',
            UNLEASH_API_KEY: '${ssm:/configs/UNLEASH_API_KEY}',
            UNLEASH_API_URL: '${ssm:/configs/UNLEASH_API_URL}',
            UNLEASH_ENV: '${ssm:/configs/UNLEASH_ENV}',
            UNLEASH_PROJECT_ID: '${ssm:/configs/UNLEASH_PROJECT_ID}',
        },
        deploymentBucket: {
            blockPublicAccess: true,
            name: 'talent-management-fn-${opt:stage}-${opt:region}-stack-bucket-1',
            maxPreviousDeploymentArtifacts: 5,
            serverSideEncryption: 'AES256',
        },
    },

    plugins,
    custom,
    functions,
    stepFunctions,
};

export default main;
