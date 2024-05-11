import { envUtil } from '@pulsifi/fn';

export const sqs = () => ({
    region: envUtil.get('REGION'),
    apiVersion: '2012-11-05',
    queueUrl: envUtil.get('TALENT_MANAGEMENT_DOMAIN_FIFO_QUEUE'),
});

export const sns = () => ({
    region: envUtil.get('REGION'),
    apiVersion: '2010-03-31',
    topic: envUtil.get('TALENT_MANAGEMENT_SNS_DOMAIN_FIFO_TOPIC'),
});

export const alb = () => ({
    dns: envUtil.get('AWS_ALB_DNS'),
});

export const auth0 = () => ({
    domain: envUtil.get('AUTH0_ENTERPRISE_DOMAIN'),
    audience: envUtil.get('AUTH0_ENTERPRISE_API_AUDIENCE'),
    grantType: 'client_credentials',
    secretName: envUtil.get('AUTH0_SM_NAME'),
});

export const appUrl = () => ({
    employee: envUtil.get('EMPLOYEE_APP_URL'),
    assetsDomain: envUtil.get('PULSIFI_ASSETS_DOMAIN'),
});

export const stateMachine = () => ({
    region: envUtil.get('REGION'),
    stateMachineName: envUtil.get('RECOMMENDATION_STATE_MACHINE_ARN'),
});
