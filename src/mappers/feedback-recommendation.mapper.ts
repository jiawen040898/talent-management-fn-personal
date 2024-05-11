import { generatorUtil } from '@pulsifi/fn';

import {
    FeedbackCycleRevieweeRecommendationActions,
    FeedbackCycleRevieweeRecommendationResources,
    FeedbackCycleRevieweeRecommendationSkills,
    RecommendationAction,
    RecommendationResourceResponseData,
    RecommendationSkill,
} from '../interface';

export const feedbackRecommendationMapper = {
    toSkills(
        rawSkill: RecommendationSkill,
    ): FeedbackCycleRevieweeRecommendationSkills {
        return {
            id: generatorUtil.uuid(),
            name: rawSkill.skill_name,
            actions: [],
            resource_books: [],
            resource_courses: [],
        };
    },
    toActions(
        rawActions: RecommendationAction[],
    ): FeedbackCycleRevieweeRecommendationActions[] {
        return rawActions.map((rawAction) => ({
            id: generatorUtil.uuid(),
            title: rawAction.action,
            description: rawAction.explanation,
        }));
    },
    toResources(
        rawResources: RecommendationResourceResponseData[],
    ): FeedbackCycleRevieweeRecommendationResources[] {
        return rawResources.map((rawResource) => ({
            id: generatorUtil.uuid(),
            title: rawResource.title,
            author: rawResource?.authors ?? [],
            image_url: rawResource.image_url,
            redirect_url: rawResource.info_url,
        }));
    },
};
