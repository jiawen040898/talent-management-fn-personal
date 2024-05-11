import { AwsFunctionHandler, Sqs } from 'serverless/aws';

import { layers, tags, version } from './variables';

interface CustomSqs extends Sqs {
    maximumConcurrency: number;
}

export const handleProcessEmployeeFitScore: AwsFunctionHandler = {
    name: 'talent-management-process-employee-fit-score-fn',
    description: `Process SQS messages to calculate fit score then store into db (v${version})`,
    handler: 'src/functions/process-employee-fit-score.handler',
    // reservedConcurrency: 20,
    events: [
        {
            sqs: {
                arn: 'arn:aws:sqs:${aws:region}:${aws:accountId}:talent-management-fit-score-queue.fifo',
                batchSize: 1,
                maximumConcurrency: 20,
            } as CustomSqs,
        },
    ],
    layers,
    tags,
};
