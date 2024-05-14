import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';

import { BaseLambda } from '../../base';
import type { LambdaResourceProps } from '../../interfaces';
import { version } from '../../variables';

const lambdaName = 'talent-management-process-employee-assessment-score-fn';

export class ProcessEmployeeAssessmentScoreFnResource extends Construct {
    /**
     * ProcessEmployeeAssessmentScoreFnResource
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
            description: `Process SQS messages to calculate assessment score then store into db and send assessment calculated event (v${version})`,
            entry: 'src/functions/process-employee-assessment-score.ts',
            // reservedConcurrentExecutions: 20,
            isLogGroupExists: true,
            iamRole: props.iamRole,
            layers: props.layers,
        });

        lambdaResource.lambda.addEventSource(
            new SqsEventSource(props.sqs, {
                batchSize: 1,
                maxConcurrency: 20,
            }),
        );
    }
}
