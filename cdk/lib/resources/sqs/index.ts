import type { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

import { TalentManagementAssessmentScoreQueueResource } from './talent-management-assessment-score-queue';
import { TalentManagementDomainQueueResource } from './talent-management-domain-queue';
import { TalentManagementFeedbackCycleActionQueueResource } from './talent-management-feedback-cycle-action-queue';
import { TalentManagementFeedbackCycleReminderQueueResource } from './talent-management-feedback-cycle-reminder-queue';
import { TalentManagementFeedbackDashboardProvisionQueueResource } from './talent-management-feedback-dashboard-provision-queue';
import { TalentManagementFeedbackRecommendationGenerationInitializeQueueResource } from './talent-management-feedback-recommendation-generation-initialize-queue';
import { TalentManagementFitScoreQueueResource } from './talent-management-fit-score-queue';
import { TalentManagementLxpManagerSubordinateProgressReportQueueResource } from './talent-management-lxp-manager-subordinate-progress-report-queue';

export class SQSGroupResources extends Construct {
    public readonly talentManagementAssessmentScoreQueue: Queue;
    public readonly talentManagementDomainQueue: Queue;
    public readonly talentManagementFitScoreQueue: Queue;
    public readonly talentManagementFeedbackDashboardProvisionQueue: Queue;
    public readonly talentManagementFeedbackCycleActionQueue: Queue;
    public readonly talentManagementFeedbackCycleReminderQueue: Queue;
    public readonly talentManagementFeedbackRecommendationGenerationInitializeQueue: Queue;
    public readonly talentManagementLxpManagerSubordinateProgressReportQueue: Queue;

    /**
     * LayerGroupResources
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

        this.talentManagementAssessmentScoreQueue =
            new TalentManagementAssessmentScoreQueueResource(
                this,
                'talent-management-domain-queue-resource',
            ).mainSQS;

        this.talentManagementDomainQueue =
            new TalentManagementDomainQueueResource(
                this,
                'talent-management-assessment-score-queue-resource',
            ).mainSQS;

        this.talentManagementFitScoreQueue =
            new TalentManagementFitScoreQueueResource(
                this,
                'talent-management-fit-score-queue-resource',
            ).mainSQS;

        this.talentManagementFeedbackDashboardProvisionQueue =
            new TalentManagementFeedbackDashboardProvisionQueueResource(
                this,
                'talent-management-feedback-dashboard-provision-queue-resource',
            ).mainSQS;

        this.talentManagementFeedbackCycleActionQueue =
            new TalentManagementFeedbackCycleActionQueueResource(
                this,
                'talent-management-feedback-cycle-action-queue-resource',
            ).mainSQS;

        this.talentManagementFeedbackCycleReminderQueue =
            new TalentManagementFeedbackCycleReminderQueueResource(
                this,
                'talent-management-feedback-cycle-reminder-queue-resource',
            ).mainSQS;

        this.talentManagementFeedbackRecommendationGenerationInitializeQueue =
            new TalentManagementFeedbackRecommendationGenerationInitializeQueueResource(
                this,
                'talent-management-feedback-recommendation-generation-initialize-queue-resource',
            ).mainSQS;

        this.talentManagementLxpManagerSubordinateProgressReportQueue =
            new TalentManagementLxpManagerSubordinateProgressReportQueueResource(
                this,
                'talent-management-lxp-manager-subordinate-progress-report-queue-resource',
            ).mainSQS;
    }
}
