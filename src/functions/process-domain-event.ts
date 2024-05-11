import { EventModel, logger, sqsRecordUtil } from '@pulsifi/fn';
import { SQSEvent } from 'aws-lambda';

import { EventType } from '../constants';
import { eventMiddleware } from '../middleware';
import { eventHandlers } from '../services';

export const handleEvent = async (event: SQSEvent) => {
    let message: EventModel<JSON>;
    for (const record of event.Records) {
        message = sqsRecordUtil.parseBodyMessage(record);
        const messageEventType = message.event_type.toLowerCase() as EventType;

        if (!eventHandlers[messageEventType]) {
            logger.info('No matching event type found.', {
                data: messageEventType,
            });
            return;
        }

        logger.info('Process event type.', {
            event: messageEventType,
            message,
        });
        await eventHandlers[messageEventType](message);
    }
};

export const handler = eventMiddleware(handleEvent);
