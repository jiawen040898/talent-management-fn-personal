import { AwsFunctionHandler } from 'serverless/aws';

import { layers, tags, version } from './variables';

export const processFeedbackRecommendationGenerationRequest: AwsFunctionHandler =
    {
        name: 'talent-management-feedback-recommendation-generation-request-fn',
        description: `Trigger by step function, generate feedback recommendation per competency (v${version})${version})`,
        handler:
            'src/functions/process-feedback-recommendation-generation-request.handler',
        timeout: 90,
        layers,
        tags,
    };
