import { AwsFunctionHandler } from 'serverless/aws';

import { layers, tags, version } from './variables';

export const processWeeklyManagerSubordinateProgressReport: AwsFunctionHandler =
    {
        name: 'talent-management-procWeeklyManagerProgressReport-fn',
        description: `Process Weekly Manager Subordinate Progress Report (v${version})`,
        handler:
            'src/functions/process-weekly-manager-subordinate-progress-report.handler',
        events: [
            {
                sqs: {
                    arn: 'arn:aws:sqs:${aws:region}:${aws:accountId}:talent-management-lxp-manager-subordinate-progress-report-queue',
                    batchSize: 1,
                },
            },
        ],
        layers,
        tags,
    };
