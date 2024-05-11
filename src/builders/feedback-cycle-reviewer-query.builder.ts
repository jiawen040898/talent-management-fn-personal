import { Repository } from 'typeorm';

import {
    Employee,
    FeedbackCycle,
    FeedbackCycleNotification,
    FeedbackCycleReviewee,
    FeedbackCycleReviewer,
    FeedbackCycleStatus,
    ReminderCategory,
    RevieweeStatus,
    ReviewerDirection,
    ReviewerSelectionBy,
    ReviewerStatus,
    UserAccountStatus,
} from '../models';
import { BaseQueryBuilder } from './base-query.builder';

export class FeedbackCycleReviewerQueryBuilder extends BaseQueryBuilder<FeedbackCycleReviewer> {
    constructor(repository: Repository<FeedbackCycleReviewer>) {
        super(repository, 'reviewer');
    }

    leftJoinEmployeeReviewer(): this {
        this.builder.leftJoin(
            Employee,
            'employee',
            `${this.alias}.reviewer_employee_id = employee.id`,
        );

        return this;
    }

    innerJoinFeedbackCycleReviewee(): this {
        this.builder.innerJoin(
            FeedbackCycleReviewee,
            'reviewee',
            `${this.alias}.feedback_cycle_reviewee_id = reviewee.id`,
        );

        return this;
    }

    innerJoinEmployeeReviewee(): this {
        this.builder.innerJoin(
            Employee,
            'employee_reviewee',
            `reviewee.reviewee_employee_id = employee_reviewee.id`,
        );

        return this;
    }

    innerJoinFeedbackCycle(): this {
        this.builder.innerJoin(
            FeedbackCycle,
            'feedback_cycle',
            `reviewee.feedback_cycle_id = feedback_cycle.id`,
        );

        return this;
    }

    innerJoinFeedbackCycleNotification(): this {
        this.builder.innerJoin(
            FeedbackCycleNotification,
            'feedback_cycle_notification',
            `feedback_cycle.id = feedback_cycle_notification.feedback_cycle_id`,
        );

        return this;
    }

    whereFeedbackSubmissionReminderAt(
        companyId: number,
        remindDate: string,
    ): this {
        this.builder.andWhere(
            `
            feedback_cycle.company_id = :companyId and feedback_cycle.status = :feedbackCycleStatus
            and (employee.status = :employeeStatus OR employee.status IS NULL)  and reviewer.completed_at IS NULL
            and reviewer.status IN(:...reviewerStatus) and feedback_cycle_notification.category = :reminderCategory
            and Date(feedback_cycle_notification.due_at) = :remindDate`,
            {
                companyId,
                feedbackCycleStatus: FeedbackCycleStatus.ACTIVE,
                employeeStatus: UserAccountStatus.ACTIVE,
                reviewerStatus: [
                    ReviewerStatus.READY,
                    ReviewerStatus.IN_PROGRESS,
                ],
                reminderCategory: ReminderCategory.FEEDBACK_SUBMISSION,
                remindDate,
            },
        );
        return this;
    }

    whereStatusInPendingAndRevieweesIn(
        companyId: number,
        revieweeIds: string[],
    ): this {
        this.builder.andWhere(
            `
            feedback_cycle.company_id = :companyId and feedback_cycle.status = :feedbackCycleStatus
            and reviewer.status = :reviewerStatus and reviewer.reviewer_direction != :notReviewerDirectionOf
            and reviewer.feedback_cycle_reviewee_id IN (:...revieweeIds)`,
            {
                companyId,
                feedbackCycleStatus: FeedbackCycleStatus.ACTIVE,
                reviewerStatus: ReviewerStatus.PENDING,
                notReviewerDirectionOf: ReviewerDirection.SELF,
                revieweeIds,
            },
        );
        return this;
    }

    whereStatusInReadyAndSelfManagerRevieweesIn(
        companyId: number,
        revieweeIds: string[],
    ): this {
        this.builder.andWhere(
            `
            feedback_cycle.company_id = :companyId and feedback_cycle.status = :feedbackCycleStatus
            and reviewer.status = :reviewerStatus and reviewer.reviewer_direction IN (:...reviewerDirectionOfs)
            and reviewer.feedback_cycle_reviewee_id IN (:...revieweeIds)`,
            {
                companyId,
                feedbackCycleStatus: FeedbackCycleStatus.ACTIVE,
                reviewerStatus: ReviewerStatus.READY,
                reviewerDirectionOfs: [
                    ReviewerDirection.SELF,
                    ReviewerDirection.MANAGER,
                ],
                revieweeIds,
            },
        );
        return this;
    }

