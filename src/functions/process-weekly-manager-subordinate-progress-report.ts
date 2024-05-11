import { logger } from '@pulsifi/fn';
import { SQSEvent } from 'aws-lambda';

import { CronScheduleMessage } from '../dtos';
import { eventMiddleware } from '../middleware';
import { EmployeeProgressReportService } from '../services';

const employeeProgressReportService = new EmployeeProgressReportService();
export const handleEvent = async (event: SQSEvent) => {
    let message: CronScheduleMessage;
    logger.info(
        'Received companies from identity cron for manager subordinate progress report',
    );
    for (const record of event.Records) {
        try {
            const recordBody: SafeAny = JSON.parse(record.body);
            message = recordBody?.UnsubscribeURL
                ? JSON.parse(recordBody.Message)
                : recordBody;
        } catch (error) {
            logger.error('Fail to parse message', { data: record });
            throw error;
        }

        try {
            const companies = message.company;
            await employeeProgressReportService.handleEmployeeProgressReportFromCronJob(
                companies,
            );
        } catch (error) {
            logger.error(
                'Fail to handle manager subordinate progress report from cron job',
                { data: record },
            );
            throw error;
        }

        logger.info(
            'Handling manager subordinate progress report from cron job completed',
        );
    }
};

export const handler = eventMiddleware(handleEvent);
