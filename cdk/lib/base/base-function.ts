import { TypeScriptCode } from '@mrgrain/cdk-esbuild';
import {
    CustomLambdaErrorAlarmConstruct,
    CustomLambdaLogGroupConstruct,
    CustomResourceTagConstruct,
    CustomSecurityGroupConstruct,
    PulsifiTeam,
} from '@pulsifi/custom-aws-cdk-lib';
import {
    type Code,
    Duration,
    RemovalPolicy,
    type Size,
    Tags,
} from 'aws-cdk-lib';
import { SecurityGroup, Subnet, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Rule, RuleProps } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import type { IRole } from 'aws-cdk-lib/aws-iam';
import {
    Function as AwsFunctionLambda,
    type FunctionProps,
    type LayerVersion,
    ParamsAndSecretsLayerVersion,
    ParamsAndSecretsVersions,
    Runtime,
    type Version,
} from 'aws-cdk-lib/aws-lambda';
import {
    SqsEventSource,
    SqsEventSourceProps,
} from 'aws-cdk-lib/aws-lambda-event-sources';
import { type ILogGroup, LogGroup } from 'aws-cdk-lib/aws-logs';
import { IQueue } from 'aws-cdk-lib/aws-sqs';
import { StringListParameter, StringParameter } from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

import { ResourceTag } from '../constants';
import { BuildScriptProvider, configUtil } from '../utils';
import { environment, version } from '../variables';

/**
 * BundlingAssets
 *
 * @param from
 * @param to
 */
type BundlingAssets = {
    from: string[];
    to: string[];
};

/**
 * CustomFunctionProps
 *
 * @param functionName
 * @param description
 * @param entry
 * @param iamRole
 * @param layers
 * @optional isLogGroupExists
 * @optional handler
 * @optional runtime
 * @optional code
 * @optional bundlingAssets {@link BundlingAssets}
 * @optional timeout
 * @optional ephemeralStorageSize
 * @optional memorySize
 */
type CustomFunctionProps = {
    functionName: string;
    description: string;
    entry: string;
    iamRole: IRole;
    layers: LayerVersion[];
    isLogGroupExists?: boolean;
    handler?: string;
    runtime?: Runtime;
    code?: Code;
    bundlingAssets?: BundlingAssets[];
    timeout?: Duration;
    ephemeralStorageSize?: Size;
    memorySize?: number;
    reservedConcurrentExecutions?: number;
    sqsEventSources?: {
        queue: IQueue;
        sqsEventSourceProps?: SqsEventSourceProps;
    }[];
    eventRules?: RuleProps[];
};

export class BaseFunction extends Construct {
    public readonly lambda: AwsFunctionLambda;
    public readonly lambdaVersion: Version;
    private eventRuleCount = 1;

    /**
     * BaseFunction
     *
     * @public lambda
     * @public lambdaVersion
     *
     * @param scope {@link Construct}
     * @param id
     * @param props {@link CustomFunctionProps}
     */
    constructor(scope: Construct, id: string, props: CustomFunctionProps) {
        super(scope, id);

        const { iamRole, sqsEventSources, eventRules, ...lambdaProps } = props;

        /* log group */
        let logGroup: ILogGroup;
        if (props.isLogGroupExists) {
            logGroup = LogGroup.fromLogGroupName(
                scope,
                `${id}-log-group`,
                `/aws/lambda/${props.functionName}`,
            );
        } else {
            const logGroupConstruct = new CustomLambdaLogGroupConstruct(
                scope,
                `${id}-log-group`,
                {
                    awsEnvironment: environment,
                    resourceOwner: PulsifiTeam.ENGINEERING,
                    lambdaName: `${props.functionName}`,
                },
            );

            logGroup = logGroupConstruct.logGroup;
        }

        /* default lambda configuration */
        const defaultLambdaConfiguration: FunctionProps = {
            handler: 'index.handler',
            runtime: Runtime.NODEJS_20_X,
            memorySize: 256,
            timeout: Duration.seconds(30),
            environment: configUtil.getEnvironmentVariables(scope, environment),
            role: iamRole,
            paramsAndSecrets: ParamsAndSecretsLayerVersion.fromVersion(
                ParamsAndSecretsVersions.V1_0_103,
            ),
            currentVersionOptions: {
                removalPolicy: RemovalPolicy.RETAIN,
            },
            vpc: Vpc.fromLookup(scope, `${id}-vpc`, {
                vpcId: StringParameter.valueFromLookup(scope, '/configs/VPCID'),
            }),
            vpcSubnets: {
                subnets: StringListParameter.valueForTypedListParameter(
                    scope,
                    '/configs/VPC_PRIVATE_SUBNET_IDS',
                ).map((subnetId, index) =>
                    Subnet.fromSubnetId(
                        scope,
                        `${id}-subnet-id-${index}`,
                        subnetId,
                    ),
                ),
            },
            securityGroups: [
                SecurityGroup.fromSecurityGroupId(
                    scope,
                    `${id}-security-group`,
                    StringParameter.valueFromLookup(
                        scope,
                        '/talent-management-fn/VPC_SECURITY_GROUP_IDS',
                    ),
                ),
            ],
            ...lambdaProps,
            code: new TypeScriptCode(props.entry, {
                buildProvider: new BuildScriptProvider(
                    'cdk/lib/utils/esbuild/build.mjs',
                    {
                        /* specifies additional external modules to exclude from bundling */
                        externalModules: ['layer/nodejs/package.json'],
                    },
                ),
                buildOptions: {
                    outfile: 'index.js',
                },
            }),
            logGroup: logGroup,
        };

        /* lambda version */
        this.lambda = new AwsFunctionLambda(
            this,
            'Lambda',
            defaultLambdaConfiguration,
        );

        this.lambdaVersion = this.lambda.currentVersion;

        /* tags */
        new CustomResourceTagConstruct(this, `${id}-tagging`, {
            construct: this,
            awsEnvironment: environment,
            resourceOwner: PulsifiTeam.ENGINEERING,
            resourceName: props.functionName,
        });

        Tags.of(scope).add('Type', ResourceTag.LAMBDA);
        Tags.of(scope).add('Version', version);

        /* lambda error alarm */
        new CustomLambdaErrorAlarmConstruct(this, `${id}-error-alarm`, {
            awsEnvironment: environment,
            resourceOwner: PulsifiTeam.ENGINEERING,
            lambda: this.lambda,
        });

        /* lambda security group */
        new CustomSecurityGroupConstruct(this, `${id}-security-group`, {
            resourceName: props.functionName,
            awsEnvironment: environment,
            resourceOwner: PulsifiTeam.ENGINEERING,
        });

        /* lambda triggers */
        sqsEventSources?.forEach((eventSource) =>
            this.addSqsEventSource(
                eventSource.queue,
                eventSource.sqsEventSourceProps,
            ),
        );

        eventRules?.forEach((rule) => this.addEventRule(rule));
    }

    private addEventRule(ruleProps: RuleProps) {
        const eventRule = new Rule(
            this,
            `${this.node.id}-event-rule-${this.eventRuleCount}`,
            ruleProps,
        );

        eventRule.addTarget(new LambdaFunction(this.lambda));
        this.eventRuleCount++;

        return this;
    }

    private addSqsEventSource(queue: IQueue, props?: SqsEventSourceProps) {
        this.lambda.addEventSource(new SqsEventSource(queue, props));

        return this;
    }
}
