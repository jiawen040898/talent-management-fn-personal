import { AwsFunctionHandler } from 'serverless/aws';

import { layers, tags, version } from './variables';

export const processFeedbackCycleAction: AwsFunctionHandler = {
    name: 'talent-management-processFeedbackCycleAction-fn',
    description: `Process Daily Feedback Cycle Automated Action (v${version})`,
    handler: 'src/functions/process-feedback-cycle-action.handler',
    events: [
        {
            sqs: {
                arn: 'arn:aws:sqs:${aws:region}:${aws:accountId}:talent-management-feedback-cycle-action-queue',
                batchSize: 1,
            },
        },
    ],
    layers,
    tags,
};
