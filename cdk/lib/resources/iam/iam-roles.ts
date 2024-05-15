import {
    CompositePrincipal,
    type IRole,
    ManagedPolicy,
    ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

import { BaseIAM } from '../../base';
import { accountId } from '../../variables';
import { talentManagementFeedbackFnPolicy } from './talent-management-feedback-fn-policy';
import { talentManagementLambdaPolicy } from './talent-management-lambda-policy';

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

        const commonManagedPolicies = [
            ManagedPolicy.fromManagedPolicyArn(
                this,
                'aws-xray-write-only-access',
                'arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess',
            ),
            ManagedPolicy.fromManagedPolicyArn(
                this,
                'pulsifi-kms-policy',
                `arn:aws:iam::${accountId}:policy/PulsifiKMSPolicy`,
            ),
            ManagedPolicy.fromManagedPolicyArn(
                this,
                'aws-lambda-vpc-access-execution-role',
                'arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole',
            ),
        ];

        this.talentManagementLambdaRole = new BaseIAM(
            this,
            'talent-management-lambda-role',
            {
                resourceName: 'talent-management-lambda',
                assumedBy: new CompositePrincipal(
                    new ServicePrincipal('lambda.amazonaws.com'),
                ),
                customPolicies: [
                    {
                        policyName: 'talent-management-lambda',
                        statements: talentManagementLambdaPolicy,
                    },
                ],
                managedPolicies: [
                    ManagedPolicy.fromManagedPolicyArn(
                        this,
                        'aws-lambda-basic-execution-role',
                        'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
                    ),
                    ...commonManagedPolicies,
                ],
            },
        ).role;

        this.talentManagementFeedbackFnRole = new BaseIAM(
            this,
            'talent-management-feedback-fn-role',
            {
                resourceName: 'talent-management-feedback-fn',
                assumedBy: new CompositePrincipal(
                    new ServicePrincipal('lambda.amazonaws.com'),
                    new ServicePrincipal('states.amazonaws.com'),
                ),
                customPolicies: [
                    {
                        policyName: 'talent-management-feedback-fn',
                        statements: talentManagementFeedbackFnPolicy,
                    },
                ],
                managedPolicies: [
                    ManagedPolicy.fromManagedPolicyArn(
                        this,
                        'aws-step-functions-read-only-access',
                        'arn:aws:iam::aws:policy/AWSStepFunctionsReadOnlyAccess',
                    ),
                    ...commonManagedPolicies,
                ],
            },
        ).role;
    }
}
