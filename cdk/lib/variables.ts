import {
    type AwsEnvironment,
    type AwsRegion,
    PulsifiUtils,
} from '@pulsifi/custom-aws-cdk-lib';

export const version = process.env.BUILD_TAG as string;
export const environment: AwsEnvironment = new PulsifiUtils().getAwsEnvironment(
    `${process.env.NODE_ENV}`,
);
export const accountId = (process.env.CDK_DEPLOY_ACCOUNT ??
    process.env.CDK_DEFAULT_ACCOUNT) as string;
export const region: AwsRegion = (process.env.CDK_DEPLOY_REGION ??
    process.env.CDK_DEFAULT_REGION) as AwsRegion;
