import { AwsFunctionHandler } from 'serverless/aws';

import { layers, tags, version } from './variables';

export const processFeedbackRecommendationGenerationEndedRequest: AwsFunctionHandler =
    {
        name: 'talent-management-feedback-recommendation-ended-request-fn',
        description: `Trigger by step function, to update result status in feedback reviewee table (v${version})${version})`,
        handler:
            'src/functions/process-feedback-recommendation-generation-ended-request.handler',
        memorySize: 512,
        timeout: 45,
        layers,
        tags,
    };
