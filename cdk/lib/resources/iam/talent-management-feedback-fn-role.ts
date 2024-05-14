import {
    CustomIamPolicyConstruct,
    CustomIamRoleConstruct,
    PulsifiTeam,
} from '@pulsifi/custom-aws-cdk-lib';
import { Tags } from 'aws-cdk-lib';
import {
    CompositePrincipal,
    type IRole,
    ManagedPolicy,
    ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

import { ResourceTag } from '../../constants';
import { accountId, environment } from '../../variables';
import { talentManagementFeedbackFnPolicy } from './policies';

const roleName = 'talent-management-feedback-fn';
const policyName = 'talent-management-feedback-fn';

export class TalentManagementFeedbackFnRoleResource extends Construct {
    public readonly role: IRole;
    constructor(scope: Construct, id: string) {
        super(scope, id);

        /* role */
        const role = new CustomIamRoleConstruct(this, `${roleName}-role`, {
            resourceName: roleName,
            assumedBy: new CompositePrincipal(
                new ServicePrincipal('lambda.amazonaws.com'),
                new ServicePrincipal('states.amazonaws.com'),
            ),
            awsEnvironment: environment,
            resourceOwner: PulsifiTeam.ENGINEERING,
        });

        this.role = role.iamRole;

        Tags.of(role).add('Type', ResourceTag.IAM);

        /* policy */
        const awsLambdaVPCAccessExecutionRole =
            ManagedPolicy.fromManagedPolicyArn(
                this,
                'aws-lambda-vpc-access-execution-role',
                'arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole',
            );

        const awsStepFunctionsReadOnlyAccess =
            ManagedPolicy.fromManagedPolicyArn(
                this,
                'aws-step-functions-read-only-access',
                'arn:aws:iam::aws:policy/AWSStepFunctionsReadOnlyAccess',
            );
        const pulsifiKMSPolicy = ManagedPolicy.fromManagedPolicyArn(
            this,
            'pulsifi-kms-policy',
            `arn:aws:iam::${accountId}:policy/PulsifiKMSPolicy`,
        );
        const awsXrayWriteOnlyAccess = ManagedPolicy.fromManagedPolicyArn(
            this,
            'aws-xray-write-only-access',
            'arn:aws:iam::aws:policy/AWSXrayWriteOnlyAccess',
        );

        new CustomIamPolicyConstruct(this, `${policyName}-policy`, {
            roles: [role.iamRole],
            resourceName: policyName,
            awsEnvironment: environment,
            resourceOwner: PulsifiTeam.ENGINEERING,
            statements: talentManagementFeedbackFnPolicy,
        });

        role.iamRole.addManagedPolicy(awsLambdaVPCAccessExecutionRole);
        role.iamRole.addManagedPolicy(awsStepFunctionsReadOnlyAccess);
        role.iamRole.addManagedPolicy(awsXrayWriteOnlyAccess);
        role.iamRole.addManagedPolicy(pulsifiKMSPolicy);
    }
}
