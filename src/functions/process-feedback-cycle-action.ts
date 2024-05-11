import {
    DedicatedUserAccountId,
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
            'Received schedule with companies data for feedback cycle action',
            {
                data: message,
            },
        );

        const validCompanies = companyUtil.filterCompanyWithFeedbackModule(
            message.company,
        );

        const entries = [];
        for (const company of validCompanies) {
            company.localDate = dateUtil.getDate(message.local_timestamp);
            const feedbackReminder: EventModel<CompanyLookupDto> = {
                event_type:
                    EventType.FEEDBACK_NOMINATION_APPROVAL_ACTION_SCHEDULER,
                event_id: generatorUtil.uuid(),
                company_id: company.id,
                user_account_id: DedicatedUserAccountId.SYSTEM,
                data: company,
            };
            entries.push({
                Id: generatorUtil.uuid(),
                MessageGroupId: generatorUtil.uuid(),
                MessageBody: JSON.stringify(feedbackReminder),
            });

            const startCycleWithReadyNomination: EventModel<CompanyLookupDto> =
                {
                    event_type:
                        EventType.FEEDBACK_CYCLE_START_WITH_READY_NOMINATION_ACTION_SCHEDULER,
                    event_id: generatorUtil.uuid(),
                    company_id: company.id,
                    user_account_id: DedicatedUserAccountId.SYSTEM,
                    data: company,
                };
            entries.push({
                Id: generatorUtil.uuid(),
                MessageGroupId: generatorUtil.uuid(),
                MessageBody: JSON.stringify(startCycleWithReadyNomination),
            });

            const startCycleWithReadyFeedback: EventModel<CompanyLookupDto> = {
                event_type:
                    EventType.FEEDBACK_CYCLE_START_WITH_READY_FEEDBACK_ACTION_SCHEDULER,
                event_id: generatorUtil.uuid(),
                company_id: company.id,
                user_account_id: DedicatedUserAccountId.SYSTEM,
                data: company,
            };
            entries.push({
                Id: generatorUtil.uuid(),
                MessageGroupId: generatorUtil.uuid(),
                MessageBody: JSON.stringify(startCycleWithReadyFeedback),
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
