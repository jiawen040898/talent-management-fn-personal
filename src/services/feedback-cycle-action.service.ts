import {
    booleanUtil,
    DedicatedUserAccountId,
    EventModel,
    generatorUtil,
    logger,
    snsService,
    stringUtil,
} from '@pulsifi/fn';
import { chain, chunk } from 'lodash';
import { In, Not } from 'typeorm';

import {
    FeedbackCycleRevieweeQueryBuilder,
    FeedbackCycleReviewerQueryBuilder,
} from '../builders';
import * as AWSConfig from '../configs';
import { DomainEventType } from '../constants';
import { getDataSource } from '../database';
import { CompanyLookupDto, FeedbackEvent } from '../dtos';
import { FeedbackNomination, FeedbackResponse } from '../interface';
import { feedbackMapper } from '../mappers';
import {
    EmailCommunicationType,
    FeedbackCycle,
    FeedbackCycleEmailTemplate,
    FeedbackCycleReviewee,
    FeedbackCycleReviewer,
    FeedbackCycleStatus,
    RevieweeApprovedSource,
    RevieweeStatus,
    ReviewerDirection,
    ReviewerSelectSource,
    ReviewerStatus,
} from '../models';
import { companyUtil, dateUtil } from '../utils';

async function startCycleWithReadyForFeedbackAction(company: CompanyLookupDto) {
    const reviewerReadyForFeedbacks = await getAllReviewerForFeedbackReady(
        company.id,
        company.localDate,
    );

    await markCycleStartedAndRevieweeReadyForFeedback(
        reviewerReadyForFeedbacks,
    );

    const emailTemplates = await getFeedbackCycleEmailTemplates(company.id);
    const locale = companyUtil.getCompanyDefaultLocale(company);

    for (const reviewerReadyFeedbackItem of reviewerReadyForFeedbacks) {
        reviewerReadyFeedbackItem.company_name = company.name;
        const { eventType, emailTemplate } =
            getReviewerEventAndEmailTemplateByReviewerDirection(
                emailTemplates,
                reviewerReadyFeedbackItem.feedback_cycle_id,
                reviewerReadyFeedbackItem.reviewer_direction,
            );

        reviewerReadyFeedbackItem.email_template = emailTemplate;
        const message: EventModel<FeedbackEvent> = {
            event_type: eventType,
            event_id: reviewerReadyFeedbackItem.reviewee_id,
            company_id: company.id,
            user_account_id: reviewerReadyFeedbackItem.reviewer_user_account_id,
            data: feedbackMapper.toResponseEvent(
                eventType,
                reviewerReadyFeedbackItem,
                feedbackMapper.toRecipient(
                    reviewerReadyFeedbackItem.reviewee_first_name,
                    reviewerReadyFeedbackItem.reviewee_last_name,
                    reviewerReadyFeedbackItem.reviewee_email,
                ),
                reviewerReadyFeedbackItem.company_name,
                locale,
            ),
        };
        logger.info(`Publish ${eventType}`, {
            data: message,
        });
        await snsService.sendEventModel(message, AWSConfig.sns());
    }
}

