import { templateEngine } from '@pulsifi/fn/utils/template-engine';

import * as AWSConfig from '../configs';
import { DomainEventType } from '../constants';
import { FeedbackResponse } from '../interface';
import { FeedbackCycleReviewerDirection } from '../models';

export const employeeAppPath: Record<
    string,
    string | ((variables: FeedbackResponse) => string)
> = {
    [DomainEventType.EMPLOYEE_FEEDBACK_NOMINATION_REQUESTED]:
        '{{employee_app_url}}/profile/feedbacks/{{feedback_cycle_id}}/view?nomination={{reviewee_id}}',

    [DomainEventType.MANAGER_FEEDBACK_NOMINATION_APPROVAL_REQUESTED]:
        '{{employee_app_url}}/teams/{{reviewee_employee_id}}/feedbacks/{{feedback_cycle_id}}/view?nomination={{reviewee_id}}',

    [DomainEventType.FEEDBACK_NOMINATION_SUBMISSION_DUE]:
        '{{employee_app_url}}/profile/feedbacks/{{feedback_cycle_id}}/view',

    [DomainEventType.FEEDBACK_MANAGER_NOMINATION_APPROVAL_DUE]:
        '{{employee_app_url}}/home',

    [DomainEventType.FEEDBACK_NOMINATION_APPROVED]:
        '{{employee_app_url}}/profile/feedbacks/{{feedback_cycle_id}}/view?nomination={{reviewee_id}}',

    [DomainEventType.FEEDBACK_NOMINATION_AMENDMENT_APPROVED]:
        '{{employee_app_url}}/profile/feedbacks/{{feedback_cycle_id}}/view?nomination={{reviewee_id}}',

    [DomainEventType.FEEDBACK_MANAGER_NOMINATION_AUTO_APPROVED]:
        '{{employee_app_url}}/profile/feedbacks/{{feedback_cycle_id}}/view',

    [DomainEventType.FEEDBACK_REVIEWEE_RESPONSE_REQUESTED]:
        '{{employee_app_url}}/feedbacks/{{reviewee_id}}/response',

    [DomainEventType.FEEDBACK_REVIEWER_RESPONSE_REQUESTED]: (
        variables: FeedbackResponse,
    ): string => {
        return variables.reviewer_direction !==
            FeedbackCycleReviewerDirection.EXTERNAL
            ? '{{employee_app_url}}/feedbacks/{{reviewee_id}}/response'
            : '{{employee_app_url}}/external/feedbacks/{{reviewer_id}}/response';
    },

    [DomainEventType.FEEDBACK_REVIEWEE_RESPONSE_SUBMISSION_DUE]:
        '{{employee_app_url}}/feedbacks/{{reviewee_id}}/response',

    [DomainEventType.FEEDBACK_REVIEWER_RESPONSE_SUBMISSION_DUE]: (
        variables: FeedbackResponse,
    ): string => {
        return variables.reviewer_direction !==
            FeedbackCycleReviewerDirection.EXTERNAL
            ? '{{employee_app_url}}/feedbacks/{{reviewee_id}}/response'
            : '{{employee_app_url}}/external/feedbacks/{{reviewer_id}}/response';
    },

    [DomainEventType.FEEDBACK_REVIEWEE_RESULT_READY]:
        '{{employee_app_url}}/profile/feedbacks/{{feedback_cycle_id}}/result',

    [DomainEventType.FEEDBACK_MANAGER_DIRECT_REPORT_RESULT_READY]:
        '{{employee_app_url}}/teams/{{reviewee_employee_id}}/feedbacks/{{feedback_cycle_id}}/result',

    [DomainEventType.FEEDBACK_REVIEWEE_FEEDBACK_RECOMMENDATION_COMPLETED]:
        '{{employee_app_url}}/profile/feedbacks/reviewees/{{reviewee_id}}/result',

    [DomainEventType.PARTICIPANT_PROGRAM_RESULT_READY]:
        '{{employee_app_url}}/profile/assessments/programs/{{program_id}}/result',
};

export const urlGenerator = {
    toEmployeeAppUrl(eventType: DomainEventType, variables: SafeAny) {
        const empAppPath = employeeAppPath[eventType];
        const appPath =
            typeof empAppPath === 'function'
                ? empAppPath(variables)
                : empAppPath;

        return templateEngine.parseAndRender(appPath, {
            ...variables,
            employee_app_url: AWSConfig.appUrl().employee,
        });
    },
};
