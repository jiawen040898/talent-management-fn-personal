export type CommonCDKEnvironmentVariables = {
    NODE_ENV: string;
    SENTRY_DSN: string;
    SERVERLESS_STAGE: string;
    SM_NAME: string;
    REDIS_SM_NAME: string;
    AUTH0_SM_NAME: string;
    REGION: string;
    AWS_ALB_DNS: string;
    AUTH0_ENTERPRISE_DOMAIN: string;
    AUTH0_ENTERPRISE_API_AUDIENCE: string;
    TALENT_MANAGEMENT_DOMAIN_FIFO_QUEUE: string;
    TALENT_MANAGEMENT_SNS_DOMAIN_FIFO_TOPIC: string;
    EMPLOYEE_APP_URL: string;
    PULSIFI_ASSETS_DOMAIN: string;
    GCP_PROJECT_ID: string;
    GCP_REGION: string;
    RECOMMENDATION_STATE_MACHINE_ARN: string;
    UNLEASH_API_KEY: string;
    UNLEASH_API_URL: string;
    UNLEASH_ENV: string;
    UNLEASH_PROJECT_ID: string;
};

export type CDKEnvironmentVariables = {
    GCP_CLIENT_LIBRARY_CONFIG: string;
    RECOMMENDATION_API_URL: string;
} & CommonCDKEnvironmentVariables;
