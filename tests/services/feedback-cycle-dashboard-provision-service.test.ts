import { dateTimeUtil } from '@pulsifi/fn';
import { GcpBigQueryService } from '@pulsifi/fn/services/gcp-big-query';
import murmurhash from 'murmurhash';
import { DataSource, Repository } from 'typeorm';

import * as database from '../../src/database';
import { FeedbackCycle } from '../../src/models';
import { FeedbackCycleDashboardProvisionService } from '../../src/services';
import { getTestDataSource, testUtil } from '../setup';
import { testFeedbackCycleBuilder } from './fixtures/test-builder';

const mockQuery = jest.spyOn(GcpBigQueryService, 'query');

describe('FeedbackCycleDashboardProvisionService', () => {
    let dataSource: DataSource;
    let feedbackCycleRepository: Repository<FeedbackCycle>;

    beforeAll(async () => {
        dataSource = await getTestDataSource();

        jest.spyOn(dateTimeUtil, 'now').mockImplementation(
            () => new Date('2021-09-01T00:00:00.000Z'),
        );

        jest.spyOn(database, 'getDataSource').mockImplementation(() => {
            return Promise.resolve(dataSource);
        });

        const mockFeedbackCycle = testFeedbackCycleBuilder.build({
            id: '00000000-0000-0000-0000-000000000001',
            company_id: 1,
            cycle_close_at: new Date().toISOString(),
        });

        feedbackCycleRepository = dataSource.getRepository(FeedbackCycle);

        await feedbackCycleRepository.save(mockFeedbackCycle);
    });

    beforeEach(() => {
        mockQuery.mockClear();
    });

    describe('isFeedbackCycleClosedOnBQ', () => {
        it('should return true if feedback cycle is closed on BQ', async () => {
            // Arrange
            mockQuery.mockResolvedValue([
                { id: 'test-id', cycle_closed_at: new Date().toISOString() },
            ]);

            // Act
            const isClosed =
                await FeedbackCycleDashboardProvisionService.isFeedbackCycleClosedOnBQ(
                    'test-id',
                );

            // Assert
            expect(isClosed).toEqual(true);
        });

        it('should return false if feedback cycle is not closed on BQ', async () => {
            // Arrange
            mockQuery.mockResolvedValue([]);

            // Act
            const isClosed =
                await FeedbackCycleDashboardProvisionService.isFeedbackCycleClosedOnBQ(
                    'test-id',
                );

            // Assert
            expect(isClosed).toEqual(false);
        });
    });

    describe('waitForFeedbackCycleToCloseOnBq', () => {
        it('should throw error if feedback cycle is not closed on BQ', async () => {
            // Arrange
            mockQuery.mockResolvedValue([]);

            // Act
            const exception = await testUtil.catchException(() =>
                FeedbackCycleDashboardProvisionService.waitForFeedbackCycleToCloseOnBq(
                    'test-id',
                    2,
                    50, // 50ms for test
                ),
            );

            // Assert
            expect(exception).toMatchExceptionSnapshot();
        });

        it('should not throw error if feedback cycle is closed on BQ', async () => {
            // Arrange
            mockQuery.mockResolvedValueOnce([]).mockResolvedValueOnce([
                {
                    id: 'test-id',
                    cycle_closed_at: new Date().toISOString(),
                },
            ]);

            // Act
            const output =
                await FeedbackCycleDashboardProvisionService.waitForFeedbackCycleToCloseOnBq(
                    'test-id',
                    2,
                    50, // 50ms for test
                );

            // Assert
            expect(output).toBeUndefined();
        });
    });

    describe('updateFbcTableName', () => {
        it('should replace company id and feedback cycle id hash', () => {
            // Arrange
            const query =
                'SELECT * FROM {{something}}.fbc_{{company_id}}_{{feedback_cycle_id_hash}} WHERE company_id = {{company_id}}';

            // Act
            const output =
                FeedbackCycleDashboardProvisionService.updateFbcTableName(
                    query,
                    1,
                    'test-hash',
                );

            // Assert
            expect(output).toEqual(
                'SELECT * FROM {{something}}.fbc_1_test-hash WHERE company_id = 1',
            );
        });
    });

    describe('provisionFeedbackCycleDashboard', () => {
        it('should provision feedback cycle dashboard', async () => {
            // Arrange
            const feedbackCycleId = '00000000-0000-0000-0000-000000000001';
            mockQuery.mockResolvedValueOnce([
                {
                    id: 'test-id',
                    cycle_closed_at: new Date().toISOString(),
                },
            ]);

            mockQuery.mockResolvedValueOnce([]).mockResolvedValueOnce([]);

            // Act
            await FeedbackCycleDashboardProvisionService.provisionFeedbackCycleDashboard(
                feedbackCycleId,
                1,
                1,
            );

            // Assert
            expect(mockQuery).toHaveBeenCalledTimes(3);
            expect(mockQuery.mock.calls).toMatchSnapshot();

            const feedbackCycle = await feedbackCycleRepository.findOneOrFail({
                select: ['id', 'report_result_meta'],
                where: {
                    id: feedbackCycleId,
                },
            });
            expect(feedbackCycle.report_result_meta?.dashboard).toEqual({
                provisioned_at: '2021-09-01T00:00:00.000Z',
                feedback_cycle_id_hash: murmurhash
                    .v3(feedbackCycleId)
                    .toString(),
            });
        });
    });
});