async function startCycleWithReadyForNominationAction(
    company: CompanyLookupDto,
) {
    const revieweeReadyForNominations = await getAllRevieweeForNominationReady(
        company.id,
        company.localDate,
    );

    await markCycleStartedAndRevieweeReadyForNominationAndFeedback(
        revieweeReadyForNominations,
    );
    const locale = companyUtil.getCompanyDefaultLocale(company);

    for (const revieweeReadyNominationItem of revieweeReadyForNominations) {
        //TODO check if select by manager, then notify manager instead
        revieweeReadyNominationItem.company_name = company.name;
        const message: EventModel<FeedbackEvent> = {
            event_type: DomainEventType.EMPLOYEE_FEEDBACK_NOMINATION_REQUESTED,
            event_id: revieweeReadyNominationItem.reviewee_id,
            company_id: company.id,
            user_account_id:
                revieweeReadyNominationItem.reviewee_user_account_id,
            data: feedbackMapper.toNominationEvent(
                DomainEventType.EMPLOYEE_FEEDBACK_NOMINATION_REQUESTED,
                revieweeReadyNominationItem,
                feedbackMapper.toRecipient(
                    revieweeReadyNominationItem.reviewee_first_name,
                    revieweeReadyNominationItem.reviewee_last_name,
                    revieweeReadyNominationItem.reviewee_email,
                ),
                revieweeReadyNominationItem.company_name,
                locale,
            ),
        };
        logger.info(
            `Publish ${DomainEventType.FEEDBACK_NOMINATION_SUBMISSION_DUE}`,
            {
                data: message,
            },
        );
        await snsService.sendEventModel(message, AWSConfig.sns());
    }

    const selfReviewerReadyFeedbacks =
        await getAllReviewerWithSelfPendingStatusForFeedbackReady(
            company.id,
            revieweeReadyForNominations.map((i) => i.reviewee_id),
        );

    await notifyReviewerFeedbackResponseReady(
        company,
        selfReviewerReadyFeedbacks,
    );
}

async function approveManagerNominationAction(company: CompanyLookupDto) {
    const yesterday = dateUtil.addDays(-1, company.localDate);
    const managerNominationsToBeApprove =
        await getAllRevieweeManagerWithPendingNominationApprovalForAutoApproved(
            company.id,
            yesterday,
        );

    const managerApproveNominationPerFeedbackCycle = chain(
        managerNominationsToBeApprove,
    )
        .groupBy((i) => `${i.feedback_cycle_id}:${i.manager_user_account_id}`)
        .map((value, key) => {
            return {
                feedback_cycle_id: key,
                total_nomination_approval: value.length,
                reviewee_nomination_items: value,
                latest_manager_nomination_item: value[value.length - 1],
            };
        })
        .value();

    for (const managerApproveNominationGroupItem of managerApproveNominationPerFeedbackCycle) {
        const managerApproveNominationItem =
            managerApproveNominationGroupItem.latest_manager_nomination_item;
        managerApproveNominationItem.total_nomination =
            managerApproveNominationGroupItem.total_nomination_approval;

        const revieweeIds =
            managerApproveNominationGroupItem.reviewee_nomination_items.map(
                (i) => i.reviewee_id,
            );

        const reviewerFeedbackResponseReady =
            await getAllReviewerWithPendingStatusForFeedbackReady(
                company.id,
                revieweeIds,
            );
        await markRevieweeAndReviewerAsFeedbackReadyFromAutoApproved(
            revieweeIds,
        );

        await notifyManagerAndRevieweeNominationAutoApproved(
            company,
            managerApproveNominationItem,
            managerApproveNominationGroupItem.reviewee_nomination_items,
        );

        await notifyReviewerFeedbackResponseReady(
            company,
            reviewerFeedbackResponseReady,
        );
    }
}

async function getAllRevieweeManagerWithPendingNominationApprovalForAutoApproved(
    companyId: number,
    yesterdayDeadline: string,
): Promise<FeedbackNomination[]> {
    const dataSource = await getDataSource();
    const queryBuilder = new FeedbackCycleRevieweeQueryBuilder(
        dataSource.getRepository(FeedbackCycleReviewee),
    )
        .innerJoinEmployeeReviewee()
        .innerJoinEmployeeRevieweeOfManager()
        .innerJoinFeedbackCycle()
        .whereNominationApprovalDeadlineAt(companyId, yesterdayDeadline)
        .selectForAutoNominationApprovalTimeline()
        .build();

    const result = await queryBuilder.getRawMany<FeedbackNomination>();
    //due to sqlite limitation in support boolean type in json column, we perform extra filter before return
    return result.filter(
        (i) =>
            booleanUtil.toBoolean(
                i.is_auto_approve_reviewer_selection_enabled,
            ) === true,
    );
}

