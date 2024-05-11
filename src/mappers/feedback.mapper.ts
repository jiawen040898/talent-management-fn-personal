import { dateTimeUtil, stringUtil } from '@pulsifi/fn';

import { DomainEventType } from '../constants';
import {
    BasicFeedbackEvent,
    EmailRecipient,
    FeedbackCycle,
    FeedbackEvent,
} from '../dtos';
import {
    FeedbackNomination,
    FeedbackRecommendation,
    FeedbackResponse,
} from '../interface';
import { FeedbackCycleReviewerDirection } from '../models';
import { urlGenerator } from '../utils';

export const feedbackMapper = {
    toResponseEvent(
        eventType: DomainEventType,
        value: FeedbackResponse,
        emailRecipient: EmailRecipient,
        emailSenderName: string,
        locale: string,
    ) {
        return <FeedbackEvent>{
            company: {
                name: value.company_name,
            },
            cycle: this.toCycle(value, locale),
            receiver: this.toReceiver(value),
            provider: this.toProvider(value),
            email_template: {
                subject: value.email_template?.subject,
                body_in_html: value.email_template?.body_in_html,
            },
            call_to_action: {
                url: urlGenerator.toEmployeeAppUrl(eventType, value),
            },
            email_recipient: emailRecipient,
            email_sender: {
                name: emailSenderName,
            },
        };
    },
    toNominationEvent(
        eventType: DomainEventType,
        value: FeedbackNomination,
        emailRecipient: EmailRecipient,
        emailSenderName: string,
        locale: string,
    ) {
        return <FeedbackEvent>{
            company: {
                name: value.company_name,
            },
            cycle: this.toCycle(value, locale),
            receiver: this.toReceiver(value),
            manager: this.toManager(value),
            total_nomination: value.total_nomination | 0,
            call_to_action: {
                url: urlGenerator.toEmployeeAppUrl(eventType, value),
            },
            email_recipient: emailRecipient,
            email_sender: {
                name: emailSenderName,
            },
        };
    },
    toRecommendationEvent(
        eventType: DomainEventType,
        value: FeedbackRecommendation,
        emailSenderName: string,
    ) {
        return <BasicFeedbackEvent>{
            company: {
                name: value.company_name,
            },
            receiver: {
                id: value.reviewee_id,
                employee_id: value.reviewee_employee_id,
                user_account_id: value.reviewee_user_account_id,
                first_name: value.reviewee_first_name,
                last_name: value.reviewee_last_name,
                email: value.reviewee_email,
                full_name: stringUtil.getUserDisplayName(
                    value.reviewee_first_name,
                    value.reviewee_last_name,
                ),
            },
            call_to_action: {
                url: urlGenerator.toEmployeeAppUrl(eventType, value),
            },
            email_sender: {
                name: emailSenderName,
            },
        };
    },
    toRecipient(
        firstName: string,
        lastName: string,
        email: string,
        externalName?: string | null,
        externalEmail?: string | null,
    ) {
        if (externalEmail) {
            return <EmailRecipient>{
                name: externalName,
                email: externalEmail,
            };
        }
        return <EmailRecipient>{
            name: stringUtil.getUserDisplayName(firstName, lastName),
            email,
        };
    },
    toCycle(
        value: FeedbackResponse | FeedbackNomination,
        locale: string,
    ): FeedbackCycle {
        return {
            id: value.feedback_cycle_id,
            name: value.feedback_cycle_name,
            start_date: dateTimeUtil.formatByLocale(
                value.feedback_cycle_start_date,
                locale,
            ),
            close_date: dateTimeUtil.formatByLocale(
                value.feedback_cycle_close_date,
                locale,
            ),
            nomination_submission_deadline: dateTimeUtil.formatByLocale(
                value.nomination_submission_deadline,
                locale,
            ),
            nomination_approval_deadline: dateTimeUtil.formatByLocale(
                value.nomination_approval_deadline,
                locale,
            ),
            feedback_submission_deadline: dateTimeUtil.formatByLocale(
                value.feedback_submission_deadline,
                locale,
            ),
        };
    },
    toReceiver(value: FeedbackResponse | FeedbackNomination) {
        return {
            id: value.reviewee_id,
            employee_id: value.reviewee_employee_id,
            user_account_id: value.reviewee_user_account_id,
            first_name: value.reviewee_first_name,
            last_name: value.reviewee_last_name,
            email: value.reviewee_email,
            full_name: stringUtil.getUserDisplayName(
                value.reviewee_first_name,
                value.reviewee_last_name,
            ),
        };
    },
    toProvider(value: FeedbackResponse) {
        const isExternal =
            value.reviewer_direction ===
            FeedbackCycleReviewerDirection.EXTERNAL;

        if (isExternal) {
            return {
                id: value.reviewer_id,
                employee_id: value.reviewer_employee_id,
                user_account_id: 0,
                first_name: value.external_reviewer_name,
                last_name: value.external_reviewer_name,
                email: value.external_reviewer_email,
                full_name: value.external_reviewer_name,
            };
        }

        return {
            id: value.reviewer_id,
            employee_id: value.reviewer_employee_id,
            user_account_id: value.reviewer_user_account_id,
            first_name: value.reviewer_first_name,
            last_name: value.reviewer_last_name,
            email: value.reviewer_email,
            full_name: stringUtil.getUserDisplayName(
                value.reviewer_first_name,
                value.reviewer_last_name,
            ),
        };
    },
    toManager(value: FeedbackNomination) {
        return {
            employee_id: value.manager_id,
            user_account_id: value.manager_user_account_id,
            first_name: value.manager_first_name,
            last_name: value.manager_last_name,
            email: value.manager_email,
            full_name: stringUtil.getUserDisplayName(
                value.manager_first_name,
                value.manager_last_name,
            ),
        };
    },
};
