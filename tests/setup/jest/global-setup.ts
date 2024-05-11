const global = () => {
    process.env.REGION = 'ap-southeast-1';
    process.env.SENTRY_DSN = 'https://test.pulsifi.me/sentry';
    process.env.SERVERLESS_STAGE = 'test';
    process.env.AWS_SESSION_TOKEN = 'the-token';
    process.env.AWS_ALB_DNS = 'https://alb.test.pulsifi.me';
    process.env.TALENT_MANAGEMENT_DOMAIN_FIFO_QUEUE = 'arn:sqs:xxx';
    process.env.TALENT_MANAGEMENT_SNS_DOMAIN_FIFO_TOPIC = 'arn:sns:xxx';
    process.env.AUTH0_ENTERPRISE_DOMAIN = 'auth0:xxx';
    process.env.AUTH0_ENTERPRISE_API_AUDIENCE = 'auth0:xxx';
    process.env.AUTH0_SM_NAME = 'auth-sm-name';
    process.env.EMPLOYEE_APP_URL = 'https://local-employee.pulsifi.me';
    process.env.PULSIFI_ASSETS_DOMAIN =
        'https://pulsifi-sandbox-assets.s3.ap-southeast-1.amazonaws.com';
    process.env.GCP_CLIENT_LIBRARY_CONFIG = '{}';
    process.env.GCP_PROJECT_ID = 'data-sandbox-warehouse';
    process.env.GCP_REGION = 'asia-southeast1';
    process.env.RECOMMENDATION_API_URL = 'https://fake-recommendation-api.com';
    process.env.UNLEASH_API_KEY =
        'default:development.58a58ec16b64df5c7a2a62fc7e063fb548d2476a6cb452cff85f5d03';
    process.env.UNLEASH_API_URL =
        'https://us.app.unleash-hosted.com/usab1009/api/';
    process.env.UNLEASH_ENV = 'sandbox';
    process.env.UNLEASH_PROJECT_ID = 'default';
};

export default global;
