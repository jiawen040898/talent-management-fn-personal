import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';

import { BaseLambda } from '../../base';
import type { LambdaResourceProps } from '../../interfaces';
import { version } from '../../variables';

const lambdaName = 'talent-management-processFeedbackCycleReminder-fn';

export class ProcessFeedbackCycleReminderResource extends Construct {
    /**
     * ProcessFeedbackCycleReminderResource
     *
     * @param scope {@link Construct}
     * @param id
     * @param props {@link LambdaResourceProps}
     */
    constructor(
        scope: Construct,
        id: string,
        props: Required<LambdaResourceProps>,
    ) {
        super(scope, id);

        const lambdaResource = new BaseLambda(this, lambdaName, {
            functionName: lambdaName,
            description: `Process Daily Feedback Cycle Reminder (v${version})`,
            entry: 'src/functions/process-feedback-cycle-reminder.ts',
            isLogGroupExists: true,
            iamRole: props.iamRole,
            layers: props.layers,
        });

        lambdaResource.lambda.addEventSource(
            new SqsEventSource(props.sqs, {
                batchSize: 1,
            }),
        );
    }
}
