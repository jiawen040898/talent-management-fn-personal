import {
    dateTimeUtil,
    EventModel,
    snsService,
    sqsRecordUtil,
} from '@pulsifi/fn';
import { SQSEvent } from 'aws-lambda';
import { In } from 'typeorm';

import { FeedbackCycleRevieweeQueryBuilder } from '../builders';
import * as AWSConfig from '../configs';
import {
    DomainEventType,
    FeedbackCycleRevieweeRecommendationResultStatus,
    RECOMMENDATION_HIGH_THRESHOLD_PERCENTAGE,
} from '../constants';
import { getDataSource } from '../database';
import { BasicFeedbackEvent } from '../dtos';
import {
    FeedbackRecommendation,
    FeedbackRecommendationGenerationOutput,
    FeedbackRecommendationRequestData,
    FeedbackRecommendationsGenerationEndedRequestEvent,
} from '../interface';
import { feedbackMapper, feedbackRecommendationMapper } from '../mappers';
import { FeedbackCycle, FeedbackCycleReviewee } from '../models';
import { FeedbackCycleRevieweeRecommendation } from '../models/feedback-cycle-reviewee-recommendation.entity';
import { CompanyService } from './company.service';
import { RecommendationService } from './recommendation.service';

async function handleRecommendationProcessRequest(event: SQSEvent) {
    const messages = [];

    for (const record of event.Records) {
        const message: EventModel<JSON[]> =
            sqsRecordUtil.parseBodyMessage(record);

        messages.push(...message.data);
    }

    return messages;
}

async function handleRecommendationGenerationRequest(
    data: FeedbackRecommendationRequestData,
) {
    const dataSource = await getDataSource();
    const recommendationService = new RecommendationService();
    const reviewee = await dataSource
        .getRepository(FeedbackCycleReviewee)
        .findOneOrFail({
            where: { id: data.feedback_cycle_reviewee_id },
        });

    const feedbackCycle = await dataSource
        .getRepository(FeedbackCycle)
        .findOneOrFail({
            where: { id: reviewee.feedback_cycle_id },
        });

    const scoreInPercentage =
        (100 * data.score) /
        (feedbackCycle.questionnaire_rating_scale_setting?.max_scale ?? 10);

    // Generate actions+skills(optional) (25-30sec)
    const [actions, competencyResources] = await Promise.all([
        recommendationService.getActionWithSkillsRecommendation(
            data.question_title,
            data.question_description,
            data.recommendation_dimension,
            scoreInPercentage > RECOMMENDATION_HIGH_THRESHOLD_PERCENTAGE,
        ),
        recommendationService.getResourcesRecommendation(data.question_title),
    ]);

    const skills =
        actions?.related_skills?.map((rawSkill) => {
            return feedbackRecommendationMapper.toSkills(rawSkill);
        }) ?? [];

    await dataSource.transaction(async (manager) => {
        await manager.update(
            FeedbackCycleReviewee,
            {
                id: data.feedback_cycle_reviewee_id,
            },
            {
                recommendation_result_meta: {
                    ...reviewee.recommendation_result_meta,
                    status: FeedbackCycleRevieweeRecommendationResultStatus.IN_PROGRESS,
                },
            },
        );

        await manager.update(
            FeedbackCycleRevieweeRecommendation,
            {
                id: data.id,
                feedback_cycle_reviewee_id: data.feedback_cycle_reviewee_id,
            },
            {
                action: actions?.data?.length
                    ? feedbackRecommendationMapper.toActions(actions.data)
                    : null,
                skill: skills.length ? skills : null,
                resource_book: competencyResources?.books?.length
                    ? feedbackRecommendationMapper.toResources(
                          competencyResources.books,
                      )
                    : null,
                resource_course: competencyResources?.courses?.length
                    ? feedbackRecommendationMapper.toResources(
                          competencyResources.courses,
                      )
                    : null,
            },
        );
    });

    return {
        id: data.id,
        feedback_cycle_reviewee_id: data.feedback_cycle_reviewee_id,
    } as FeedbackRecommendationGenerationOutput;
}

async function handleRecommendationEndedRequest(
    event: FeedbackRecommendationsGenerationEndedRequestEvent,
) {
    const recommendationIds = event.data.map((item) => item.id);

    // Get Database Records
    const dataSource = await getDataSource();

    const currentRecommendations = await dataSource
        .getRepository(FeedbackCycleRevieweeRecommendation)
        .find({ where: { id: In(recommendationIds), is_deleted: false } });

    const isReadyRecommendations = currentRecommendations.every(
        (recommendation) => {
            return (
                recommendation.action &&
                recommendationIds.includes(recommendation.id)
            );
        },
    );

    const recommendationStatus = isReadyRecommendations
        ? FeedbackCycleRevieweeRecommendationResultStatus.READY
        : FeedbackCycleRevieweeRecommendationResultStatus.INVALID;

    const reviewee = await dataSource
        .getRepository(FeedbackCycleReviewee)
        .findOneOrFail({
            where: { id: event.feedback_cycle_reviewee_id },
        });

    const updateMetaPayload = {
        ...reviewee.recommendation_result_meta,
        generated_at:
            recommendationStatus ==
            FeedbackCycleRevieweeRecommendationResultStatus.READY
                ? dateTimeUtil.now()
                : null,
        status: recommendationStatus,
    };

    await dataSource.getRepository(FeedbackCycleReviewee).update(
        {
            id: event.feedback_cycle_reviewee_id,
        },
        {
            recommendation_result_meta: updateMetaPayload,
        },
    );

    await notifyRevieweeFeedbackRecommendationReady(event);
}

async function notifyRevieweeFeedbackRecommendationReady(
    event: FeedbackRecommendationsGenerationEndedRequestEvent,
) {
    const revieweeRawData = await getRevieweeForEventData(
        event.feedback_cycle_reviewee_id,
    );

    const companyService = new CompanyService();
    const companyData = await companyService.getCompanyById(
        revieweeRawData!.company_id!,
    );

    const message: EventModel<BasicFeedbackEvent> = {
        event_type:
            DomainEventType.FEEDBACK_REVIEWEE_FEEDBACK_RECOMMENDATION_COMPLETED,
        event_id: revieweeRawData!.reviewee_id,
        company_id: revieweeRawData!.company_id!,
        user_account_id: revieweeRawData!.reviewee_user_account_id,
        data: feedbackMapper.toRecommendationEvent(
            DomainEventType.FEEDBACK_REVIEWEE_FEEDBACK_RECOMMENDATION_COMPLETED,
            { ...revieweeRawData!, company_name: companyData!.name },
            companyData!.name,
        ),
    };

    await snsService.sendEventModel(message, AWSConfig.sns());
}

async function getRevieweeForEventData(
    revieweeId: string,
): Promise<FeedbackRecommendation | undefined> {
    const dataSource = await getDataSource();
    const queryBuilder = new FeedbackCycleRevieweeQueryBuilder(
        dataSource.getRepository(FeedbackCycleReviewee),
    )
        .innerJoinEmployeeReviewee()
        .leftJoinEmployeeRevieweeOfManager()
        .innerJoinFeedbackCycle()
        .whereIdIsIn(revieweeId)
        .selectForRecommendation()
        .build();

    return queryBuilder.getRawOne<FeedbackRecommendation>();
}

export const feedbackCycleRevieweeRecommendationService = {
    handleRecommendationProcessRequest,
    handleRecommendationGenerationRequest,
    handleRecommendationEndedRequest,
};
