import { EventModel, logger, sqsRecordUtil } from '@pulsifi/fn';
import { SQSEvent } from 'aws-lambda';

import { EventType } from '../constants';
import { TalentManagementEmployeeAssessmentScoreCalculated } from '../dtos';
import { eventMiddleware } from '../middleware';
import { EmployeeScoreService } from '../services';

export const handleEvent = async (event: SQSEvent) => {
    for (const record of event.Records) {
        const message =
            sqsRecordUtil.parseBodyMessage<
                EventModel<TalentManagementEmployeeAssessmentScoreCalculated>
            >(record);

        const messageEventType = message.event_type.toLowerCase() as EventType;

        logger.info('Process event type.', {
            event: messageEventType,
            message,
        });

        await EmployeeScoreService.processEmployeeFitScore(message.data);
    }
};

export const handler = eventMiddleware(handleEvent);
