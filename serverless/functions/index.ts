/* eslint-disable @typescript-eslint/naming-convention */
import { Functions } from 'serverless/aws';

import { employeeDailyReminderCronJob } from './employeeDailyReminderCronJob';
import { handleProcessDomainEvent } from './process-domain-event-fn';
import { handleProcessEmployeeAssessmentScore } from './process-employee-assessment-score-fn';
import { handleProcessEmployeeFitScore } from './process-employee-fit-score-fn';
import { processFeedbackDashboardProvision } from './process-feedback-dashboard-provision';
import { processFeedbackCycleAction } from './processFeedbackCycleAction';
import { processFeedbackCycleReminder } from './processFeedbackCycleReminder';
import { processFeedbackRecommendationGenerationEndedRequest } from './processFeedbackRecommendationGenerationEndedRequest';
import { processFeedbackRecommendationGenerationInitializeRequest } from './processFeedbackRecommendationGenerationInitializeRequest';
import { processFeedbackRecommendationGenerationProcessRequest } from './processFeedbackRecommendationGenerationProcessRequest';
import { processFeedbackRecommendationGenerationRequest } from './processFeedbackRecommendationGenerationRequest';
import { processWeeklyManagerSubordinateProgressReport } from './processWeeklyManagerSubordinateProgressReport';

export const functions: Functions = {
    processDomainEvent: handleProcessDomainEvent,
    employeeDailyReminderCronJob,
    processWeeklyManagerSubordinateProgressReport,
    processFeedbackCycleAction,
    processFeedbackCycleReminder,
    processFeedbackRecommendationGenerationInitializeRequest,
    processFeedbackRecommendationGenerationProcessRequest,
    processFeedbackRecommendationGenerationRequest,
    processFeedbackRecommendationGenerationEndedRequest,
    processFeedbackDashboardProvision,
    handleProcessEmployeeAssessmentScore,
    handleProcessEmployeeFitScore,
};
