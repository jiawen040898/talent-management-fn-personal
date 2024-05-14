import {
    CustomSqsPairConstruct,
    PulsifiTeam,
} from '@pulsifi/custom-aws-cdk-lib';
import { Tags } from 'aws-cdk-lib';
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { SubscriptionFilter, Topic } from 'aws-cdk-lib/aws-sns';
import { SqsSubscription } from 'aws-cdk-lib/aws-sns-subscriptions';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

import { ResourceTag } from '../../constants';
import { accountId, environment, region } from '../../variables';

const sqsName =
    'talent-management-feedback-recommendation-generation-initialize';
const snsTopicArn = `arn:aws:sns:${region}:${accountId}:talent-management-domain-topic.fifo`;

export class TalentManagementFeedbackRecommendationGenerationInitializeQueueResource extends Construct {
    public readonly mainSQS: Queue;
    constructor(scope: Construct, id: string) {
        super(scope, id);

        /* queue */
        const sqs = new CustomSqsPairConstruct(this, sqsName, {
            fifo: true,
            awsEnvironment: environment,
            resourceOwner: PulsifiTeam.ENGINEERING,
            sqsName: sqsName,
            isDlq: false,
            visibilityTimeoutInSeconds: 60,
            deliveryDelayInSeconds: 30,
        });

        this.mainSQS = sqs.mainSqs;

        Tags.of(sqs).add('Type', ResourceTag.SQS);

        /* queue policy */
        const sqsPolicyStatement = new PolicyStatement({
            effect: Effect.ALLOW,
            principals: [new AnyPrincipal()],
            actions: ['sqs:ReceiveMessage'],
            resources: [sqs.mainSqs.queueArn],
            conditions: {
                ArnLike: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    'aws:SourceArn': snsTopicArn,
                },
            },
        });

        sqs.mainSqs.addToResourcePolicy(sqsPolicyStatement);

        /* add sns subscription to queue */
        const sns = Topic.fromTopicArn(this, `${id}-topic-arn`, snsTopicArn);
        sns.addSubscription(
            new SqsSubscription(sqs.mainSqs, {
                filterPolicy: {
                    event_type: SubscriptionFilter.stringFilter({
                        allowlist: [
                            'talent_management_feedback_reviewee_recommendation_requested',
                        ],
                    }),
                },
            }),
        );
    }
}
