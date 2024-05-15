import {
    CustomIamPolicyConstruct,
    CustomIamRoleConstruct,
    type CustomIamRoleProps,
    PulsifiTeam,
} from '@pulsifi/custom-aws-cdk-lib';
import { Tags } from 'aws-cdk-lib';
import type {
    IManagedPolicy,
    IRole,
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

    /**
     * BaseIAM
     *
     * @public role {@link IRole}
     *
     * @param scope {@link Construct}
     * @param id
     * @param props {@link Base}
     */
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
        if (props.customPolicies) {
            for (const customPolicy of props.customPolicies) {
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
            }
        }

        /* managed policies */
        if (props.managedPolicies) {
            for (const managedPolicy of props.managedPolicies) {
                role.iamRole.addManagedPolicy(managedPolicy);
            }
        }
    }
}
