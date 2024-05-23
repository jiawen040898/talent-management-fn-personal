import {
    CustomSecurityGroupConstruct,
    PulsifiTeam,
} from '@pulsifi/custom-aws-cdk-lib';
import { Port, SecurityGroup } from 'aws-cdk-lib/aws-ec2';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

import { name } from '../../../package.json';
import { environment } from '../variables';

export class SecurityGroupResources extends Construct {
    public readonly securityGroup: CustomSecurityGroupConstruct;
    /**
     * SecurityGroupsResources
     *
     * @public securityGroupResource {@link CustomSecurityGroupConstruct}
     *
     * @param scope {@link Construct}
     * @param id
     */
    constructor(scope: Construct, id: string) {
        super(scope, id);

        /* lambda security group */
        this.securityGroup = new CustomSecurityGroupConstruct(
            this,
            `${id}-security-group`,
            {
                resourceName: name,
                awsEnvironment: environment,
                resourceOwner: PulsifiTeam.ENGINEERING,
            },
        );

        /* postgresql */
        const dbSecurityGroupName = StringParameter.valueFromLookup(
            this,
            '/configs/RDS/DB_SECURITY_GROUP_NAME',
        );

        const targetSecurityGroup = SecurityGroup.fromLookupByName(
            this,
            'db-target-security-group',
            dbSecurityGroupName,
            this.securityGroup.vpc,
        );

        /**
         * add ingress rule to postgres ID for lambda ID
         */
        targetSecurityGroup.addIngressRule(
            this.securityGroup.securityGroup,
            Port.tcp(5432),
            this.securityGroup.securityGroupName,
        );

        /* redis */
        const redisGroupName = StringParameter.valueFromLookup(
            this,
            '/configs/REDIS/SECURITY_GROUP_NAME',
        );

        const redisTargetSecurityGroup = SecurityGroup.fromLookupByName(
            this,
            'redis-target-security-group',
            redisGroupName,
            this.securityGroup.vpc,
        );

        /**
         * add ingress rule to redis ID for lambda ID
         */
        redisTargetSecurityGroup.addIngressRule(
            this.securityGroup.securityGroup,
            Port.tcp(6379),
            this.securityGroup.securityGroupName,
        );
    }
}
