import { EventModel, logger, snsService } from '@pulsifi/fn';
import { chain } from 'lodash';

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
    FeedbackCycleEmailTemplate,
    FeedbackCycleReviewee,
    FeedbackCycleReviewer,
    ReviewerDirection,
} from '../models';
import { companyUtil } from '../utils';

async function sendNominationSubmissionReminder(company: CompanyLookupDto) {
    const revieweeNominationReminders =
        await getAllRevieweeWithPendingNominationSubmissionForReminder(
            company.id,
            company.localDate,
        );
    const locale = companyUtil.getCompanyDefaultLocale(company);

    for (const revieweeNominationReminderItem of revieweeNominationReminders) {
        revieweeNominationReminderItem.company_name = company.name;
        const message: EventModel<FeedbackEvent> = {
            event_type: DomainEventType.FEEDBACK_NOMINATION_SUBMISSION_DUE,
            event_id: revieweeNominationReminderItem.reviewee_id,
            company_id: company.id,
            user_account_id:
                revieweeNominationReminderItem.reviewee_user_account_id,
            data: feedbackMapper.toNominationEvent(
                DomainEventType.FEEDBACK_NOMINATION_SUBMISSION_DUE,
                revieweeNominationReminderItem,
                feedbackMapper.toRecipient(
                    revieweeNominationReminderItem.reviewee_first_name,
                    revieweeNominationReminderItem.reviewee_last_name,
                    revieweeNominationReminderItem.reviewee_email,
                ),
                revieweeNominationReminderItem.company_name,
                locale,
            ),
        };
        logger.info(
            `Publish ${DomainEventType.EMPLOYEE_FEEDBACK_NOMINATION_REQUESTED}`,
            {
                data: message,
            },
        );
        await snsService.sendEventModel(message, AWSConfig.sns());
    }
}

async function sendManagerNominationApprovalReminder(
    company: CompanyLookupDto,
) {
    const managerReminders =
        await getAllRevieweeManagerWithPendingNominationApprovalForReminder(
            company.id,
            company.localDate,
        );

    const managerReminderPerFeedbackCycle = chain(managerReminders)
        .groupBy((i) => `${i.feedback_cycle_id}:${i.manager_user_account_id}`)
        .map((value, key) => {
            return {
                feedback_cycle_id: key,
                total_pending_nomination_approval: value.length,
                latest_manager_reminder_item: value[value.length - 1],
            };
        })
        .value();

    const locale = companyUtil.getCompanyDefaultLocale(company);

    for (const managerReminderGroupItem of managerReminderPerFeedbackCycle) {
        const managerReminderItem =
            managerReminderGroupItem.latest_manager_reminder_item;
        managerReminderItem.total_nomination =
            managerReminderGroupItem.total_pending_nomination_approval;

        managerReminderItem.company_name = company.name;
        const message: EventModel<FeedbackEvent> = {
            event_type:
                DomainEventType.FEEDBACK_MANAGER_NOMINATION_APPROVAL_DUE,
            event_id: managerReminderItem.manager_id,
            company_id: company.id,
            user_account_id: managerReminderItem.manager_user_account_id,
            data: feedbackMapper.toNominationEvent(
                DomainEventType.FEEDBACK_MANAGER_NOMINATION_APPROVAL_DUE,
                managerReminderItem,
                feedbackMapper.toRecipient(
                    managerReminderItem.manager_first_name,
                    managerReminderItem.manager_last_name,
                    managerReminderItem.manager_email,
                ),
                managerReminderItem.company_name,
                locale,
            ),
        };
        logger.info(
            `Publish ${DomainEventType.FEEDBACK_MANAGER_NOMINATION_APPROVAL_DUE}`,
            {
                data: message,
            },
        );
        await snsService.sendEventModel(message, AWSConfig.sns());
    }
}

