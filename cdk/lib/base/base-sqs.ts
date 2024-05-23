import {
    CustomSqsPairConstruct,
    PulsifiTeam,
} from '@pulsifi/custom-aws-cdk-lib';
import { type CustomSqsPairProps } from '@pulsifi/custom-aws-cdk-lib/sqs-pair';
import { Tags } from 'aws-cdk-lib';
import {
    AnyPrincipal,
    Effect,
    PolicyStatement,
    PolicyStatementProps,
} from 'aws-cdk-lib/aws-iam';
import { Topic } from 'aws-cdk-lib/aws-sns';
import {
    SqsSubscription,
    type SqsSubscriptionProps,
} from 'aws-cdk-lib/aws-sns-subscriptions';
import type { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

import { ResourceTag } from '../constants';
import { environment } from '../variables';

/**
 * BaseSQSProps
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
 * @optional accessPolicyStatements
 * @optional snsSubscriptions
 */
type BaseSQSProps = {
    accessPolicyStatements?: PolicyStatementProps[];
    snsSubscriptions?: {
        topicArn: string;
        subscriptionFilterPolicy?: SqsSubscriptionProps;
    }[];
} & Omit<CustomSqsPairProps, 'awsEnvironment' | 'resourceOwner'>;

export class BaseSQS extends Construct {
    public readonly mainSQS: Queue;
    private readonly sqsPair: CustomSqsPairConstruct;

    /**
     * BaseSQS
     *
     * @public mainSQS {@link Queue}
     * @public sqsPair {@link CustomSqsPairConstruct}
     *
     * @param scope {@link Construct}
     * @param id
     * @param props {@link BaseSQSProps}
     */
    constructor(scope: Construct, id: string, props: BaseSQSProps) {
        super(scope, id);

        /* queue */
        this.sqsPair = new CustomSqsPairConstruct(this, props.sqsName, {
            ...props,
            awsEnvironment: environment,
            resourceOwner: PulsifiTeam.ENGINEERING,
        });

        this.mainSQS = this.sqsPair.mainSqs;

        Tags.of(this.sqsPair).add('Type', ResourceTag.SQS);

        /* add sns subscriptions to queue */
        if (props.snsSubscriptions?.length) {
            /* default queue policy */
            const sqsPolicyStatement = new PolicyStatement({
                effect: Effect.ALLOW,
                principals: [new AnyPrincipal()],
                actions: ['sqs:ReceiveMessage'],
                resources: [this.sqsPair.mainSqs.queueArn],
                conditions: {
                    ArnLike: {
                        // eslint-disable-next-line @typescript-eslint/naming-convention
                        'aws:SourceArn': props.snsSubscriptions.map(
                            (subscription) => subscription.topicArn,
                        ),
                    },
                },
            });

            this.sqsPair.mainSqs.addToResourcePolicy(sqsPolicyStatement);

            /* add sns subscriptions & filter policy */
            for (const subscription of props.snsSubscriptions) {
                this.addSnsSubscription(
                    subscription.topicArn,
                    subscription.subscriptionFilterPolicy,
                );
            }
        }

        /* queue policy */
        if (props.accessPolicyStatements?.length) {
            for (const policyStatement of props.accessPolicyStatements) {
                const policy = new PolicyStatement({
                    resources: [this.sqsPair.mainSqs.queueArn],
                    ...policyStatement,
                });
                this.sqsPair.mainSqs.addToResourcePolicy(policy);
            }
        }
    }

    private addSnsSubscription(
        topicArn: string,
        subscriptionFilterPolicy?: SqsSubscriptionProps,
    ) {
        const sns = Topic.fromTopicArn(this, topicArn, topicArn);

        sns.addSubscription(
            new SqsSubscription(this.sqsPair.mainSqs, subscriptionFilterPolicy),
        );

        return this;
    }
}
