import { EventModel, logger, sqsRecordUtil } from '@pulsifi/fn';
import { SQSEvent } from 'aws-lambda';

import { FeedbackCycleClosed } from '../interface';
import { eventMiddleware } from '../middleware';
import { FeedbackCycleDashboardProvisionService } from '../services';

export const handleEvent = async (event: SQSEvent) => {
    for (const record of event.Records) {
        const payload: EventModel<FeedbackCycleClosed> =
            sqsRecordUtil.parseBodyMessage(record);

        logger.info(
            'Received feedback cycle close event to generate feedback dashboard',
            {
                data: payload,
            },
        );

        await FeedbackCycleDashboardProvisionService.provisionFeedbackCycleDashboard(
            payload.data.feedback_cycle_id,
            payload.data.company_id,
            payload.user_account_id,
        );

        logger.info('Provision feedback cycle dashboard tables completed', {
            feedback_cycle_id: payload.data.feedback_cycle_id,
        });
    }
};

export const handler = eventMiddleware(handleEvent);
