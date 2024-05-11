import {
    EventModel,
    generatorUtil,
    logger,
    sqsRecordUtil,
    sqsService,
} from '@pulsifi/fn';
import { SQSEvent } from 'aws-lambda';
import { chunk } from 'lodash';

import * as AWSConfig from '../configs';
import { EventType } from '../constants';
import { CompanyLookupDto, CronScheduleMessage } from '../dtos';
import { eventMiddleware } from '../middleware';
import { companyUtil, dateUtil } from '../utils';

export const handleEvent = async (event: SQSEvent) => {
    let message: CronScheduleMessage;
    for (const record of event.Records) {
        message = sqsRecordUtil.parseBody(record);
        logger.info(
            'Received schedule with companies data for feedback cycle reminder',
            {
                data: message,
            },
        );

        const validCompanies = companyUtil.filterCompanyWithFeedbackModule(
            message.company,
        );
        const entries = [];
        const nominationReminderGroupId = generatorUtil.uuid();
        const nominationApprovalGroupId = generatorUtil.uuid();
        const feedbackReminderGroupId = generatorUtil.uuid();
        for (const company of validCompanies) {
            company.localDate = dateUtil.getDate(message.local_timestamp);
            const nominationReminder: EventModel<CompanyLookupDto> = {
                event_type:
                    EventType.FEEDBACK_NOMINATION_SUBMISSION_REMINDER_SCHEDULER,
                event_id: generatorUtil.uuid(),
                company_id: company.id,
                user_account_id: 1,
                data: company,
            };
            entries.push({
                Id: generatorUtil.uuid(),
                MessageGroupId: nominationReminderGroupId,
                MessageBody: JSON.stringify(nominationReminder),
            });
            const nominationApprovalReminder: EventModel<CompanyLookupDto> = {
                event_type:
                    EventType.FEEDBACK_NOMINATION_APPROVAL_REMINDER_SCHEDULER,
                event_id: generatorUtil.uuid(),
                company_id: company.id,
                user_account_id: 1,
                data: company,
            };
            entries.push({
                Id: generatorUtil.uuid(),
                MessageGroupId: nominationApprovalGroupId,
                MessageBody: JSON.stringify(nominationApprovalReminder),
            });

            const feedbackReminder: EventModel<CompanyLookupDto> = {
                event_type: EventType.FEEDBACK_SUBMISSION_REMINDER_SCHEDULER,
                event_id: generatorUtil.uuid(),
                company_id: company.id,
                user_account_id: 1,
                data: company,
            };
            entries.push({
                Id: generatorUtil.uuid(),
                MessageGroupId: feedbackReminderGroupId,
                MessageBody: JSON.stringify(feedbackReminder),
            });
        }

        if (entries.length > 0) {
            const entriesByChunk = chunk(entries, 10);
            for (const chunkItem of entriesByChunk) {
                await sqsService.sendBatch(chunkItem, AWSConfig.sqs());
            }
        }
    }
};

export const handler = eventMiddleware(handleEvent);