async function getAllReviewerWithSelfPendingStatusForFeedbackReady(
    companyId: number,
    revieweeIds: string[],
): Promise<FeedbackResponse[]> {
    const dataSource = await getDataSource();
    const queryBuilder = new FeedbackCycleReviewerQueryBuilder(
        dataSource.getRepository(FeedbackCycleReviewer),
    )
        .leftJoinEmployeeReviewer()
        .innerJoinFeedbackCycleReviewee()
        .innerJoinEmployeeReviewee()
        .innerJoinFeedbackCycle()
        .whereStatusInReadyAndSelfManagerRevieweesIn(companyId, revieweeIds)
        .selectForFeedbackReady()
        .build();

    return queryBuilder.getRawMany<FeedbackResponse>();
}

async function getAllReviewerWithPendingStatusForFeedbackReady(
    companyId: number,
    revieweeIds: string[],
): Promise<FeedbackResponse[]> {
    const dataSource = await getDataSource();
    const queryBuilder = new FeedbackCycleReviewerQueryBuilder(
        dataSource.getRepository(FeedbackCycleReviewer),
    )
        .leftJoinEmployeeReviewer()
        .innerJoinFeedbackCycleReviewee()
        .innerJoinEmployeeReviewee()
        .innerJoinFeedbackCycle()
        .whereStatusInPendingAndRevieweesIn(companyId, revieweeIds)
        .selectForFeedbackReady()
        .build();

    return queryBuilder.getRawMany<FeedbackResponse>();
}

async function markRevieweeAndReviewerAsFeedbackReadyFromAutoApproved(
    revieweeIds: string[],
) {
    const dataSource = await getDataSource();
    await dataSource.transaction(async (manager) => {
        await manager.update(
            FeedbackCycleReviewee,
            {
                id: In(revieweeIds),
                status: RevieweeStatus.PENDING_NOMINATION_APPROVAL,
            },
            {
                status: RevieweeStatus.READY_FOR_FEEDBACK,
                reviewer_selection_approved_at: new Date(),
                reviewer_selection_approved_source:
                    RevieweeApprovedSource.SYSTEM,
                updated_by: DedicatedUserAccountId.SYSTEM,
            },
        );
        await manager.update(
            FeedbackCycleReviewer,
            {
                feedback_cycle_reviewee_id: In(revieweeIds),
                status: ReviewerStatus.PENDING,
            },
            {
                status: ReviewerStatus.READY,
                updated_by: DedicatedUserAccountId.SYSTEM,
            },
        );
    });
}

async function markCycleStartedAndRevieweeReadyForNominationAndFeedback(
    revieweeReadyForNominations: FeedbackNomination[],
) {
    const startingFeedbackCycleIds = [
        ...new Set(revieweeReadyForNominations.map((i) => i.feedback_cycle_id)),
    ];
    const readyNominationRevieweeIds = revieweeReadyForNominations.map(
        (i) => i.reviewee_id,
    );

    if (startingFeedbackCycleIds.length === 0) {
        return;
    }

    const dataSource = await getDataSource();

    await dataSource.transaction(async (manager) => {
        await manager.update(
            FeedbackCycle,
            {
                id: In(startingFeedbackCycleIds),
            },
            {
                status: FeedbackCycleStatus.ACTIVE,
                updated_by: DedicatedUserAccountId.SYSTEM,
            },
        );

        await manager.update(
            FeedbackCycleReviewee,
            {
                id: In(readyNominationRevieweeIds),
                status: RevieweeStatus.DRAFT,
            },
            {
                status: RevieweeStatus.PENDING_NOMINATION,
                reviewer_selection_approved_at: new Date(),
                reviewer_selection_approved_source:
                    RevieweeApprovedSource.SYSTEM,
                updated_by: DedicatedUserAccountId.SYSTEM,
            },
        );
        await manager.update(
            FeedbackCycleReviewer,
            {
                feedback_cycle_reviewee_id: In(readyNominationRevieweeIds),
                status: ReviewerStatus.DRAFT,
                reviewer_direction: In([
                    ReviewerDirection.PEER,
                    ReviewerDirection.DIRECT_REPORT,
                ]),
            },
            {
                status: ReviewerStatus.PENDING,
                updated_by: DedicatedUserAccountId.SYSTEM,
            },
        );
        await manager.update(
            FeedbackCycleReviewer,
            {
                feedback_cycle_reviewee_id: In(readyNominationRevieweeIds),
                status: ReviewerStatus.DRAFT,
                reviewer_direction: In([
                    ReviewerDirection.SELF,
                    ReviewerDirection.MANAGER,
                ]),
            },
            {
                status: ReviewerStatus.READY,
                updated_by: DedicatedUserAccountId.SYSTEM,
            },
        );
    });
}

