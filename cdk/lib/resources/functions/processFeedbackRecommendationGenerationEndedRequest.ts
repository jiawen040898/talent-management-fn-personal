import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { BaseLambda } from '../../base';
import type { LambdaResourceProps } from '../../interfaces';
import { version } from '../../variables';

const lambdaName = 'talent-management-feedback-recommendation-ended-request-fn';

export class ProcessFeedbackRecommendationGenerationEndedRequestResource extends Construct {
    /**
     * ProcessFeedbackRecommendationGenerationEndedRequestResource
     *
     * @param scope {@link Construct}
     * @param id
     * @param props {@link LambdaResourceProps}
     */
    constructor(scope: Construct, id: string, props: LambdaResourceProps) {
        super(scope, id);

        new BaseLambda(this, lambdaName, {
            functionName: lambdaName,
            description: `Trigger by step function, to update result status in feedback reviewee table (v${version})${version})`,
            entry: 'src/functions/process-feedback-recommendation-generation-ended-request.ts',
            isLogGroupExists: true,
            memorySize: 512,
            timeout: Duration.seconds(45),
            iamRole: props.iamRole,
            layers: props.layers,
        });
    }
}
