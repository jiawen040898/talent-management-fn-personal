import {
    CustomIamPolicyConstruct,
    CustomIamRoleConstruct,
    CustomIamRoleProps,
    PulsifiTeam,
} from '@pulsifi/custom-aws-cdk-lib';
import { Tags } from 'aws-cdk-lib';
import {
    type IManagedPolicy,
    type IRole,
    PolicyStatement,
} from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

import { ResourceTag } from '../constants';
import { environment } from '../variables';

type BaseProps = {
    customPolicies?: {
        policyName: string;
        statements: PolicyStatement[];
    }[];
    managedPolicies?: IManagedPolicy[];
} & Omit<CustomIamRoleProps, 'awsEnvironment' | 'resourceOwner'>;

export class BaseIAM extends Construct {
    public readonly role: IRole;
    constructor(scope: Construct, id: string, props: BaseProps) {
        super(scope, id);

        /* role */
        const role = new CustomIamRoleConstruct(
            this,
            `${props.resourceName}-role`,
            {
                ...props,
                awsEnvironment: environment,
                resourceOwner: PulsifiTeam.ENGINEERING,
            },
        );

        this.role = role.iamRole;

        Tags.of(role).add('Type', ResourceTag.IAM);

        /* custom policies */
        props.customPolicies?.forEach((customPolicy) => {
            new CustomIamPolicyConstruct(
                this,
                `${customPolicy.policyName}-policy`,
                {
                    roles: [role.iamRole],
                    resourceName: customPolicy.policyName,
                    awsEnvironment: environment,
                    resourceOwner: PulsifiTeam.ENGINEERING,
                    statements: customPolicy.statements,
                },
            );
        });

        /* managed policies */
        props.managedPolicies?.forEach((managedPolicy) => {
            role.iamRole.addManagedPolicy(managedPolicy);
        });
    }
}
