import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Construct } from 'constructs';

import { BaseLambda } from '../../base';
import type { LambdaResourceProps } from '../../interfaces';
import { environment, version } from '../../variables';

const lambdaName = 'talent-management-employeeDailyReminderCronJob-fn';

export class EmployeeDailyReminderCronJobResource extends Construct {
    /**
     * EmployeeDailyReminderCronJobResource
     *
     * @param scope {@link Construct}
     * @param id
     * @param props {@link LambdaResourceProps}
     */
    constructor(scope: Construct, id: string, props: LambdaResourceProps) {
        super(scope, id);

        const lambdaResource = new BaseLambda(this, lambdaName, {
            functionName: lambdaName,
            description: `Employee Daily Reminder Cron Job - Every 1 Hour (v${version})`,
            entry: 'src/functions/process-employee-daily-reminder.ts',
            isLogGroupExists: true,
            iamRole: props.iamRole,
            layers: props.layers,
        });

        const cron =
            environment === 'sandbox'
                ? 'cron(0 0-15 * * ? *)'
                : 'cron(0 * * * ? *)';
        const eventRule = new Rule(this, `${id}-event-rule`, {
            schedule: Schedule.expression(cron),
        });

        eventRule.addTarget(new LambdaFunction(lambdaResource.lambda));
    }
}