async function markCycleStartedAndRevieweeReadyForFeedback(
    reviewerReadyForFeedbacks: FeedbackResponse[],
) {
    const startingFeedbackCycleIds = [
        ...new Set(reviewerReadyForFeedbacks.map((i) => i.feedback_cycle_id)),
    ];
    const readyFeedbackRevieweeIds = [
        ...new Set(reviewerReadyForFeedbacks.map((i) => i.reviewee_id)),
    ];

    if (startingFeedbackCycleIds.length === 0) {
        return;
    }

    const dataSource = await getDataSource();

    await dataSource.transaction(async (manager) => {
        await manager.update(
            FeedbackCycle,
            {
                id: In(startingFeedbackCycleIds),
            },
            {
                status: FeedbackCycleStatus.ACTIVE,
                updated_by: DedicatedUserAccountId.SYSTEM,
            },
        );

        await manager.update(
            FeedbackCycleReviewee,
            {
                id: In(readyFeedbackRevieweeIds),
                status: RevieweeStatus.DRAFT,
            },
            {
                status: RevieweeStatus.READY_FOR_FEEDBACK,
                updated_by: DedicatedUserAccountId.SYSTEM,
            },
        );
        await manager.update(
            FeedbackCycleReviewer,
            {
                feedback_cycle_reviewee_id: In(readyFeedbackRevieweeIds),
                status: ReviewerStatus.DRAFT,
            },
            {
                status: ReviewerStatus.READY,
                updated_by: DedicatedUserAccountId.SYSTEM,
            },
        );
    });
}

async function notifyManagerAndRevieweeNominationAutoApproved(
    company: CompanyLookupDto,
    managerApproveNomination: FeedbackNomination,
    revieweeApproveNominations: FeedbackNomination[],
) {
    const locale = companyUtil.getCompanyDefaultLocale(company);

    managerApproveNomination.company_name = company.name;
    const autoApproveManagerNominationMessage: EventModel<FeedbackEvent> = {
        event_type: DomainEventType.FEEDBACK_MANAGER_NOMINATION_AUTO_APPROVED,
        event_id: managerApproveNomination.manager_id,
        company_id: company.id,
        user_account_id: managerApproveNomination.manager_user_account_id,
        data: feedbackMapper.toNominationEvent(
            DomainEventType.FEEDBACK_MANAGER_NOMINATION_AUTO_APPROVED,
            managerApproveNomination,
            feedbackMapper.toRecipient(
                managerApproveNomination.manager_first_name,
                managerApproveNomination.manager_last_name,
                managerApproveNomination.manager_email,
            ),
            managerApproveNomination.company_name,
            locale,
        ),
    };

    logger.info(
        `Publish ${DomainEventType.FEEDBACK_MANAGER_NOMINATION_AUTO_APPROVED}`,
        {
            data: autoApproveManagerNominationMessage,
        },
    );

    await snsService.sendEventModel(
        autoApproveManagerNominationMessage,
        AWSConfig.sns(),
    );

    const revieweeApproveNominationEntires = [];

    for (const revieweeApproveNominationItem of revieweeApproveNominations) {
        revieweeApproveNominationItem.company_name = company.name;
        const revieweeNominationApproveEventType =
            await getNominationApprovedEventByReviewee(
                revieweeApproveNominationItem.reviewee_id,
            );

        const revieweeApproveNominationMessage: EventModel<FeedbackEvent> = {
            event_type: revieweeNominationApproveEventType,
            event_id: revieweeApproveNominationItem.reviewee_id,
            company_id: company.id,
            user_account_id:
                revieweeApproveNominationItem.reviewee_user_account_id,
            data: feedbackMapper.toNominationEvent(
                revieweeNominationApproveEventType,
                revieweeApproveNominationItem,
                feedbackMapper.toRecipient(
                    revieweeApproveNominationItem.reviewee_first_name,
                    revieweeApproveNominationItem.reviewee_last_name,
                    revieweeApproveNominationItem.reviewee_email,
                ),
                stringUtil.getUserDisplayName(
                    revieweeApproveNominationItem.manager_first_name,
                    revieweeApproveNominationItem.manager_last_name,
                ),
                locale,
            ),
        };
        revieweeApproveNominationEntires.push(revieweeApproveNominationMessage);
    }

    logger.info(`Publish ${DomainEventType.FEEDBACK_NOMINATION_APPROVED}`, {
        data: revieweeApproveNominationEntires,
    });

    await publishEventInChunk(revieweeApproveNominationEntires);
}

