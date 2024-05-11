export const RECOMMENDATION_HIGH_THRESHOLD_PERCENTAGE = 70;

export enum RecommendationActionScope {
    INDIVIDUAL = 'individual',
    TEAM = 'team',
}

export enum FeedbackCycleRevieweeRecommendationResultStatus {
    NOT_STARTED = 'not_started',
    INVALID = 'invalid',
    IN_PROGRESS = 'in_progress',
    READY = 'ready',
}

export enum FeedbackCycleRevieweeRecommendationRecommendationDimension {
    DEVELOPMENT = 'development',
    STRENGTH = 'strength',
}
