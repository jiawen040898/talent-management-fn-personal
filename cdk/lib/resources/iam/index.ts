import type { IRole } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

import { TalentManagementFeedbackFnRoleResource } from './talent-management-feedback-fn-role';
import { TalentManagementLambdaRoleResource } from './talent-management-lambda-role';

export class IAMRoleGroupResources extends Construct {
    public readonly talentManagementLambdaRole: IRole;
    public readonly talentManagementFeedbackFnRole: IRole;

    /**
     * IAMRoleGroupResources
     *
     * @public talentManagementLambdaRole {@link IRole}
     * @public talentManagementFeedbackFnRole {@link IRole}
     *
     * @param scope {@link Construct}
     * @param id
     */
    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.talentManagementLambdaRole =
            new TalentManagementLambdaRoleResource(
                this,
                'talent-management-lambda-role-resource',
            ).role;
        this.talentManagementFeedbackFnRole =
            new TalentManagementFeedbackFnRoleResource(
                this,
                'talent-management-feedback-fn-role-resource',
            ).role;
    }
}
