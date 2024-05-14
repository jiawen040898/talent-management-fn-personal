import { Construct } from 'constructs';

import type { IAMRoleGroupResources } from '../iam';
import type { LayerGroupResources } from '../layers';
import type { SQSGroupResources } from '../sqs';
import { EmployeeDailyReminderCronJobResource } from './employeeDailyReminderCronJob';
import { ProcessDomainEventResource } from './process-domain-event-fn';
import { ProcessEmployeeAssessmentScoreFnResource } from './process-employee-assessment-score-fn';
import { ProcessEmployeeFitScoreFnResource } from './process-employee-fit-score-fn';
import { ProcessFeedbackDashboardProvisionResource } from './process-feedback-dashboard-provision';
import { ProcessFeedbackCycleActionResource } from './processFeedbackCycleAction';
import { ProcessFeedbackCycleReminderResource } from './processFeedbackCycleReminder';
import { ProcessFeedbackRecommendationGenerationEndedRequestResource } from './processFeedbackRecommendationGenerationEndedRequest';
import { ProcessFeedbackRecommendationGenerationInitializeRequestResource } from './processFeedbackRecommendationGenerationInitializeRequest';
import { ProcessFeedbackRecommendationGenerationProcessRequestResource } from './processFeedbackRecommendationGenerationProcessRequest';
import { ProcessFeedbackRecommendationGenerationRequestResource } from './processFeedbackRecommendationGenerationRequest';
import { ProcessWeeklyManagerSubordinateProgressReportResource } from './processWeeklyManagerSubordinateProgressReport';

/**
 * LambdaGroupResourcesProps
 *
 * @param iamRoleGroupResources {@link IAMRoleGroupResources}
 * @param sqsGroupResources {@link SQSGroupResources}
 * @param layerGroupResources {@link LayerGroupResources}
 */
type LambdaGroupResourcesProps = {
    iamRoleGroupResources: IAMRoleGroupResources;
    sqsGroupResources: SQSGroupResources;
    layerGroupResources: LayerGroupResources;
};

export class LambdaGroupResources extends Construct {
    /**
     * LambdaGroupResources
     *
     * @param scope {@link Construct}
     * @param id
     */
    constructor(
        scope: Construct,
        id: string,
        props: LambdaGroupResourcesProps,
    ) {
        super(scope, id);

        new EmployeeDailyReminderCronJobResource(
            this,
            'employee-daily-reminder-cron-job-resource',
            {
                iamRole: props.iamRoleGroupResources.talentManagementLambdaRole,
                layers: [props.layerGroupResources.talentManagementFnLayer],
            },
        );

        new ProcessDomainEventResource(this, 'process-domain-event-resource', {
            iamRole: props.iamRoleGroupResources.talentManagementLambdaRole,
            sqs: props.sqsGroupResources.talentManagementDomainQueue,
            layers: [props.layerGroupResources.talentManagementFnLayer],
        });

        new ProcessEmployeeAssessmentScoreFnResource(
            this,
            'process-employee-assessment-score-fn-resource',
            {
                iamRole: props.iamRoleGroupResources.talentManagementLambdaRole,
                sqs: props.sqsGroupResources
                    .talentManagementAssessmentScoreQueue,
                layers: [props.layerGroupResources.talentManagementFnLayer],
            },
        );

        new ProcessEmployeeFitScoreFnResource(
            this,
            'process-employee-fit-score-fn-resource',
            {
                iamRole: props.iamRoleGroupResources.talentManagementLambdaRole,
                sqs: props.sqsGroupResources.talentManagementFitScoreQueue,
                layers: [props.layerGroupResources.talentManagementFnLayer],
            },
        );

        new ProcessFeedbackDashboardProvisionResource(
            this,
            'process-feedback-dashboard-provision-resource',
            {
                iamRole: props.iamRoleGroupResources.talentManagementLambdaRole,
                sqs: props.sqsGroupResources
                    .talentManagementFeedbackDashboardProvisionQueue,
                layers: [props.layerGroupResources.talentManagementFnLayer],
            },
        );

        new ProcessFeedbackCycleActionResource(
            this,
            'process-feedback-cycle-action-resource',
            {
                iamRole: props.iamRoleGroupResources.talentManagementLambdaRole,
                sqs: props.sqsGroupResources
                    .talentManagementFeedbackCycleActionQueue,
                layers: [props.layerGroupResources.talentManagementFnLayer],
            },
        );

        new ProcessFeedbackCycleReminderResource(
            this,
            'process-feedback-cycle-reminder-resource',
            {
                iamRole: props.iamRoleGroupResources.talentManagementLambdaRole,
                sqs: props.sqsGroupResources
                    .talentManagementFeedbackCycleReminderQueue,
                layers: [props.layerGroupResources.talentManagementFnLayer],
            },
        );

        new ProcessFeedbackRecommendationGenerationEndedRequestResource(
            this,
            'process-feedback-recommendation-generation-ended-request-resource',
            {
                iamRole: props.iamRoleGroupResources.talentManagementLambdaRole,
                layers: [props.layerGroupResources.talentManagementFnLayer],
            },
        );

        new ProcessFeedbackRecommendationGenerationInitializeRequestResource(
            this,
            'process-feedback-recommendation-generation-initialize-request-resource',
            {
                iamRole: props.iamRoleGroupResources.talentManagementLambdaRole,
                sqs: props.sqsGroupResources
                    .talentManagementFeedbackRecommendationGenerationInitializeQueue,
                layers: [props.layerGroupResources.talentManagementFnLayer],
            },
        );

        new ProcessFeedbackRecommendationGenerationProcessRequestResource(
            this,
            'process-feedback-recommendation-generation-process-request',
            {
                iamRole: props.iamRoleGroupResources.talentManagementLambdaRole,
                layers: [props.layerGroupResources.talentManagementFnLayer],
            },
        );

        new ProcessFeedbackRecommendationGenerationRequestResource(
            this,
            'process-feedback-recommendation-generation-request',
            {
                iamRole: props.iamRoleGroupResources.talentManagementLambdaRole,
                layers: [props.layerGroupResources.talentManagementFnLayer],
            },
        );

        new ProcessWeeklyManagerSubordinateProgressReportResource(
            this,
            'process-weekly-manager-subordinate-progress-report',
            {
                iamRole: props.iamRoleGroupResources.talentManagementLambdaRole,
                sqs: props.sqsGroupResources
                    .talentManagementLxpManagerSubordinateProgressReportQueue,
                layers: [props.layerGroupResources.talentManagementFnLayer],
            },
        );
    }
}