    whereDraftCycleWithAdminSelectionAt(
        companyId: number,
        startDate: string,
    ): this {
        this.builder.andWhere(
            `
            feedback_cycle.company_id = :companyId 
            and feedback_cycle.status = :feedbackCycleStatus
            and feedback_cycle.reviewer_selection_setting ->> 'selection_by' = :reviewerSelectionBy
            and reviewee.status = :revieweeStatus
            and Date(feedback_cycle.cycle_start_at) = :startDate`,
            {
                companyId,
                feedbackCycleStatus: FeedbackCycleStatus.PENDING,
                revieweeStatus: RevieweeStatus.DRAFT,
                reviewerSelectionBy: ReviewerSelectionBy.ADMIN,
                startDate,
            },
        );
        return this;
    }

    selectForFeedbackSubmission(): this {
        this.builder.select([
            'feedback_cycle.company_id',
            'feedback_cycle.id as feedback_cycle_id',
            'feedback_cycle.name as feedback_cycle_name',
            'DATE(feedback_cycle.cycle_start_at) as feedback_cycle_start_date',
            'DATE(feedback_cycle.cycle_close_at) as feedback_cycle_close_date',
            'DATE(feedback_cycle.nomination_submission_due_at) as nomination_submission_deadline',
            'DATE(feedback_cycle.nomination_approval_due_at) as nomination_approval_deadline',
            'DATE(feedback_cycle.feedback_submission_due_at) as feedback_submission_deadline',
            'reviewer.id as reviewer_id',
            'reviewer.status as reviewer_status',
            'reviewer.reviewer_direction as reviewer_direction',
            `reviewer.external_reviewer_name as external_reviewer_name`,
            `reviewer.external_reviewer_email as external_reviewer_email`,
            'reviewee.id as reviewee_id',
            'employee.user_account_id as reviewer_user_account_id',
            'employee.id as reviewer_employee_id',
            'employee.work_email as reviewer_email',
            'employee.first_name as reviewer_first_name',
            'employee.last_name as reviewer_last_name',
            'employee_reviewee.id as reviewee_employee_id',
            'employee_reviewee.user_account_id as reviewee_user_account_id',
            'employee_reviewee.work_email as reviewee_email',
            'employee_reviewee.first_name as reviewee_first_name',
            'employee_reviewee.last_name as reviewee_last_name',
            'feedback_cycle_notification.category as notification_category',
            'feedback_cycle_notification.due_at as notification_due_date',
        ]);
        return this;
    }

    selectForFeedbackReady(): this {
        this.builder.select([
            'feedback_cycle.company_id',
            'feedback_cycle.id as feedback_cycle_id',
            'feedback_cycle.name as feedback_cycle_name',
            'DATE(feedback_cycle.cycle_start_at) as feedback_cycle_start_date',
            'DATE(feedback_cycle.cycle_close_at) as feedback_cycle_close_date',
            'DATE(feedback_cycle.nomination_submission_due_at) as nomination_submission_deadline',
            'DATE(feedback_cycle.nomination_approval_due_at) as nomination_approval_deadline',
            'DATE(feedback_cycle.feedback_submission_due_at) as feedback_submission_deadline',
            'reviewer.id as reviewer_id',
            'reviewer.status as reviewer_status',
            'reviewer.reviewer_direction  as reviewer_direction',
            'reviewer.select_source as reviewer_select_source',
            'reviewee.id as reviewee_id',
            'employee.user_account_id as reviewer_user_account_id',
            'employee.id as reviewer_employee_id',
            'employee.work_email as reviewer_email',
            'employee.first_name as reviewer_first_name',
            'employee.last_name as reviewer_last_name',
            'employee_reviewee.id as reviewee_employee_id',
            'employee_reviewee.user_account_id as reviewee_user_account_id',
            'employee_reviewee.work_email as reviewee_email',
            'employee_reviewee.first_name as reviewee_first_name',
            'employee_reviewee.last_name as reviewee_last_name',
        ]);
        return this;
    }
}
