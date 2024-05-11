import { CustomAwsFunctionHandler } from '../interfaces/aws-function-handler.interface';
import { layers, tags, version } from './variables';

export const processFeedbackRecommendationGenerationInitializeRequest: CustomAwsFunctionHandler =
    {
        name: 'talent-management-feedback-recommendation-initialize-request-fn',
        description: `Listen to SQS event, invoke step function to generate feedback cycle reviewee recommendation (v${version})`,
        handler:
            'src/functions/process-feedback-recommendation-generation-initialize-request.handler',
        events: [
            {
                sqs: {
                    arn: 'arn:aws:sqs:${aws:region}:${aws:accountId}:talent-management-feedback-recommendation-generation-initialize-queue.fifo',
                    batchSize: 1,
                    maximumConcurrency: 2,
                },
            },
        ],
        layers,
        tags,
    };
