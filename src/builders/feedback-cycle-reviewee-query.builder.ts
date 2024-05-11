import { Repository } from 'typeorm';

import {
    Employee,
    FeedbackCycle,
    FeedbackCycleNotification,
    FeedbackCycleReviewee,
    FeedbackCycleStatus,
    ReminderCategory,
    RevieweeStatus,
    ReviewerSelectionBy,
    UserAccountStatus,
} from '../models';
import { BaseQueryBuilder } from './base-query.builder';

export class FeedbackCycleRevieweeQueryBuilder extends BaseQueryBuilder<FeedbackCycleReviewee> {
    constructor(repository: Repository<FeedbackCycleReviewee>) {
        super(repository, 'reviewee');
    }

    innerJoinEmployeeReviewee(): this {
        this.builder.innerJoin(
            Employee,
            'employee',
            `${this.alias}.reviewee_employee_id = employee.id`,
        );

        return this;
    }

    innerJoinEmployeeRevieweeOfManager(): this {
        this.builder.innerJoin(
            Employee,
            'manager',
            `${this.alias}.reviewer_selection_manager_id = manager.id`,
        );

        return this;
    }

    leftJoinEmployeeRevieweeOfManager(): this {
        this.builder.leftJoin(
            Employee,
            'manager',
            `${this.alias}.reviewer_selection_manager_id = manager.id`,
        );

        return this;
    }

    innerJoinFeedbackCycle(): this {
        this.builder.innerJoin(
            FeedbackCycle,
            'feedback_cycle',
            `${this.alias}.feedback_cycle_id = feedback_cycle.id`,
        );

        return this;
    }

    innerJoinFeedbackCycleNotification(): this {
        this.builder.innerJoin(
            FeedbackCycleNotification,
            'feedback_cycle_notification',
            `${this.alias}.feedback_cycle_id = feedback_cycle_notification.feedback_cycle_id`,
        );

        return this;
    }

    whereIdIsIn(revieweeId: string): this {
        this.builder.andWhere(`${this.alias}.id = :revieweeId`, {
            revieweeId,
        });

        return this;
    }

    whereDraftCycleWithEmployeeAndManagerSelectionAt(
        companyId: number,
        startDate: string,
    ): this {
        this.builder.andWhere(
            `
            feedback_cycle.company_id = :companyId 
            and feedback_cycle.status = :feedbackCycleStatus
            and feedback_cycle.reviewer_selection_setting ->> 'selection_by' IN (:...reviewerSelectionBys)
            and reviewee.status = :revieweeStatus
            and Date(feedback_cycle.cycle_start_at) = :startDate`,
            {
                companyId,
                feedbackCycleStatus: FeedbackCycleStatus.PENDING,
                revieweeStatus: RevieweeStatus.DRAFT,
                reviewerSelectionBys: [
                    ReviewerSelectionBy.REVIEWEE,
                    ReviewerSelectionBy.MANAGER,
                ],
                startDate,
            },
        );
        return this;
    }

    whereNominationApprovalDeadlineAt(
        companyId: number,
        deadline: string,
    ): this {
        this.builder.andWhere(
            `
            feedback_cycle.company_id = :companyId and feedback_cycle.status = :feedbackCycleStatus
            and reviewee.status = :revieweeStatus
            and Date(feedback_cycle.nomination_approval_due_at)= :deadline`,
            {
                companyId,
                feedbackCycleStatus: FeedbackCycleStatus.ACTIVE,
                revieweeStatus: RevieweeStatus.PENDING_NOMINATION_APPROVAL,
                deadline,
            },
        );
        return this;
    }

    whereNominationSubmissionReminderAt(
        companyId: number,
        remindDate: string,
    ): this {
        this.builder.andWhere(
            `
            feedback_cycle.company_id = :companyId and feedback_cycle.status = :feedbackCycleStatus
            and employee.status = :employeeStatus
            and reviewee.status = :revieweeStatus and feedback_cycle_notification.category = :reminderCategory
            and Date(feedback_cycle_notification.due_at) = :remindDate`,
            {
                companyId,
                feedbackCycleStatus: FeedbackCycleStatus.ACTIVE,
                employeeStatus: UserAccountStatus.ACTIVE,
                revieweeStatus: RevieweeStatus.PENDING_NOMINATION,
                reminderCategory: ReminderCategory.NOMINATION_SUBMISSION,
                remindDate,
            },
        );
        return this;
    }