async function notifyReviewerFeedbackResponseReady(
    company: CompanyLookupDto,
    reviewerFeedbackResponseReady: FeedbackResponse[],
) {
    const feedbackResponseEntires = [];

    const emailTemplates = await getFeedbackCycleEmailTemplates(company.id);
    const locale = companyUtil.getCompanyDefaultLocale(company);

    for (const reviewerFeedbackResponseReadyItem of reviewerFeedbackResponseReady) {
        reviewerFeedbackResponseReadyItem.company_name = company.name;
        const { eventType, emailTemplate } =
            getReviewerEventAndEmailTemplateByReviewerDirection(
                emailTemplates,
                reviewerFeedbackResponseReadyItem.feedback_cycle_id,
                reviewerFeedbackResponseReadyItem.reviewer_direction,
            );

        reviewerFeedbackResponseReadyItem.email_template = emailTemplate;

        const message: EventModel<FeedbackEvent> = {
            event_type: eventType,
            event_id: reviewerFeedbackResponseReadyItem.reviewer_id,
            company_id: company.id,
            user_account_id:
                reviewerFeedbackResponseReadyItem.reviewer_user_account_id,
            data: feedbackMapper.toResponseEvent(
                eventType,
                reviewerFeedbackResponseReadyItem,
                feedbackMapper.toRecipient(
                    reviewerFeedbackResponseReadyItem.reviewer_first_name,
                    reviewerFeedbackResponseReadyItem.reviewer_last_name,
                    reviewerFeedbackResponseReadyItem.reviewer_email,
                    reviewerFeedbackResponseReadyItem.external_reviewer_name,
                    reviewerFeedbackResponseReadyItem.external_reviewer_email,
                ),
                reviewerFeedbackResponseReadyItem.company_name,
                locale,
            ),
        };
        feedbackResponseEntires.push(message);
    }

    logger.info(
        `Publish ${DomainEventType.FEEDBACK_REVIEWER_RESPONSE_REQUESTED}`,
        {
            data: feedbackResponseEntires,
        },
    );

    await publishEventInChunk(feedbackResponseEntires);
}

async function publishEventInChunk(events: SafeAny[]) {
    const eventsByChunk = chunk(events, 10);

    for (const chunkItem of eventsByChunk) {
        await snsService.sendBatchEventModels(
            chunkItem,
            AWSConfig.sns(),
            generatorUtil.uuid(),
        );
    }
}

