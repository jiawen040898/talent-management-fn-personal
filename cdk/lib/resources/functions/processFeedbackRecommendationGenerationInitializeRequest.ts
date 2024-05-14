import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';

import { BaseLambda } from '../../base';
import type { LambdaResourceProps } from '../../interfaces';
import { version } from '../../variables';

const lambdaName =
    'talent-management-feedback-recommendation-initialize-request-fn';

export class ProcessFeedbackRecommendationGenerationInitializeRequestResource extends Construct {
    /**
     * ProcessFeedbackRecommendationGenerationInitializeRequestResource
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
            description: `Listen to SQS event, invoke step function to generate feedback cycle reviewee recommendation (v${version})`,
            entry: 'src/functions/process-feedback-recommendation-generation-ended-request.ts',
            isLogGroupExists: true,
            iamRole: props.iamRole,
            layers: props.layers,
        });

        // TalentManagementFeedbackRecommendationGenerationInitializeQueueResource
        lambdaResource.lambda.addEventSource(
            new SqsEventSource(props.sqs, {
                batchSize: 1,
                maxConcurrency: 2,
            }),
        );
    }
}
