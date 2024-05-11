import { dateTimeUtil, snsService } from '@pulsifi/fn';
import { DataSource, In } from 'typeorm';

import * as database from '../../src/database';
import {
    FeedbackCycle,
    FeedbackCycleReviewee,
    FeedbackCycleReviewer,
    FeedbackCycleStatus,
    RevieweeStatus,
    ReviewerDirection,
    ReviewerStatus,
} from '../../src/models';
import { feedbackCycleActionService } from '../../src/services/feedback-cycle-action.service';
import { dateUtil } from '../../src/utils';
import { getTestDataSourceAndAddData } from '../setup';
import { testData } from './fixtures/test-data';

jest.mock('@pulsifi/fn/services/sns.service');
describe('FeedbackCycleActionService', () => {
    let dataSource: DataSource;
    const spygetDataSource = jest.spyOn(database, 'getDataSource');
    const urlMatchedRegex = '^https://local-employee.pulsifi.me/';
    beforeAll(async () => {
        dataSource = await getTestDataSourceAndAddData(
            testData.entitiesFeedbackCycleActionToBeAdded,
        );
        spygetDataSource.mockImplementation(() => {
            return Promise.resolve(dataSource);
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('approve manager nomination with reviewee ready for feedback', async () => {
        // Arrange
        jest.mocked(snsService.sendEventModel).mockResolvedValueOnce();
        jest.mocked(snsService.sendBatchEventModels).mockResolvedValueOnce();

        // Act
        await feedbackCycleActionService.approveManagerNominationAction({
            ...testData.mockCompanyLookupData,
            localDate: dateUtil.getDate(
                dateTimeUtil.addDays(6, new Date()).toISOString(),
            ),
        });

        //Assert
        const result = await dataSource
            .getRepository(FeedbackCycleReviewee)
            .findAndCount({
                select: {
                    id: true,
                    reviewer_selection_manager_id: true,
                },
                where: {
                    feedback_cycle_id:
                        testData.mockFeedbackCycleAutoApprovalData.id,
                    status: RevieweeStatus.READY_FOR_FEEDBACK,
                },
            });
        const totalRevieweeReady = result[1];
        expect(totalRevieweeReady).toBe(2);

        const reviewerResult = await dataSource
            .getRepository(FeedbackCycleReviewer)
            .findAndCount({
                select: {
                    id: true,
                    status: true,
                    reviewer_direction: true,
                },
                where: {
                    feedback_cycle_reviewee_id: In(result[0].map((i) => i.id)),
                    status: ReviewerStatus.READY,
                },
            });
        const totalReviewerReady = reviewerResult[1];
        const totalSelfReviewReady = reviewerResult[0].filter(
            (i) => i.reviewer_direction === ReviewerDirection.SELF,
        ).length;
        expect(totalReviewerReady).toBe(4);

        const uniqueManagerIds = [
            ...new Set(result[0].map((i) => i.reviewer_selection_manager_id)),
        ];

        expect(jest.mocked(snsService.sendEventModel).mock.calls.length).toBe(
            uniqueManagerIds.length,
        );
        expect(
            jest.mocked(snsService.sendEventModel).mock.calls[0][0],
        ).toMatchSnapshot({
            event_id: expect.anything(),
            data: {
                cycle: {
                    id: expect.anything(),
                    start_date: expect.anything(),
                    close_date: expect.anything(),
                    nomination_submission_deadline: expect.anything(),
                    nomination_approval_deadline: expect.anything(),
                    feedback_submission_deadline: expect.anything(),
                },
                manager: {
                    employee_id: expect.anything(),
                },
                receiver: {
                    id: expect.anything(),
                    employee_id: expect.anything(),
                },
                call_to_action: {
                    url: expect.stringMatching(urlMatchedRegex),
                },
            },
        });

        expect(
            jest.mocked(snsService.sendBatchEventModels).mock.calls.length,
        ).toBe(2);

        expect(
            jest.mocked(snsService.sendBatchEventModels).mock.calls[0][0]
                .length,
        ).toBe(totalRevieweeReady);
        expect(
            jest.mocked(snsService.sendBatchEventModels).mock.calls[1][0]
                .length,
        ).toBe(totalReviewerReady - totalSelfReviewReady);
    });

    it('start cycle with reviewee ready for nomination', async () => {
        // Arrange
        jest.mocked(snsService.sendEventModel).mockResolvedValueOnce();
        jest.mocked(snsService.sendBatchEventModels).mockResolvedValueOnce();

        // Act
        await feedbackCycleActionService.startCycleWithReadyForNominationAction(
            {
                ...testData.mockCompanyLookupData,
                localDate: dateUtil.getDate(new Date().toISOString()),
            },
        );

        // Assert
        const activeCycleCount = await dataSource
            .getRepository(FeedbackCycle)
            .countBy({
                id: testData.mockFeedbackCycleReadyForNominationData.id,
                status: FeedbackCycleStatus.ACTIVE,
            });
        expect(activeCycleCount).toBe(1);
        const result = await dataSource
            .getRepository(FeedbackCycleReviewee)
            .findAndCount({
                select: {
                    id: true,
                },
                where: {
                    feedback_cycle_id:
                        testData.mockFeedbackCycleReadyForNominationData.id,
                    status: RevieweeStatus.PENDING_NOMINATION,
                },
            });
        const totalPendingNomination = result[1];
        expect(result[1]).toBe(totalPendingNomination);

        const reviewerResult = await dataSource
            .getRepository(FeedbackCycleReviewer)
            .find({
                select: {
                    id: true,
                    status: true,
                    reviewer_direction: true,
                },
                where: {
                    feedback_cycle_reviewee_id: In(result[0].map((i) => i.id)),
                },
            });
        const totalPending = reviewerResult.length;
        const totalSelfAndManagerReady = reviewerResult.filter(
            (i) => i.status === ReviewerStatus.READY,
        ).length;
        expect(totalPending).toBe(4);
        expect(jest.mocked(snsService.sendEventModel).mock.calls.length).toBe(
            totalPendingNomination,
        );
        expect(
            jest.mocked(snsService.sendEventModel).mock.calls[0][0],
        ).toMatchSnapshot({
            event_id: expect.anything(),
            data: {
                cycle: {
                    id: expect.anything(),
                    start_date: expect.anything(),
                    close_date: expect.anything(),
                    nomination_submission_deadline: expect.anything(),
                    nomination_approval_deadline: expect.anything(),
                    feedback_submission_deadline: expect.anything(),
                },
                manager: {
                    employee_id: expect.anything(),
                },
                receiver: {
                    id: expect.anything(),
                    employee_id: expect.anything(),
                },
                call_to_action: {
                    url: expect.stringMatching(urlMatchedRegex),
                },
            },
        });

        expect(
            jest.mocked(snsService.sendBatchEventModels).mock.calls.length,
        ).toBe(1);
        expect(
            jest.mocked(snsService.sendBatchEventModels).mock.calls[0][0]
                .length,
        ).toBe(totalSelfAndManagerReady);
    });

    it('start cycle with reviewee ready for feedback', async () => {
        // Arrange
        jest.mocked(snsService.sendEventModel).mockResolvedValueOnce();

        // Act
        await feedbackCycleActionService.startCycleWithReadyForFeedbackAction({
            ...testData.mockCompanyLookupData,
            localDate: dateUtil.getDate(new Date().toISOString()),
        });

        // Assert
        const activeCycleCount = await dataSource
            .getRepository(FeedbackCycle)
            .countBy({
                id: testData.mockFeedbackCycleReadyForFeedbackData.id,
                status: FeedbackCycleStatus.ACTIVE,
            });
        expect(activeCycleCount).toBe(1);
        const result = await dataSource
            .getRepository(FeedbackCycleReviewee)
            .findAndCount({
                select: {
                    id: true,
                },
                where: {
                    feedback_cycle_id:
                        testData.mockFeedbackCycleReadyForFeedbackData.id,
                    status: RevieweeStatus.READY_FOR_FEEDBACK,
                },
            });
        expect(result[1]).toBe(1);

        const readyReviewerCount = await dataSource
            .getRepository(FeedbackCycleReviewer)
            .countBy({
                feedback_cycle_reviewee_id: In(result[0].map((i) => i.id)),
                status: ReviewerStatus.READY,
            });
        expect(readyReviewerCount).toBe(2);

        expect(jest.mocked(snsService.sendEventModel).mock.calls.length).toBe(
            readyReviewerCount,
        );
        expect(
            jest.mocked(snsService.sendEventModel).mock.calls[0][0],
        ).toMatchSnapshot({
            event_id: expect.anything(),
            data: {
                cycle: {
                    id: expect.anything(),
                    start_date: expect.anything(),
                    close_date: expect.anything(),
                    nomination_submission_deadline: expect.anything(),
                    nomination_approval_deadline: expect.anything(),
                    feedback_submission_deadline: expect.anything(),
                },
                provider: {
                    id: expect.anything(),
                    employee_id: expect.anything(),
                },
                receiver: {
                    id: expect.anything(),
                    employee_id: expect.anything(),
                },
                call_to_action: {
                    url: expect.stringMatching(urlMatchedRegex),
                },
            },
        });
    });
});
