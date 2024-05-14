import { Duration } from 'aws-cdk-lib';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';

import { BaseLambda } from '../../base';
import type { LambdaResourceProps } from '../../interfaces';
import { version } from '../../variables';

const lambdaName = 'talent-management-feedback-dashboard-provision-fn';

export class ProcessFeedbackDashboardProvisionResource extends Construct {
    /**
     * ProcessFeedbackDashboardProvisionResource
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
            description: `Listen to SQS event, run bq query to provision fbc_result table on bq, which will be used in feedback dashboard (v${version})`,
            entry: 'src/functions/process-feedback-dashboard-provision.ts',
            isLogGroupExists: true,
            iamRole: props.iamRole,
            layers: props.layers,
            timeout: Duration.seconds(300),
        });

        lambdaResource.lambda.addEventSource(new SqsEventSource(props.sqs));
    }
}
