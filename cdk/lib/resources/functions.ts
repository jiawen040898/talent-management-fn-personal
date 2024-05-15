import { Duration } from 'aws-cdk-lib';
import { Schedule } from 'aws-cdk-lib/aws-events';
import { Function as AwsLambdaFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { BaseFunction } from '../base';
import { environment, version } from '../variables';
import type { IAMRoleGroupResources } from './iam/iam-roles';
import type { LayerGroupResources } from './layers';
import type SQSGroupResources from './sqs';

/**
 * FunctionGroupResourcesProps
 *
 * @param iamRoleGroupResources {@link IAMRoleGroupResources}
 * @param sqsGroupResources {@link SQSGroupResources}
 * @param layerGroupResources {@link LayerGroupResources}
 */
type FunctionGroupResourcesProps = {
    iamRoleGroupResources: IAMRoleGroupResources;
    sqsGroupResources: SQSGroupResources;
    layerGroupResources: LayerGroupResources;
};

export class FunctionGroupResources extends Construct {
    public readonly employeeDailyReminderCronJob: AwsLambdaFunction;
    public readonly talentManagementProcessDomainEventFn: AwsLambdaFunction;
    public readonly talentManagementProcessEmployeeAssessmentScoreFn: AwsLambdaFunction;
    public readonly talentManagementProcessEmployeeFitScoreFn: AwsLambdaFunction;
    public readonly talentManagementFeedbackDashboardProvisionFn: AwsLambdaFunction;
    public readonly talentManagementProcessFeedbackCycleActionFn: AwsLambdaFunction;
    public readonly talentManagementProcessFeedbackCycleReminderFn: AwsLambdaFunction;
    public readonly processFeedbackRecommendationEndedRequest: AwsLambdaFunction;
    public readonly talentManagementFeedbackRecommendationInitializeRequestFn: AwsLambdaFunction;
    public readonly talentManagementFeedbackRecommendationProcessRequestFn: AwsLambdaFunction;
    public readonly talentManagementFeedbackRecommendationGenerationRequestFn: AwsLambdaFunction;
    public readonly talentManagementProcWeeklyManagerProgressReportFn: AwsLambdaFunction;

    /**
     * FunctionGroupResources
     *
     * @param scope {@link Construct}
     * @param id
     */
    constructor(
        scope: Construct,
        id: string,
        props: FunctionGroupResourcesProps,
    ) {
        super(scope, id);

        this.employeeDailyReminderCronJob = new BaseFunction(
            this,
            'talent-management-employeeDailyReminderCronJob-fn',
            {
                functionName:
                    'talent-management-employeeDailyReminderCronJob-fn',
                description: `Employee Daily Reminder Cron Job - Every 1 Hour (v${version})`,
                entry: 'src/functions/process-employee-daily-reminder.ts',
                isLogGroupExists: true,
                iamRole: props.iamRoleGroupResources.talentManagementLambdaRole,
                layers: [props.layerGroupResources.talentManagementFnLayer],
                eventRules: [
                    {
                        schedule: Schedule.expression(
                            environment === 'sandbox'
                                ? 'cron(0 0-15 * * ? *)'
                                : 'cron(0 * * * ? *)',
                        ),
                    },
                ],
            },
        ).lambda;

        this.talentManagementProcessDomainEventFn = new BaseFunction(
            this,
            'talent-management-processDomainEvent-fn',
            {
                functionName: 'talent-management-processDomainEvent-fn',
                description: `Process SQS messages from Talent Management Domain Queue (v${version})`,
                entry: 'src/functions/process-domain-event.ts',
                // reservedConcurrentExecutions: 40,
                isLogGroupExists: true,
                iamRole: props.iamRoleGroupResources.talentManagementLambdaRole,
                layers: [props.layerGroupResources.talentManagementFnLayer],
                sqsEventSources: [
                    {
                        queue: props.sqsGroupResources
                            .talentManagementDomainQueue,
                        sqsEventSourceProps: { batchSize: 1 },
                    },
                ],
            },
        ).lambda;

        this.talentManagementProcessEmployeeAssessmentScoreFn =
            new BaseFunction(
                this,
                'talent-management-process-employee-assessment-score-fn',
                {
                    functionName:
                        'talent-management-process-employee-assessment-score-fn',
                    description: `Process SQS messages to calculate assessment score then store into db and send assessment calculated event (v${version})`,
                    entry: 'src/functions/process-employee-assessment-score.ts',
                    // reservedConcurrentExecutions: 20,
                    isLogGroupExists: true,
                    iamRole:
                        props.iamRoleGroupResources.talentManagementLambdaRole,
                    layers: [props.layerGroupResources.talentManagementFnLayer],
                    sqsEventSources: [
                        {
                            queue: props.sqsGroupResources
                                .talentManagementAssessmentScoreQueue,
                            sqsEventSourceProps: {
                                batchSize: 1,
                                maxConcurrency: 20,
                            },
                        },
                    ],
                },
            ).lambda;

        this.talentManagementProcessEmployeeFitScoreFn = new BaseFunction(
            this,
            'talent-management-process-employee-fit-score-fn',
            {
                functionName: 'talent-management-process-employee-fit-score-fn',
                description: `Process SQS messages to calculate fit score then store into db (v${version})`,
                entry: 'src/functions/process-employee-fit-score.ts',
                // reservedConcurrentExecutions: 20,
                isLogGroupExists: true,
                iamRole: props.iamRoleGroupResources.talentManagementLambdaRole,
                layers: [props.layerGroupResources.talentManagementFnLayer],
                sqsEventSources: [
                    {
                        queue: props.sqsGroupResources
                            .talentManagementFitScoreQueue,
                        sqsEventSourceProps: {
                            batchSize: 1,
                            maxConcurrency: 20,
                        },
                    },
                ],
            },
        ).lambda;

        this.talentManagementFeedbackDashboardProvisionFn = new BaseFunction(
            this,
            'talent-management-feedback-dashboard-provision-fn',
            {
                functionName:
                    'talent-management-feedback-dashboard-provision-fn',
                description: `Listen to SQS event, run bq query to provision fbc_result table on bq, which will be used in feedback dashboard (v${version})`,
                entry: 'src/functions/process-feedback-dashboard-provision.ts',
                isLogGroupExists: true,
                iamRole: props.iamRoleGroupResources.talentManagementLambdaRole,
                layers: [props.layerGroupResources.talentManagementFnLayer],
                timeout: Duration.seconds(300),
                sqsEventSources: [
                    {
                        queue: props.sqsGroupResources
                            .talentManagementFeedbackDashboardProvisionQueue,
                    },
                ],
            },
        ).lambda;

        this.talentManagementProcessFeedbackCycleActionFn = new BaseFunction(
            this,
            'talent-management-processFeedbackCycleAction-fn',
            {
                functionName: 'talent-management-processFeedbackCycleAction-fn',
                description: `Process Daily Feedback Cycle Automated Action (v${version})`,
                entry: 'src/functions/process-feedback-cycle-action.ts',
                isLogGroupExists: true,
                iamRole: props.iamRoleGroupResources.talentManagementLambdaRole,
                layers: [props.layerGroupResources.talentManagementFnLayer],
                sqsEventSources: [
                    {
                        queue: props.sqsGroupResources
                            .talentManagementFeedbackCycleActionQueue,
                        sqsEventSourceProps: { batchSize: 1 },
                    },
                ],
            },
        ).lambda;

        this.talentManagementProcessFeedbackCycleReminderFn = new BaseFunction(
            this,
            'talent-management-processFeedbackCycleReminder-fn',
            {
                functionName:
                    'talent-management-processFeedbackCycleReminder-fn',
                description: `Process Daily Feedback Cycle Reminder (v${version})`,
                entry: 'src/functions/process-feedback-cycle-reminder.ts',
                isLogGroupExists: true,
                iamRole: props.iamRoleGroupResources.talentManagementLambdaRole,
                layers: [props.layerGroupResources.talentManagementFnLayer],
                sqsEventSources: [
                    {
                        queue: props.sqsGroupResources
                            .talentManagementFeedbackCycleReminderQueue,
                        sqsEventSourceProps: { batchSize: 1 },
                    },
                ],
            },
        ).lambda;

        this.processFeedbackRecommendationEndedRequest = new BaseFunction(
            this,
            'talent-management-feedback-recommendation-ended-request-fn',
            {
                functionName:
                    'talent-management-feedback-recommendation-ended-request-fn',
                description: `Trigger by step function, to update result status in feedback reviewee table (v${version})${version})`,
                entry: 'src/functions/process-feedback-recommendation-generation-ended-request.ts',
                isLogGroupExists: true,
                memorySize: 512,
                timeout: Duration.seconds(45),
                iamRole: props.iamRoleGroupResources.talentManagementLambdaRole,
                layers: [props.layerGroupResources.talentManagementFnLayer],
            },
        ).lambda;

        this.talentManagementFeedbackRecommendationInitializeRequestFn =
            new BaseFunction(
                this,
                'talent-management-feedback-recommendation-initialize-request-fn',
                {
                    functionName:
                        'talent-management-feedback-recommendation-initialize-request-fn',
                    description: `Listen to SQS event, invoke step function to generate feedback cycle reviewee recommendation (v${version})`,
                    entry: 'src/functions/process-feedback-recommendation-generation-initialize-request.ts',
                    isLogGroupExists: true,
                    iamRole:
                        props.iamRoleGroupResources.talentManagementLambdaRole,
                    layers: [props.layerGroupResources.talentManagementFnLayer],
                    sqsEventSources: [
                        {
                            queue: props.sqsGroupResources
                                .talentManagementFeedbackRecommendationGenerationInitializeQueue,
                            sqsEventSourceProps: {
                                batchSize: 1,
                                maxConcurrency: 2,
                            },
                        },
                    ],
                },
            ).lambda;

        this.talentManagementFeedbackRecommendationProcessRequestFn =
            new BaseFunction(
                this,
                'talent-management-feedback-recommendation-process-request-fn',
                {
                    functionName:
                        'talent-management-feedback-recommendation-process-request-fn',
                    description: `Listen to step function start execution command, map and process feedback (v${version})`,
                    entry: 'src/functions/process-feedback-recommendation-generation-process-request.ts',
                    isLogGroupExists: true,
                    iamRole:
                        props.iamRoleGroupResources.talentManagementLambdaRole,
                    layers: [props.layerGroupResources.talentManagementFnLayer],
                },
            ).lambda;

        this.talentManagementFeedbackRecommendationGenerationRequestFn =
            new BaseFunction(
                this,
                'talent-management-feedback-recommendation-generation-request-fn',
                {
                    functionName:
                        'talent-management-feedback-recommendation-generation-request-fn',
                    description: `Trigger by step function, generate feedback recommendation per competency (v${version})${version})`,
                    entry: 'src/functions/process-feedback-recommendation-generation-request.ts',
                    isLogGroupExists: true,
                    timeout: Duration.seconds(90),
                    iamRole:
                        props.iamRoleGroupResources.talentManagementLambdaRole,
                    layers: [props.layerGroupResources.talentManagementFnLayer],
                },
            ).lambda;

        this.talentManagementProcWeeklyManagerProgressReportFn =
            new BaseFunction(
                this,
                'talent-management-procWeeklyManagerProgressReport-fn',
                {
                    functionName:
                        'talent-management-procWeeklyManagerProgressReport-fn',
                    description: `Process Weekly Manager Subordinate Progress Report (v${version})`,
                    entry: 'src/functions/process-weekly-manager-subordinate-progress-report.ts',
                    isLogGroupExists: true,
                    iamRole:
                        props.iamRoleGroupResources.talentManagementLambdaRole,
                    layers: [props.layerGroupResources.talentManagementFnLayer],
                    sqsEventSources: [
                        {
                            queue: props.sqsGroupResources
                                .talentManagementLxpManagerSubordinateProgressReportQueue,
                            sqsEventSourceProps: { batchSize: 1 },
                        },
                    ],
                },
            ).lambda;
    }
}
