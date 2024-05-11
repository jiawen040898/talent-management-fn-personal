import { dateTimeUtil, snsService } from '@pulsifi/fn';
import { DataSource } from 'typeorm';

import * as database from '../../src/database';
import { feedbackCycleReminderService } from '../../src/services/feedback-cycle-reminder.service';
import { dateUtil } from '../../src/utils';
import { getTestDataSourceAndAddData } from '../setup';
import { testData } from './fixtures/test-data';

jest.mock('@pulsifi/fn/services/sns.service');

describe('FeedbackCycleReminderService', () => {
    let dataSource: DataSource;
    const spygetDataSource = jest.spyOn(database, 'getDataSource');
    const urlMatchedRegex = '^https://local-employee.pulsifi.me/';

    beforeAll(async () => {
        dataSource = await getTestDataSourceAndAddData(
            testData.entitiesFeedbackCycleReminderToBeAdded,
        );
        spygetDataSource.mockImplementation(() => {
            return Promise.resolve(dataSource);
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('send nomination submission reminder with x day before deadline to reviewee', async () => {
        // Arrange
        jest.mocked(snsService.sendEventModel).mockResolvedValueOnce();

        // Act
        await feedbackCycleReminderService.sendNominationSubmissionReminder({
            ...testData.mockCompanyLookupData,
            localDate: dateUtil.getDate(
                dateTimeUtil.addDays(1, new Date()).toISOString(),
            ),
        });

        // Assert
        expect(
            jest.mocked(snsService.sendEventModel).mock.calls[0][0],
        ).toMatchSnapshot({
            event_id: expect.anything(),
            data: {
                cycle: {
                    start_date: expect.anything(),
                    close_date: expect.anything(),
                    nomination_submission_deadline: expect.anything(),
                    nomination_approval_deadline: expect.anything(),
                    feedback_submission_deadline: expect.anything(),
                },
                call_to_action: {
                    url: expect.stringMatching(urlMatchedRegex),
                },
            },
        });
    });

    it('send nomination approval reminder with x day before deadline to reporting manager of reviewee', async () => {
        // Arrange
        jest.mocked(snsService.sendEventModel).mockResolvedValueOnce();

        // Act
        await feedbackCycleReminderService.sendManagerNominationApprovalReminder(
            {
                ...testData.mockCompanyLookupData,
                localDate: dateUtil.getDate(
                    dateTimeUtil.addDays(4, new Date()).toISOString(),
                ),
            },
        );

        // Assert
        expect(
            jest.mocked(snsService.sendEventModel).mock.calls[0][0],
        ).toMatchSnapshot({
            event_id: expect.anything(),
            data: {
                cycle: {
                    start_date: expect.anything(),
                    close_date: expect.anything(),
                    nomination_submission_deadline: expect.anything(),
                    nomination_approval_deadline: expect.anything(),
                    feedback_submission_deadline: expect.anything(),
                },

                call_to_action: {
                    url: expect.stringMatching(urlMatchedRegex),
                },
            },
        });
    });

    it('send feedback submission reminder with x day before deadline to reviewer (self | others)', async () => {
        // Arrange
        jest.mocked(snsService.sendEventModel).mockClear();

        // Act
        await feedbackCycleReminderService.sendFeedbackSubmissionReminder({
            ...testData.mockCompanyLookupData,
            localDate: dateUtil.getDate(
                dateTimeUtil.addDays(7, new Date()).toISOString(),
            ),
        });

        // Assert
        const expectDataSnapShot = {
            cycle: {
                id: expect.anything(),
                start_date: expect.anything(),
                close_date: expect.anything(),
                nomination_submission_deadline: expect.anything(),
                nomination_approval_deadline: expect.anything(),
                feedback_submission_deadline: expect.anything(),
            },
            call_to_action: {
                url: expect.stringMatching(urlMatchedRegex),
            },
        };

        expect(
            jest.mocked(snsService.sendEventModel).mock.calls[0][0],
        ).toMatchSnapshot({
            event_id: expect.anything(),
            data: expectDataSnapShot,
        });
        expect(
            jest.mocked(snsService.sendEventModel).mock.calls[1][0],
        ).toMatchSnapshot({
            event_id: expect.anything(),
            data: expectDataSnapShot,
        });
        expect(
            jest.mocked(snsService.sendEventModel).mock.calls[2][0],
        ).toMatchSnapshot({
            event_id: expect.anything(),
            data: expectDataSnapShot,
        });
    });
});
