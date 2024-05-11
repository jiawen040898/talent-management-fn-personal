import { dateTimeUtil, generatorUtil } from '@pulsifi/fn';
import * as Factory from 'factory.ts';

import { FeedbackCycleRevieweeRecommendationRecommendationDimension } from '../../../src/constants';
import {
    EmailCommunicationType,
    Employee,
    FeedbackCycle,
    FeedbackCycleEmailTemplate,
    FeedbackCycleReviewee,
    FeedbackCycleReviewer,
    FeedbackCycleReviewerDirection,
    FeedbackCycleStatus,
    RevieweeStatus,
    ReviewerDirection,
    ReviewerSelectionBy,
    ReviewerSelectSource,
    ReviewerStatus,
    UserAccountStatus,
} from '../../../src/models';
import { FeedbackCycleRevieweeRecommendation } from '../../../src/models/feedback-cycle-reviewee-recommendation.entity';
import { TestData } from '../../setup/test-data.setup';

export const testFeedbackCycleBuilder = Factory.Sync.makeFactory<FeedbackCycle>(
    {
        id: Factory.each(() => generatorUtil.uuid()),
        company_id: TestData.companyId,
        status: FeedbackCycleStatus.ACTIVE,
        name: Factory.each((i) => `Cycle Name ${i}`),
        description: Factory.each((i) => `Cycle Description ${i}`),
        cycle_start_at: dateTimeUtil.now(),
        cycle_close_at: dateTimeUtil.addDays(14, dateTimeUtil.now()),
        nomination_submission_due_at: dateTimeUtil.addDays(
            2,
            dateTimeUtil.now(),
        ),
        questionnaire_rating_scale_setting: {
            choices: [
                {
                    label: '1',
                    value: 1,
                },
                {
                    label: '2',
                    value: 2,
                },
                {
                    label: '3',
                    value: 3,
                },
                {
                    label: '4',
                    value: 4,
                },
                {
                    label: '5',
                    value: 5,
                },
                {
                    label: '6',
                    value: 6,
                },
                {
                    label: '7',
                    value: 7,
                },
                {
                    label: '8',
                    value: 8,
                },
                {
                    label: '9',
                    value: 9,
                },
                {
                    label: '10',
                    value: 10,
                },
            ],
            max_scale: 10,
        },
        nomination_approval_due_at: dateTimeUtil.addDays(5, dateTimeUtil.now()),
        feedback_submission_due_at: dateTimeUtil.addDays(8, dateTimeUtil.now()),
        reviewer_direction: [
            FeedbackCycleReviewerDirection.SELF,
            FeedbackCycleReviewerDirection.MANAGER,
            FeedbackCycleReviewerDirection.PEER,
            FeedbackCycleReviewerDirection.DIRECT_REPORT,
            FeedbackCycleReviewerDirection.EXTERNAL,
        ],
        reviewer_selection_setting: {
            selection_by: ReviewerSelectionBy.REVIEWEE,
            is_reviewer_selection_approval_enabled: true,
            is_auto_approve_reviewer_selection_enabled: true,
        },
        is_deleted: false,
        ...TestData.auditData,
    },
);

export const testFeedbackCycleEmailTemplateBuilder =
    Factory.Sync.makeFactory<FeedbackCycleEmailTemplate>({
        id: Factory.each((i) => i),
        feedback_cycle_id: Factory.each(() => generatorUtil.uuid()),
        email_communication_type:
            EmailCommunicationType.EMPLOYEE_FEEDBACK_REVIEWEE_RESPONSE_REQUESTED,
        subject: 'You are invite to submit self feedback',
        body_in_html: '<p>Hello, this is a feedback self invite </p>',
        ...TestData.auditData,
    });

export const testEmployeeBuilder = Factory.Sync.makeFactory<Employee>({
    id: Factory.each(() => generatorUtil.uuid()),
    company_id: TestData.companyId,
    work_email: Factory.each((i) => `employee${i}@test.pulsifi.me`),
    user_account_id: Factory.each((i) => 100 + i),
    status: UserAccountStatus.ACTIVE,
    first_name: Factory.each((i) => `First Name ${i}`),
    last_name: Factory.each((i) => `Last Name ${i}`),
    ...TestData.auditData,
});

export const testRevieweeBuilder =
    Factory.Sync.makeFactory<FeedbackCycleReviewee>({
        id: Factory.each(() => generatorUtil.uuid()),
        feedback_cycle_id: Factory.each(() => generatorUtil.uuid()),
        reviewee_employee_id: Factory.each(() => generatorUtil.uuid()),
        status: RevieweeStatus.DRAFT,
        is_deleted: false,
        ...TestData.auditData,
    });

export const testReviewerBuilder =
    Factory.Sync.makeFactory<FeedbackCycleReviewer>({
        id: Factory.each(() => generatorUtil.uuid()),
        feedback_cycle_reviewee_id: Factory.each(() => generatorUtil.uuid()),
        reviewer_employee_id: Factory.each(() => generatorUtil.uuid()),
        reviewer_direction: ReviewerDirection.SELF,
        select_source: ReviewerSelectSource.EMPLOYEE,
        status: ReviewerStatus.DRAFT,
        is_deleted: false,
        ...TestData.auditData,
    });

export const testRevieweeRecommendationBuilder =
    Factory.Sync.makeFactory<FeedbackCycleRevieweeRecommendation>({
        id: Factory.each(() => generatorUtil.uuid()),
        feedback_cycle_id: Factory.each(() => generatorUtil.uuid()),
        feedback_cycle_question_id: Factory.each((i) => i + 1),
        feedback_cycle_reviewee_id: Factory.each(() => generatorUtil.uuid()),
        recommendation_dimension:
            FeedbackCycleRevieweeRecommendationRecommendationDimension.DEVELOPMENT,
        score: 5,
        is_deleted: false,
        ...TestData.auditData,
    });
