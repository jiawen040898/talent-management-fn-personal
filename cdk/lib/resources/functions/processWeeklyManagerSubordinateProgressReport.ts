import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';

import { BaseLambda } from '../../base';
import type { LambdaResourceProps } from '../../interfaces';
import { version } from '../../variables';

const lambdaName = 'talent-management-procWeeklyManagerProgressReport-fn';

export class ProcessWeeklyManagerSubordinateProgressReportResource extends Construct {
    /**
     * ProcessWeeklyManagerSubordinateProgressReportResource
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
            description: `Process Weekly Manager Subordinate Progress Report (v${version})`,
            entry: 'src/functions/process-weekly-manager-subordinate-progress-report.ts',
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
