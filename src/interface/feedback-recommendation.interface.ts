import {
    FeedbackCycleRevieweeRecommendationRecommendationDimension,
    FeedbackCycleRevieweeRecommendationResultStatus,
    RecommendationActionScope,
} from '../constants';

export interface RecommendationActionRequestBody {
    competency_title: string;
    competency_question: string;
    return_related: boolean;
    return_detail: boolean;
    dimension: FeedbackCycleRevieweeRecommendationRecommendationDimension;
    scope: RecommendationActionScope;
}

export interface RecommendationSkillRequestBody {
    title: string;
    scope: RecommendationActionScope;
}

export interface RecommendationResourcesRequestBody {
    title: string;
    scope: RecommendationActionScope;
}

export interface RecommendationAction {
    action: string;
    explanation: string;
}

export interface RecommendationSkill {
    skill_name: string;
    data: RecommendationAction[];
}

export interface RecommendationActionResponseData {
    data: RecommendationAction[];
    related_skills?: RecommendationSkill[];
}

export interface RecommendationResourceResponseData {
    title: string;
    subtitle: string;
    authors: string[];
    info_url: string;
    image_url: string;
}

export interface RecommendationResourceResponse {
    books: RecommendationResourceResponseData[];
    courses: RecommendationResourceResponseData[];
}

export interface FeedbackRecommendationsRequestEvent {
    Item: FeedbackRecommendationRequestData;
}

export interface FeedbackRecommendationRequestData {
    id: string;
    feedback_cycle_reviewee_id: string;
    question_title: string;
    question_description: string;
    recommendation_dimension: FeedbackCycleRevieweeRecommendationRecommendationDimension;
    score: number;
}

export interface FeedbackCycleRevieweeRecommendationResources {
    id: string; // Self generated for FE mapping purposes
    title: string;
    author: string[];
    image_url: string;
    redirect_url: string;
}

export interface FeedbackCycleRevieweeRecommendationActions {
    id: string; // Self generated for FE mapping purposes
    title: string;
    description: string;
}

export interface FeedbackCycleRevieweeRecommendationSkills {
    id: string;
    name: string;
    actions?: FeedbackCycleRevieweeRecommendationActions[];
    resource_courses?: FeedbackCycleRevieweeRecommendationResources[];
    resource_books?: FeedbackCycleRevieweeRecommendationResources[];
}

export interface FeedbackCycleRevieweeRecommendationQuestionMeta {
    competency: FeedbackCycleRevieweeRecommendationQuestionMetaData | null;
    question: FeedbackCycleRevieweeRecommendationQuestionMetaData | null;
}

export interface FeedbackCycleRevieweeRecommendationQuestionMetaData {
    id: number;
    name: string;
    description: string | null;
}

export interface FeedBackCycleRevieweeRecommendationResultMeta {
    status: FeedbackCycleRevieweeRecommendationResultStatus;
    question_count: number;
    initiated_at?: Date | null;
    generated_at?: Date | null;
}

export interface FeedbackRecommendationGenerationOutput {
    id: string;
    feedback_cycle_reviewee_id: string;
}

export interface FeedbackRecommendationsGenerationEndedRequestEvent {
    data: FeedbackRecommendationGenerationOutput[];
    feedback_cycle_reviewee_id: string;
}
