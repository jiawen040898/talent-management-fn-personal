import { Duration } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { BaseLambda } from '../../base';
import type { LambdaResourceProps } from '../../interfaces';
import { version } from '../../variables';

const lambdaName =
    'talent-management-feedback-recommendation-generation-request-fn';

export class ProcessFeedbackRecommendationGenerationRequestResource extends Construct {
    /**
     * ProcessFeedbackRecommendationGenerationRequestResource
     *
     * @param scope {@link Construct}
     * @param id
     * @param props {@link LambdaResourceProps}
     */
    constructor(scope: Construct, id: string, props: LambdaResourceProps) {
        super(scope, id);

        new BaseLambda(this, lambdaName, {
            functionName: lambdaName,
            description: `Trigger by step function, generate feedback recommendation per competency (v${version})${version})`,
            entry: 'src/functions/process-feedback-recommendation-generation-request.ts',
            isLogGroupExists: true,
            timeout: Duration.seconds(90),
            iamRole: props.iamRole,
            layers: props.layers,
        });
    }
}
