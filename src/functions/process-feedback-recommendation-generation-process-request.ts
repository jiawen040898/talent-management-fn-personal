import { logger } from '@pulsifi/fn';
import { SQSEvent } from 'aws-lambda';

import { eventMiddleware } from '../middleware';
import { feedbackCycleRevieweeRecommendationService } from '../services';

export const handleEvent = async (event: SQSEvent) => {
    try {
        logger.info(
            'Receive feedback cycle recommendation generation process request from initialize lambda',
            {
                event,
            },
        );

        return feedbackCycleRevieweeRecommendationService.handleRecommendationProcessRequest(
            event,
        );
    } catch (error) {
        logger.error(
            'Fail to process feedback cycle recommendation generation process request from initialize lambda',
            {
                data: event,
            },
        );
        throw error;
    }
};

export const handler = eventMiddleware(handleEvent);
