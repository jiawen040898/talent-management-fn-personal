import { logger } from '@pulsifi/fn';

import { eventMiddleware } from '../middleware';
import { EmployeeDailyReminderService } from '../services';

const router = new EmployeeDailyReminderService();

export const handleCronJobEvent = async () => {
    logger.info(`Cron Job Event Triggered`);
    await router.processEmployeeDailyReminder();
};

export const handler = eventMiddleware(handleCronJobEvent);
