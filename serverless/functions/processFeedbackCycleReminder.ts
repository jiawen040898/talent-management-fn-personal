import { AwsFunctionHandler } from 'serverless/aws';

import { layers, tags, version } from './variables';

export const processFeedbackCycleReminder: AwsFunctionHandler = {
    name: 'talent-management-processFeedbackCycleReminder-fn',
    description: `Process Daily Feedback Cycle Reminder (v${version})`,
    handler: 'src/functions/process-feedback-cycle-reminder.handler',
    events: [
        {
            sqs: {
                arn: 'arn:aws:sqs:${aws:region}:${aws:accountId}:talent-management-feedback-cycle-reminder-queue',
                batchSize: 1,
            },
        },
    ],
    layers,
    tags,
};
