import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';

import { BaseLambda } from '../../base';
import type { LambdaResourceProps } from '../../interfaces';
import { version } from '../../variables';

const lambdaName = 'talent-management-processFeedbackCycleAction-fn';

export class ProcessFeedbackCycleActionResource extends Construct {
    /**
     * ProcessFeedbackCycleActionResource
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
            description: `Process Daily Feedback Cycle Automated Action (v${version})`,
            entry: 'src/functions/process-feedback-cycle-action.ts',
            isLogGroupExists: true,
            iamRole: props.iamRole,
            layers: props.layers,
        });

        // TalentManagementFeedbackCycleActionQueueResource
        lambdaResource.lambda.addEventSource(
            new SqsEventSource(props.sqs, {
                batchSize: 1,
            }),
        );
    }
}
