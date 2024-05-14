import { Construct } from 'constructs';

import { BaseLambda } from '../../base';
import type { LambdaResourceProps } from '../../interfaces';
import { version } from '../../variables';

const lambdaName =
    'talent-management-feedback-recommendation-process-request-fn';

export class ProcessFeedbackRecommendationGenerationProcessRequestResource extends Construct {
    /**
     * ProcessFeedbackRecommendationGenerationProcessRequestResource
     *
     * @param scope {@link Construct}
     * @param id
     * @param props {@link LambdaResourceProps}
     */
    constructor(scope: Construct, id: string, props: LambdaResourceProps) {
        super(scope, id);

        new BaseLambda(this, lambdaName, {
            functionName: lambdaName,
            description: `Listen to step function start execution command, map and process feedback (v${version})`,
            entry: 'src/functions/process-feedback-recommendation-generation-process-request.ts',
            isLogGroupExists: true,
            iamRole: props.iamRole,
            layers: props.layers,
        });
    }
}
