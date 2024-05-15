import { DefinitionBody } from 'aws-cdk-lib/aws-stepfunctions';
import { Construct } from 'constructs';

import { BaseStepFunction } from '../../base';
import { FunctionGroupResources } from '../functions';
import type { IAMRoleGroupResources } from '../iam/iam-roles';
import { feedbackRecommendationDefinitionBody } from './feedback-recommendation-generator';

/**
 * StepFunctionGroupResourcesProps
 *
 * @param iamRoleGroupResources {@link IAMRoleGroupResources}
 */
type StepFunctionGroupResourcesProps = {
    iamRoleGroupResources: IAMRoleGroupResources;
    functionGroupResources: FunctionGroupResources;
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

        new BaseStepFunction(this, 'feedback-recommendation-generator', {
            stateMachineName: 'feedback-recommendation-generator',
            definitionBody: DefinitionBody.fromChainable(
                feedbackRecommendationDefinitionBody(
                    this,
                    props.functionGroupResources,
                ),
            ),
            role: props.iamRoleGroupResources.talentManagementFeedbackFnRole,
        });
    }
}