    whereNominationApprovalReminderAt(
        companyId: number,
        remindDate: string,
    ): this {
        this.builder.andWhere(
            `
            feedback_cycle.company_id = :companyId and feedback_cycle.status = :feedbackCycleStatus
            and manager.status = :managerStatus
            and reviewee.status = :revieweeStatus and feedback_cycle_notification.category = :reminderCategory
            and Date(feedback_cycle_notification.due_at) = :remindDate`,
            {
                companyId,
                feedbackCycleStatus: FeedbackCycleStatus.ACTIVE,
                managerStatus: UserAccountStatus.ACTIVE,
                revieweeStatus: RevieweeStatus.PENDING_NOMINATION_APPROVAL,
                reminderCategory: ReminderCategory.NOMINATION_APPROVAL,
                remindDate,
            },
        );
        return this;
    }

    selectForNominationSubmission(): this {
        this.builder.select([
            'feedback_cycle.company_id as company_id',
            'feedback_cycle.id as feedback_cycle_id',
            'feedback_cycle.name as feedback_cycle_name',
            'DATE(feedback_cycle.cycle_start_at) as feedback_cycle_start_date',
            'DATE(feedback_cycle.cycle_close_at) as feedback_cycle_close_date',
            'DATE(feedback_cycle.nomination_submission_due_at) as nomination_submission_deadline',
            'DATE(feedback_cycle.nomination_approval_due_at) as nomination_approval_deadline',
            'DATE(feedback_cycle.feedback_submission_due_at) as feedback_submission_deadline',
            'reviewee.id as reviewee_id',
            'reviewee.status as reviewee_status',
            'employee.id as reviewee_employee_id',
            'employee.user_account_id as reviewee_user_account_id',
            'employee.work_email as reviewee_email',
            'employee.first_name as reviewee_first_name',
            'employee.last_name as reviewee_last_name',
            'manager.id as manager_id',
            'manager.user_account_id as manager_user_account_id',
            'manager.work_email as manager_email',
            'manager.first_name as manager_first_name',
            'manager.last_name as manager_last_name',
        ]);

        return this;
    }

    selectForRecommendation(): this {
        this.builder.select([
            'feedback_cycle.company_id as company_id',
            'reviewee.id as reviewee_id',
            'employee.id as reviewee_employee_id',
            'employee.user_account_id as reviewee_user_account_id',
            'employee.work_email as reviewee_email',
            'employee.first_name as reviewee_first_name',
            'employee.last_name as reviewee_last_name',
        ]);

        return this;
    }

    selectForAutoNominationApprovalTimeline(): this {
        this.builder.select([
            'feedback_cycle.company_id',
            'feedback_cycle.id as feedback_cycle_id',
            'feedback_cycle.name as feedback_cycle_name',
            'DATE(feedback_cycle.cycle_start_at) as feedback_cycle_start_date',
            'DATE(feedback_cycle.cycle_close_at) as feedback_cycle_close_date',
            'DATE(feedback_cycle.nomination_submission_due_at) as nomination_submission_deadline',
            'DATE(feedback_cycle.nomination_approval_due_at) as nomination_approval_deadline',
            'DATE(feedback_cycle.feedback_submission_due_at) as feedback_submission_deadline',
            `feedback_cycle.reviewer_selection_setting ->> 'is_auto_approve_reviewer_selection_enabled' as is_auto_approve_reviewer_selection_enabled`,
            'reviewee.id as reviewee_id',
            'reviewee.status as reviewee_status',
            'employee.id as reviewee_employee_id',
            'employee.user_account_id as reviewee_user_account_id',
            'employee.work_email as reviewee_email',
            'employee.first_name as reviewee_first_name',
            'employee.last_name as reviewee_last_name',
            'manager.id as manager_id',
            'manager.user_account_id as manager_user_account_id',
            'manager.work_email as manager_email',
            'manager.first_name as manager_first_name',
            'manager.last_name as manager_last_name',
        ]);
        return this;
    }
}
