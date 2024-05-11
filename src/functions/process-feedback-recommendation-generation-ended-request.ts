import { logger } from '@pulsifi/fn';

import { FeedbackRecommendationsGenerationEndedRequestEvent } from '../interface';
import { eventMiddleware } from '../middleware';
import { feedbackCycleRevieweeRecommendationService } from '../services';

export const handleEvent = async (
    event: FeedbackRecommendationsGenerationEndedRequestEvent,
) => {
    logger.info(
        'Receive feedback cycle recommendation generation end request',
        {
            event,
        },
    );
    try {
        await feedbackCycleRevieweeRecommendationService.handleRecommendationEndedRequest(
            event,
        );
    } catch (error) {
        logger.error(
            'Fail to process feedback cycle recommendation generation end request',
            {
                event,
            },
        );
        throw error;
    }
};

export const handler = eventMiddleware(handleEvent);
