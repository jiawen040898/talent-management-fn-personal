import { logger } from '@pulsifi/fn';
import axios from 'axios';

import { recommendApiConfig } from '../configs';
import {
    FeedbackCycleRevieweeRecommendationRecommendationDimension,
    RecommendationActionScope,
} from '../constants';
import {
    RecommendationActionRequestBody,
    RecommendationActionResponseData,
    RecommendationResourceResponse,
} from '../interface';

export class RecommendationService {
    private baseApiUrl = recommendApiConfig().apiUrl;

    async getActionWithSkillsRecommendation(
        competencyTitle: string,
        competencyQuestion: string,
        dimension: FeedbackCycleRevieweeRecommendationRecommendationDimension,
        withSkills: boolean = false,
    ): Promise<RecommendationActionResponseData> {
        const payload: RecommendationActionRequestBody = {
            competency_title: competencyTitle,
            competency_question: competencyQuestion,
            return_related: withSkills,
            return_detail: false, // False for now, till can handle performance
            dimension,
            scope: RecommendationActionScope.INDIVIDUAL,
        };

        try {
            const url = `${this.baseApiUrl}/action/recommend`;
            return await axios.post(url, payload).then((response) => {
                return response.data as RecommendationActionResponseData;
            });
        } catch (err) {
            logger.error('Fail to getActionRecommendation', { err });
            throw err;
        }
    }

    async getResourcesRecommendation(
        title: string,
    ): Promise<RecommendationResourceResponse> {
        try {
            const url = `${this.baseApiUrl}/resource/recommend`;
            return await axios
                .get(url, {
                    params: {
                        q: title,
                        limit: 20,
                    },
                })
                .then((response) => {
                    return response.data as RecommendationResourceResponse;
                });
        } catch (err) {
            logger.error('Fail to getResourcesRecommendation', { err });
            throw err;
        }
    }
}
