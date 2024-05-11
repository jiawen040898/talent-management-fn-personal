import { logger } from '@pulsifi/fn';

import { FeedbackRecommendationsRequestEvent } from '../interface';
import { eventMiddleware } from '../middleware';
import { feedbackCycleRevieweeRecommendationService } from '../services';

export const handleEvent = async (
    event: FeedbackRecommendationsRequestEvent,
) => {
    try {
        logger.info(
            'Receive feedback cycle recommendation generation request',
            {
                event,
            },
        );

        const data = event.Item;

        return await feedbackCycleRevieweeRecommendationService.handleRecommendationGenerationRequest(
            data,
        );
    } catch (error) {
        logger.error(
            'Fail to process feedback cycle recommendation generation request',
            {
                event,
            },
        );
        throw error;
    }
};

export const handler = eventMiddleware(handleEvent);