async function sendFeedbackSubmissionReminder(company: CompanyLookupDto) {
    const feedbackSubmissionReminders =
        await getAllReviewerWithPendingFeedbackSubmissionForReminder(
            company.id,
            company.localDate,
        );

    const emailTemplates = await getFeedbackCycleEmailTemplates(company.id);
    const locale = companyUtil.getCompanyDefaultLocale(company);

    for (const feedbackSubmissionReminderItem of feedbackSubmissionReminders) {
        feedbackSubmissionReminderItem.company_name = company.name;
        const { eventType, emailTemplate } =
            getReviewerEventAndEmailTemplateByReviewerDirection(
                emailTemplates,
                feedbackSubmissionReminderItem.feedback_cycle_id,
                feedbackSubmissionReminderItem.reviewer_direction,
            );

        feedbackSubmissionReminderItem.email_template = emailTemplate;

        const message: EventModel<FeedbackEvent> = {
            event_type: eventType,
            event_id: feedbackSubmissionReminderItem.reviewer_id,
            company_id: company.id,
            user_account_id:
                feedbackSubmissionReminderItem.reviewer_user_account_id ?? 0,
            data: feedbackMapper.toResponseEvent(
                eventType,
                feedbackSubmissionReminderItem,
                feedbackMapper.toRecipient(
                    feedbackSubmissionReminderItem.reviewer_first_name,
                    feedbackSubmissionReminderItem.reviewer_last_name,
                    feedbackSubmissionReminderItem.reviewer_email,
                    feedbackSubmissionReminderItem.external_reviewer_name,
                    feedbackSubmissionReminderItem.external_reviewer_email,
                ),
                feedbackSubmissionReminderItem.company_name,
                locale,
            ),
        };

        logger.info(`Publish ${eventType}`, {
            data: message,
        });
        await snsService.sendEventModel(message, AWSConfig.sns());
    }
}

function getReviewerEventAndEmailTemplateByReviewerDirection(
    emailTemplates: FeedbackCycleEmailTemplate[],
    feedbackCycleId: string,
    reviewerDirection: string,
) {
    const eventType =
        reviewerDirection === ReviewerDirection.SELF
            ? DomainEventType.FEEDBACK_REVIEWEE_RESPONSE_SUBMISSION_DUE
            : DomainEventType.FEEDBACK_REVIEWER_RESPONSE_SUBMISSION_DUE;

    const emailCommunicationType =
        reviewerDirection === ReviewerDirection.SELF
            ? EmailCommunicationType.EMPLOYEE_FEEDBACK_REVIEWEE_RESPONSE_SUBMISSION_REMINDER
            : EmailCommunicationType.EMPLOYEE_FEEDBACK_REVIEWER_RESPONSE_SUBMISSION_REMINDER;

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
            feedbackCycle: {
                id: true,
                company_id: true,
            },
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

async function getAllRevieweeWithPendingNominationSubmissionForReminder(
    companyId: number,
    reminderDate: string,
): Promise<FeedbackNomination[]> {
    const dataSource = await getDataSource();
    const queryBuilder = new FeedbackCycleRevieweeQueryBuilder(
        dataSource.getRepository(FeedbackCycleReviewee),
    )
        .innerJoinEmployeeReviewee()
        .leftJoinEmployeeRevieweeOfManager()
        .innerJoinFeedbackCycle()
        .innerJoinFeedbackCycleNotification()
        .whereNominationSubmissionReminderAt(companyId, reminderDate)
        .selectForNominationSubmission()
        .build();

    return queryBuilder.getRawMany<FeedbackNomination>();
}

async function getAllRevieweeManagerWithPendingNominationApprovalForReminder(
    companyId: number,
    reminderDate: string,
): Promise<FeedbackNomination[]> {
    const dataSource = await getDataSource();
    const queryBuilder = new FeedbackCycleRevieweeQueryBuilder(
        dataSource.getRepository(FeedbackCycleReviewee),
    )
        .innerJoinEmployeeReviewee()
        .innerJoinEmployeeRevieweeOfManager()
        .innerJoinFeedbackCycle()
        .innerJoinFeedbackCycleNotification()
        .whereNominationApprovalReminderAt(companyId, reminderDate)
        .selectForNominationSubmission()
        .build();
    return queryBuilder.getRawMany<FeedbackNomination>();
}

async function getAllReviewerWithPendingFeedbackSubmissionForReminder(
    companyId: number,
    reminderDate: string,
): Promise<FeedbackResponse[]> {
    const dataSource = await getDataSource();
    const queryBuilder = new FeedbackCycleReviewerQueryBuilder(
        dataSource.getRepository(FeedbackCycleReviewer),
    )
        .leftJoinEmployeeReviewer()
        .innerJoinFeedbackCycleReviewee()
        .innerJoinEmployeeReviewee()
        .innerJoinFeedbackCycle()
        .innerJoinFeedbackCycleNotification()
        .whereFeedbackSubmissionReminderAt(companyId, reminderDate)
        .selectForFeedbackSubmission()
        .build();

    return queryBuilder.getRawMany<FeedbackResponse>();
}

export const feedbackCycleReminderService = {
    sendNominationSubmissionReminder,
    sendManagerNominationApprovalReminder,
    sendFeedbackSubmissionReminder,
};
