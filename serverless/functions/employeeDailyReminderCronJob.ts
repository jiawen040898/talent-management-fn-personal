import { AwsFunctionHandler } from 'serverless/aws';

import { layers, tags, version } from './variables';

export const employeeDailyReminderCronJob: AwsFunctionHandler = {
    name: 'talent-management-employeeDailyReminderCronJob-fn',
    description: `Employee Daily Reminder Cron Job - Every 1 Hour (v${version})`,
    handler: 'src/functions/process-employee-daily-reminder.handler',
    events: [
        {
            schedule: {
                rate: 'cron(0 * * * ? *)',
            },
        },
    ],
    layers,
    tags,
};