async function getNominationApprovedEventByReviewee(revieweeId: string) {
    const dataSource = await getDataSource();
    const hasReviewerAmended =
        (await dataSource.getRepository(FeedbackCycleReviewer).count({
            where: {
                feedback_cycle_reviewee_id: revieweeId,
                reviewer_direction: In([
                    ReviewerDirection.PEER,
                    ReviewerDirection.DIRECT_REPORT,
                ]),
                status: In([ReviewerStatus.PENDING, ReviewerStatus.READY]),
                select_source: Not(ReviewerSelectSource.EMPLOYEE),
                is_deleted: false,
            },
        })) > 0;

    return hasReviewerAmended
        ? DomainEventType.FEEDBACK_NOMINATION_AMENDMENT_APPROVED
        : DomainEventType.FEEDBACK_NOMINATION_APPROVED;
}

function getReviewerEventAndEmailTemplateByReviewerDirection(
    emailTemplates: FeedbackCycleEmailTemplate[],
    feedbackCycleId: string,
    reviewerDirection: string,
) {
    const eventType =
        reviewerDirection === ReviewerDirection.SELF
            ? DomainEventType.FEEDBACK_REVIEWEE_RESPONSE_REQUESTED
            : DomainEventType.FEEDBACK_REVIEWER_RESPONSE_REQUESTED;

    const emailCommunicationType =
        reviewerDirection === ReviewerDirection.SELF
            ? EmailCommunicationType.EMPLOYEE_FEEDBACK_REVIEWEE_RESPONSE_REQUESTED
            : EmailCommunicationType.EMPLOYEE_FEEDBACK_REVIEWER_RESPONSE_REQUESTED;

    const emailTemplate = emailTemplates.find(
        (i) =>
            i.feedback_cycle_id === feedbackCycleId &&
            i.email_communication_type === emailCommunicationType,
    );

    return { eventType, emailTemplate };
}

async function getFeedbackCycleEmailTemplates(
    companyId: number,
): Promise<FeedbackCycleEmailTemplate[]> {
    const dataSource = await getDataSource();
    return dataSource.getRepository(FeedbackCycleEmailTemplate).find({
        select: {
            subject: true,
            body_in_html: true,
            email_communication_type: true,
            feedback_cycle_id: true,
        },
        where: {
            feedbackCycle: {
                company_id: companyId,
            },
        },
        relations: {
            feedbackCycle: true,
        },
    });
}

async function getAllRevieweeForNominationReady(
    companyId: number,
    startDate: string,
): Promise<FeedbackNomination[]> {
    const dataSource = await getDataSource();
    const queryBuilder = new FeedbackCycleRevieweeQueryBuilder(
        dataSource.getRepository(FeedbackCycleReviewee),
    )
        .innerJoinEmployeeReviewee()
        .leftJoinEmployeeRevieweeOfManager()
        .innerJoinFeedbackCycle()
        .whereDraftCycleWithEmployeeAndManagerSelectionAt(companyId, startDate)
        .selectForNominationSubmission()
        .build();

    return queryBuilder.getRawMany<FeedbackNomination>();
}

async function getAllReviewerForFeedbackReady(
    companyId: number,
    startDate: string,
): Promise<FeedbackResponse[]> {
    const dataSource = await getDataSource();
    const queryBuilder = new FeedbackCycleReviewerQueryBuilder(
        dataSource.getRepository(FeedbackCycleReviewer),
    )
        .leftJoinEmployeeReviewer()
        .innerJoinFeedbackCycleReviewee()
        .innerJoinEmployeeReviewee()
        .innerJoinFeedbackCycle()
        .whereDraftCycleWithAdminSelectionAt(companyId, startDate)
        .selectForFeedbackReady()
        .build();

    return queryBuilder.getRawMany<FeedbackResponse>();
}

export const feedbackCycleActionService = {
    startCycleWithReadyForFeedbackAction,
    startCycleWithReadyForNominationAction,
    approveManagerNominationAction,
};
