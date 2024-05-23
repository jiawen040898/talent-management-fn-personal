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
        'sqs:GetQueueAttributes',
        'sqs:GetQueueUrl',
        'sqs:ReceiveMessage',
        'sqs:SendMessage',
    ],
    effect: Effect.ALLOW,
    resources: [
        `arn:aws:sqs:*:${accountId}:talent-management-domain-queue.fifo`,
        `arn:aws:sqs:*:${accountId}:talent-management-lxp-manager-subordinate-progress-report-queue`,
        `arn:aws:sqs:*:${accountId}:talent-management-feedback-cycle-reminder-queue`,
        `arn:aws:sqs:*:${accountId}:talent-management-feedback-cycle-action-queue`,
        `arn:aws:sqs:*:${accountId}:talent-management-feedback-dashboard-provision-queue`,
        `arn:aws:sqs:*:${accountId}:talent-management-feedback-recommendation-generation-initialize-queue.fifo`,
        `arn:aws:sqs:*:${accountId}:talent-management-ppt-report-queue`,
        `arn:aws:sqs:*:${accountId}:talent-management-assessment-score-queue.fifo`,
        `arn:aws:sqs:*:${accountId}:talent-management-fit-score-queue.fifo`,
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
        `arn:aws:secretsmanager:*:${accountId}:secret:pusher-credentials*`,
    ],
    sid: 'SecretManagerPermissions',
});

const stepFunctionBasicPermissions = new PolicyStatement({
    actions: [
        'states:StartExecution',
        'states:StopExecution',
        'states:DescribeExecution',
    ],
    effect: Effect.ALLOW,
    resources: [
        `arn:aws:states:*:${accountId}:stateMachine:feedbackRecommendationGenerator`,
    ],
    sid: 'StartExecutionPermissions',
});

export const talentManagementLambdaPolicy = [
    sqsPermissions,
    snsPermissions,
    secretManagerPermissions,
    parameterStorePermissions,
    stepFunctionBasicPermissions,
];
