import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

import { accountId } from '../../variables';

const parameterStorePermissions = new PolicyStatement({
    actions: [
        'ssm:GetParameter',
        'ssm:GetParameters',
        'ssm:GetParametersByPath',
    ],
    effect: Effect.ALLOW,
    resources: [
        `arn:aws:ssm:*:${accountId}:parameter/talent-management-fn/*`,
        `arn:aws:ssm:*:${accountId}:parameter/configs/*`,
    ],
    sid: 'ParameterStorePermissions',
});

const snsPermissions = new PolicyStatement({
    actions: ['sns:Publish'],
    effect: Effect.ALLOW,
    resources: [
        `arn:aws:sns:*:${accountId}:talent-management-topic.fifo`,
        `arn:aws:sns:*:${accountId}:talent-management-domain-topic.fifo`,
    ],
    sid: 'SNSPermissions',
});

const sqsPermissions = new PolicyStatement({
    actions: [
        'sqs:DeleteMessage',
        'sqs:GetQueueUrl',
        'sqs:ReceiveMessage',
        'sqs:SendMessage',
        'sqs:GetQueueAttributes',
    ],
    effect: Effect.ALLOW,
    resources: [
        `arn:aws:sqs:*:${accountId}:talent-management-domain-queue.fifo`,
        `arn:aws:sqs:*:${accountId}:talent-management-lxp-manager-subordinate-progress-report-queue`,
        `arn:aws:sqs:*:${accountId}:talent-management-feedback-cycle-reminder-queue`,
        `arn:aws:sqs:*:${accountId}:talent-management-feedback-cycle-action-queue`,
        `arn:aws:sqs:*:${accountId}:talent-management-feedback-recommendation-generation-initialize-queue.fifo`,
    ],
    sid: 'SQSPermissions',
});

const secretManagerPermissions = new PolicyStatement({
    actions: ['secretsmanager:DescribeSecret', 'secretsmanager:GetSecretValue'],
    effect: Effect.ALLOW,
    resources: [
        `arn:aws:secretsmanager:*:${accountId}:secret:talent-management-postgresql-credential-*`,
        `arn:aws:secretsmanager:*:${accountId}:secret:gcp-talent-management-credential-*`,
        `arn:aws:secretsmanager:*:${accountId}:secret:redis-credentials-*`,
        `arn:aws:secretsmanager:*:${accountId}:secret:talent-management-auth0-m2m-credentials-*`,
    ],
    sid: 'SecretManagerPermissions',
});

const stepFunctionBasicPermissions = new PolicyStatement({
    actions: ['states:StartExecution', 'states:StopExecution'],
    effect: Effect.ALLOW,
    resources: [
        `arn:aws:states:*:${accountId}:stateMachine:feedback-recommendation-generator`,
    ],
    sid: 'StateMachinePermissions',
});

const lambdaPermissions = new PolicyStatement({
    actions: ['lambda:InvokeFunction'],
    effect: Effect.ALLOW,
    resources: [
        `arn:aws:lambda:*:${accountId}:function:talent-management-feedback-recommendation-initialize-request-fn:*`,
        `arn:aws:lambda:*:${accountId}:function:talent-management-feedback-recommendation-generation-request-fn:*`,
        `arn:aws:lambda:*:${accountId}:function:talent-management-feedback-recommendation-ended-request-fn:*`,
        `arn:aws:lambda:*:${accountId}:function:talent-management-feedback-recommendation-process-request-fn:*`,
    ],
    sid: 'LambdaPermissions',
});

const logPermissions = new PolicyStatement({
    actions: [
        'logs:CreateLogDelivery',
        'logs:CreateLogStream',
        'logs:PutResourcePolicy',
        'logs:DescribeLogGroups',
        'logs:UpdateLogDelivery',
        'logs:DeleteLogDelivery',
        'logs:DescribeResourcePolicies',
        'logs:GetLogDelivery',
        'logs:PutLogEvents',
        'logs:ListLogDeliveries',
    ],
    effect: Effect.ALLOW,
    resources: ['*'],
    sid: 'LogPermissions',
});

export const talentManagementFeedbackFnPolicy = [
    sqsPermissions,
    snsPermissions,
    secretManagerPermissions,
    parameterStorePermissions,
    stepFunctionBasicPermissions,
    lambdaPermissions,
    logPermissions,
];
