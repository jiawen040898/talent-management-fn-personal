import { AwsFunctionHandler } from 'serverless/aws';

import { layers, tags, version } from './variables';

export const processFeedbackRecommendationGenerationProcessRequest: AwsFunctionHandler =
    {
        name: 'talent-management-feedback-recommendation-process-request-fn',
        description: `Listen to step function start execution command, map and process feedback (v${version})`,
        handler:
            'src/functions/process-feedback-recommendation-generation-process-request.handler',
        layers,
        tags,
    };
