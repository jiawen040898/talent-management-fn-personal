import { Construct } from 'constructs';

import type { IAMRoleGroupResources } from '../iam';
import { FeedbackRecommendationGeneratorResource } from './feedback-recommendation-generator';

/**
 * StepFunctionGroupResourcesProps
 *
 * @param iamRoleGroupResources {@link IAMRoleGroupResources}
 */
type StepFunctionGroupResourcesProps = {
    iamRoleGroupResources: IAMRoleGroupResources;
};

export class StepFunctionGroupResources extends Construct {
    /**
     * StepFunctionGroupResources
     *
     * @param scope {@link Construct}
     * @param id
     * @param props {@link StepFunctionGroupResourcesProps}
     */
    constructor(
        scope: Construct,
        id: string,
        props: StepFunctionGroupResourcesProps,
    ) {
        super(scope, id);

        new FeedbackRecommendationGeneratorResource(
            this,
            'feedback-recommendation-generator-resource',
            {
                iamRole:
                    props.iamRoleGroupResources.talentManagementFeedbackFnRole,
            },
        );
    }
}
