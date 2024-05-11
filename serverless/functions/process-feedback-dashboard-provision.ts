import { CustomAwsFunctionHandler } from '../interfaces/aws-function-handler.interface';
import { layers, tags, version } from './variables';

export const processFeedbackDashboardProvision: CustomAwsFunctionHandler = {
    name: 'talent-management-feedback-dashboard-provision-fn',
    description: `Listen to SQS event, run bq query to provision fbc_result table on bq, which will be used in feedback dashboard (v${version})`,
    timeout: 300,
    handler: 'src/functions/process-feedback-dashboard-provision.handler',
    events: [
        {
            sqs: {
                arn: 'arn:aws:sqs:${aws:region}:${aws:accountId}:talent-management-feedback-dashboard-provision-queue',
            },
        },
    ],
    layers,
    tags,
};
