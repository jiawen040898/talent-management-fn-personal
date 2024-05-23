import { SubscriptionFilter } from 'aws-cdk-lib/aws-sns';
import type { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

import { BaseSQS } from '../base';
import { accountId, region } from '../variables';

export default class SQSGroupResources extends Construct {
    public readonly talentManagementAssessmentScoreQueue: Queue;
    public readonly talentManagementDomainQueue: Queue;
    public readonly talentManagementFitScoreQueue: Queue;
    public readonly talentManagementFeedbackDashboardProvisionQueue: Queue;
    public readonly talentManagementFeedbackCycleActionQueue: Queue;
    public readonly talentManagementFeedbackCycleReminderQueue: Queue;
    public readonly talentManagementFeedbackRecommendationGenerationInitializeQueue: Queue;
    public readonly talentManagementLxpManagerSubordinateProgressReportQueue: Queue;

    /**
     * SQSGroupResources
     *
     * @public talentManagementAssessmentScoreQueue {@link Queue}
     * @public talentManagementDomainQueue {@link Queue}
     * @public talentManagementFitScoreQueue {@link Queue}
     * @public talentManagementFeedbackDashboardProvisionQueue {@link Queue}
     * @public talentManagementFeedbackCycleActionQueue {@link Queue}
     * @public talentManagementFeedbackCycleReminderQueue {@link Queue}
     * @public talentManagementFeedbackRecommendationGenerationInitializeQueue {@link Queue}
     * @public talentManagementLxpManagerSubordinateProgressReportQueue {@link Queue}
     *
     *
     * @param scope {@link Construct}
     * @param id
     */
    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.talentManagementAssessmentScoreQueue = new BaseSQS(
            this,
            'talent-management-assessment-score-queue',
            {
                sqsName: 'talent-management-assessment-score',
                fifo: true,
                snsSubscriptions: [
                    {
                        topicArn: `arn:aws:sns:${region}:${accountId}:talent-management-domain-topic.fifo`,
                        subscriptionFilterPolicy: {
                            filterPolicy: {
                                event_type: SubscriptionFilter.stringFilter({
                                    allowlist: [
                                        'talent_management_employee_assessments_submitted',
                                    ],
                                }),
                            },
                        },
                    },
                ],
            },
        ).mainSQS;

        this.talentManagementDomainQueue = new BaseSQS(
            this,
            'talent-management-domain-queue',
            {
                sqsName: 'talent-management-domain',
                fifo: true,
                snsSubscriptions: [
                    {
                        topicArn: `arn:aws:sns:${region}:${accountId}:identity-topic.fifo`,
                        subscriptionFilterPolicy: {
                            filterPolicy: {
                                event_type: SubscriptionFilter.stringFilter({
                                    allowlist: [
                                        'identity_employee_user_created',
                                    ],
                                }),
                            },
                        },
                    },
                ],
            },
        ).mainSQS;

        this.talentManagementFitScoreQueue = new BaseSQS(
            this,
            'talent-management-fit-score-queue',
            {
                sqsName: 'talent-management-fit-score',
                fifo: true,
                snsSubscriptions: [
                    {
                        topicArn: `arn:aws:sns:${region}:${accountId}:talent-management-domain-topic.fifo`,
                        subscriptionFilterPolicy: {
                            filterPolicy: {
                                event_type: SubscriptionFilter.stringFilter({
                                    allowlist: [
                                        'talent_management_assessments_score_calculated',
                                    ],
                                }),
                            },
                        },
                    },
                ],
            },
        ).mainSQS;

        this.talentManagementFeedbackDashboardProvisionQueue = new BaseSQS(
            this,
            'talent-management-feedback-dashboard-provision-queue',
            {
                sqsName: 'talent-management-feedback-dashboard-provision',
                fifo: false,
                deliveryDelayInSeconds: 600,
                visibilityTimeoutInSeconds: 300,
                snsSubscriptions: [
                    {
                        topicArn: `arn:aws:sns:${region}:${accountId}:talent-management-domain-topic.fifo`,
                        subscriptionFilterPolicy: {
                            filterPolicy: {
                                event_type: SubscriptionFilter.stringFilter({
                                    allowlist: [
                                        'talent_management_feedback_cycle_closed',
                                    ],
                                }),
                            },
                        },
                    },
                ],
            },
        ).mainSQS;

        this.talentManagementFeedbackCycleActionQueue = new BaseSQS(
            this,
            'talent-management-feedback-cycle-action-queue',
            {
                sqsName: 'talent-management-feedback-cycle-action',
                fifo: false,
                snsSubscriptions: [
                    {
                        topicArn: `arn:aws:sns:${region}:${accountId}:identity-company-cron-topic`,
                        subscriptionFilterPolicy: {
                            filterPolicy: {
                                local_hour: SubscriptionFilter.numericFilter({
                                    allowlist: [8],
                                }),
                            },
                        },
                    },
                ],
            },
        ).mainSQS;

        this.talentManagementFeedbackCycleReminderQueue = new BaseSQS(
            this,
            'talent-management-feedback-cycle-reminder-queue',
            {
                sqsName: 'talent-management-feedback-cycle-reminder',
                fifo: false,
                snsSubscriptions: [
                    {
                        topicArn: `arn:aws:sns:${region}:${accountId}:identity-company-cron-topic`,
                        subscriptionFilterPolicy: {
                            filterPolicy: {
                                local_hour: SubscriptionFilter.numericFilter({
                                    allowlist: [8],
                                }),
                            },
                        },
                    },
                ],
            },
        ).mainSQS;

        this.talentManagementFeedbackRecommendationGenerationInitializeQueue =
            new BaseSQS(
                this,
                'talent-management-feedback-recommendation-generation-initialize-queue',
                {
                    sqsName:
                        'talent-management-feedback-recommendation-generation-initialize',
                    fifo: true,
                    visibilityTimeoutInSeconds: 60,
                    deliveryDelayInSeconds: 30,
                    snsSubscriptions: [
                        {
                            topicArn: `arn:aws:sns:${region}:${accountId}:talent-management-domain-topic.fifo`,
                            subscriptionFilterPolicy: {
                                filterPolicy: {
                                    event_type: SubscriptionFilter.stringFilter(
                                        {
                                            allowlist: [
                                                'talent_management_feedback_reviewee_recommendation_requested',
                                            ],
                                        },
                                    ),
                                },
                            },
                        },
                    ],
                },
            ).mainSQS;

        this.talentManagementLxpManagerSubordinateProgressReportQueue =
            new BaseSQS(
                this,
                'talent-management-lxp-manager-subordinate-progress-report-queue',
                {
                    sqsName:
                        'talent-management-lxp-manager-subordinate-progress-report',
                    fifo: false,
                    snsSubscriptions: [
                        {
                            topicArn: `arn:aws:sns:${region}:${accountId}:identity-company-cron-topic`,
                            subscriptionFilterPolicy: {
                                filterPolicy: {
                                    local_hour:
                                        SubscriptionFilter.numericFilter({
                                            allowlist: [10],
                                        }),
                                    local_weekday:
                                        SubscriptionFilter.numericFilter({
                                            allowlist: [1],
                                        }),
                                },
                            },
                        },
                    ],
                },
            ).mainSQS;
    }
}
