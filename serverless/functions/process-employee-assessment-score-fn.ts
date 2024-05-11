import { AwsFunctionHandler, Sqs } from 'serverless/aws';

import { layers, tags, version } from './variables';

interface CustomSqs extends Sqs {
    maximumConcurrency: number;
}

export const handleProcessEmployeeAssessmentScore: AwsFunctionHandler = {
    name: 'talent-management-process-employee-assessment-score-fn',
    description: `Process SQS messages to calculate assessment score then store into db and send assessment calculated event (v${version})`,
    handler: 'src/functions/process-employee-assessment-score.handler',
    // reservedConcurrency: 20,
    events: [
        {
            sqs: {
                arn: 'arn:aws:sqs:${aws:region}:${aws:accountId}:talent-management-assessment-score-queue.fifo',
                batchSize: 1,
                maximumConcurrency: 20,
            } as CustomSqs,
        },
    ],
    layers,
    tags,
};
