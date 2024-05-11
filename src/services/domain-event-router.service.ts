import { EventType } from '../constants';
import {
    CompanyLookupDto,
    IEmployeeUserCreatedEventData,
    ManagerSubordinateAggregatedReportData,
} from '../dtos';
import { IEventModel } from '../interface';
import { EmployeeManagementService } from './employee-management.service';
import { EmployeeProgressReportService } from './employee-progress-report.service';
import { feedbackCycleActionService } from './feedback-cycle-action.service';
import { feedbackCycleReminderService } from './feedback-cycle-reminder.service';

type EventTypeHandler = {
    [K in EventType]: (message: IEventModel<SafeAny>) => Promise<void>;
};

export const eventHandlers: EventTypeHandler = {
    identity_employee_user_created: async function (
        message: IEventModel<IEmployeeUserCreatedEventData>,
    ): Promise<void> {
        await EmployeeManagementService.updateUserAccountId(message.data);
    },

    get_employee_task_and_goal_by_company: async function (
        message: IEventModel<CompanyLookupDto>,
    ): Promise<void> {
        await EmployeeManagementService.processEmployeeTaskAndGoalByCompany(
            message.data,
        );
    },

    talent_management_handling_manager_weekly_progress: async function (
        message: IEventModel<ManagerSubordinateAggregatedReportData>,
    ): Promise<void> {
        const service = new EmployeeProgressReportService();

        await service.handleEmployeeProgressReportByManager(
            message.company_id,
            message.data,
        );
    },
    talent_management_feedback_nomination_submission_reminder_scheduler:
        async function (message: IEventModel<CompanyLookupDto>): Promise<void> {
            return feedbackCycleReminderService.sendNominationSubmissionReminder(
                message.data,
            );
        },
    talent_management_feedback_nomination_approval_reminder_scheduler:
        async function (message: IEventModel<CompanyLookupDto>): Promise<void> {
            return feedbackCycleReminderService.sendManagerNominationApprovalReminder(
                message.data,
            );
        },
    talent_management_feedback_submission_reminder_scheduler: async function (
        message: IEventModel<CompanyLookupDto>,
    ): Promise<void> {
        return feedbackCycleReminderService.sendFeedbackSubmissionReminder(
            message.data,
        );
    },
    talent_management_feedback_nomination_approval_action_scheduler:
        async function (message: IEventModel<CompanyLookupDto>): Promise<void> {
            return feedbackCycleActionService.approveManagerNominationAction(
                message.data,
            );
        },
    talent_management_feedback_cycle_start_with_ready_nomination_action_scheduler:
        async function (
            _message: IEventModel<CompanyLookupDto>,
            // eslint-disable-next-line @typescript-eslint/no-empty-function
        ): Promise<void> {},
    talent_management_feedback_cycle_start_with_ready_feedback_action_scheduler:
        async function (
            _message: IEventModel<CompanyLookupDto>,
            // eslint-disable-next-line @typescript-eslint/no-empty-function
        ): Promise<void> {},
};
