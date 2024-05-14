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
import { talentManagementLambdaPolicy } from './policies';

const roleName = 'talent-management-lambda';
const policyName = 'talent-management-lambda';

export class TalentManagementLambdaRoleResource extends Construct {
    public readonly role: IRole;
    constructor(scope: Construct, id: string) {
        super(scope, id);

        /* role */
        const role = new CustomIamRoleConstruct(this, `${roleName}-role`, {
            resourceName: roleName,
            assumedBy: new CompositePrincipal(
                new ServicePrincipal('lambda.amazonaws.com'),
            ),
            awsEnvironment: environment,
            resourceOwner: PulsifiTeam.ENGINEERING,
        });

        this.role = role.iamRole;

        Tags.of(role).add('Type', ResourceTag.IAM);

        /* policy */
        const awsLambdaBasicExecutionRole = ManagedPolicy.fromManagedPolicyArn(
            this,
            'aws-lambda-basic-execution-role',
            'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole',
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
        const awsLambdaVPCAccessExecutionRole =
            ManagedPolicy.fromManagedPolicyArn(
                this,
                'aws-lambda-vpc-access-execution-role',
                'arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole',
            );

        new CustomIamPolicyConstruct(this, `${policyName}-policy`, {
            roles: [role.iamRole],
            resourceName: policyName,
            awsEnvironment: environment,
            resourceOwner: PulsifiTeam.ENGINEERING,
            statements: talentManagementLambdaPolicy,
        });

        role.iamRole.addManagedPolicy(awsLambdaBasicExecutionRole);
        role.iamRole.addManagedPolicy(awsLambdaVPCAccessExecutionRole);
        role.iamRole.addManagedPolicy(awsXrayWriteOnlyAccess);
        role.iamRole.addManagedPolicy(pulsifiKMSPolicy);
    }
}
