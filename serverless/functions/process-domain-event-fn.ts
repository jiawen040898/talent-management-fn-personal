import { AwsFunctionHandler } from 'serverless/aws';

import { layers, tags, version } from './variables';

export const handleProcessDomainEvent: AwsFunctionHandler = {
    name: 'talent-management-processDomainEvent-fn',
    description: `Process SQS messages from Talent Management Domain Queue (v${version})`,
    handler: 'src/functions/process-domain-event.handler',
    // reservedConcurrency: 40,
    events: [
        {
            sqs: {
                arn: 'arn:aws:sqs:${aws:region}:${aws:accountId}:talent-management-domain-queue.fifo',
                batchSize: 1,
            },
        },
    ],
    layers,
    tags,
};
