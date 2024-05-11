import { dateTimeUtil, ErrorDetails, logger } from '@pulsifi/fn';
import { BaseException } from '@pulsifi/fn/exceptions';
import { GcpBigQueryService } from '@pulsifi/fn/services/gcp-big-query';
import { backOff } from 'exponential-backoff';
import murmurhash from 'murmurhash';

import { gcpConfig } from '../configs';
import { BigQueries } from '../constants';
import { getDataSource } from '../database';
import { FeedbackCycle, FeedbackCycleReportResultMeta } from '../models';

const isFeedbackCycleClosedOnBQ = async (
    feedbackCycleId: string,
): Promise<boolean> => {
    const [isClosed] = await GcpBigQueryService.query(
        gcpConfig(),
        BigQueries.FBC_IS_CLOSED_QUERY,
        { feedback_cycle_id: feedbackCycleId },
    );

    return Boolean(isClosed);
};

const waitForFeedbackCycleToCloseOnBq = async (
    feedbackCycleId: string,
    maxRetry = 6,
    retryIntervalInMs = 30000, // wait 30s between each retry
): Promise<void> => {
    try {
        await backOff(
            async () => {
                if (!(await isFeedbackCycleClosedOnBQ(feedbackCycleId))) {
                    throw new FeedbackCycleNotClosedError();
                }
            },
            {
                startingDelay: retryIntervalInMs,
                numOfAttempts: maxRetry,
                timeMultiple: 1, // no delay multiply
                retry: (error, attemptNumber) => {
                    if (error instanceof FeedbackCycleNotClosedError) {
                        logger.info(
                            `Waiting for feedback cycle ${feedbackCycleId} to be ready. Retry ${attemptNumber} of ${maxRetry}`,
                        );
                        return true;
                    }
                    return false;
                },
            },
        );
    } catch (error) {
        throw new FailedToGetClosedFeedbackCycleError(error, {
            error,
            feedbackCycleId,
        });
    }
};

const updateFbcTableName = (
    query: string,
    companyId: number,
    feedbackCycleIdHash: string,
): string => {
    return query
        .replace(/{{company_id}}/g, companyId.toString())
        .replace(/{{feedback_cycle_id_hash}}/g, feedbackCycleIdHash);
};

const provisionFeedbackCycleDashboard = async (
    feedbackCycleId: string,
    companyId: number,
    userAccountId: number,
): Promise<void> => {
    await waitForFeedbackCycleToCloseOnBq(feedbackCycleId);

    const feedbackCycleIdHash = murmurhash.v3(feedbackCycleId).toString();

    await GcpBigQueryService.query(
        gcpConfig(),
        updateFbcTableName(
            BigQueries.CREATE_FBC_SETTING_TABLE,
            companyId,
            feedbackCycleIdHash,
        ),
        { feedback_cycle_id: feedbackCycleId },
    );

    await GcpBigQueryService.query(
        gcpConfig(),
        updateFbcTableName(
            BigQueries.CREATE_FBC_RESULT_TABLE,
            companyId,
            feedbackCycleIdHash,
        ),
        { feedback_cycle_id: feedbackCycleId },
    );

    const dataSource = await getDataSource();
    const feedbackCycleRepository = dataSource.getRepository(FeedbackCycle);

    const feedbackCycle = await feedbackCycleRepository.findOneOrFail({
        select: ['id', 'report_result_meta'],
        where: {
            id: feedbackCycleId,
        },
    });

    const reportResultMeta: FeedbackCycleReportResultMeta =
        feedbackCycle.report_result_meta ?? {};
    reportResultMeta.dashboard = {
        provisioned_at: dateTimeUtil.now(),
        feedback_cycle_id_hash: feedbackCycleIdHash,
    };

    await dataSource.getRepository(FeedbackCycle).update(
        {
            id: feedbackCycleId,
        },
        {
            report_result_meta: reportResultMeta,
            updated_by: userAccountId,
        },
    );
};

export const FeedbackCycleDashboardProvisionService = {
    provisionFeedbackCycleDashboard,

    isFeedbackCycleClosedOnBQ,
    waitForFeedbackCycleToCloseOnBq,
    updateFbcTableName,
};

export class FailedToGetClosedFeedbackCycleError extends BaseException {
    constructor(error: Error, errorDetails: Partial<ErrorDetails>) {
        super(
            error,
            {
                error_codes: ['failed_to_get_closed_feedback_cycle'],
                ...errorDetails,
            },
            'Failed to get closed feedback cycle',
        );
    }
}

export class FeedbackCycleNotClosedError extends Error {}
