import { logger } from '@pulsifi/fn';
import { sum } from 'lodash';
import { In } from 'typeorm';

import {
    EmployeeScoreType,
    PersonalityCognitiveScoreDomainAlias,
} from '../constants';
import { getDataSource } from '../database';
import { AssessmentResult } from '../dtos';
import {
    CognitiveOutcomeDto,
    CognitivePartialScoreOutput,
    CognitiveScoreOutcomePayload,
} from '../interface';
import { employeeScoreMapper } from '../mappers';
import { EmployeeScore, Participant } from '../models';

const SCORE_PERCENTAGE_MULTIPLIER = 100;

export const CognitiveScoreService = {
    async getCognitiveScores(
        assessments: AssessmentResult[],
        participant: Participant,
        recipeId: string,
    ): Promise<CognitivePartialScoreOutput[]> {
        try {
            const cognitiveScores = assessments.map((assessment) => {
                const frameworkType = assessment.questionnaire_framework;

                switch (frameworkType) {
                    case EmployeeScoreType.REASONING_NUMERIC:
                        return this.processReasoningNumeric(assessment);
                    case EmployeeScoreType.REASONING_LOGIC:
                        return this.processReasoningLogical(assessment);
                    case EmployeeScoreType.REASONING_VERBAL:
                        return this.processReasoningVerbal(assessment);
                    default:
                        logger.error(
                            'No cognitive score type found from assessment questionnaire framework.',
                            {
                                data: {
                                    assessments,
                                    framework_type: frameworkType,
                                    participant_id: participant.id,
                                    recipe_id: recipeId,
                                },
                            },
                        );

                        throw new Error(
                            `No cognitive score type found for ${frameworkType} from assessment questionnaire framework.`,
                        );
                }
            });

            if (cognitiveScores.length === 0) {
                return [];
            }

            const reasoningAverage = await this.processReasoningAverage(
                cognitiveScores.map(
                    (score) => score.score_outcome.cognitive_result,
                ),
                participant.id,
            );

            return [...cognitiveScores, reasoningAverage];
        } catch (err) {
            logger.error('Failed to process cognitive score', {
                data: {
                    assessments,
                    participant_id: participant.id,
                    recipe_id: recipeId,
                },
                err,
            });
            throw err;
        }
    },

    transformReasoningOutput(
        domainScore?: number,
        domainAlias?: string,
    ): CognitiveOutcomeDto {
        return {
            domain_score: domainScore || 0,
            domain_alias: domainAlias,
            domain_percentile: null,
            ingredient_weightage: null,
        };
    },

    async processReasoningAverage(
        currentAssessmentScores: CognitiveOutcomeDto[],
        participantId: string,
    ): Promise<CognitivePartialScoreOutput> {
        const dataSource = await getDataSource();
        const reasoningScores = await dataSource
            .getRepository(EmployeeScore)
            .find({
                where: {
                    participant_id: participantId,
                    score_type: In([
                        EmployeeScoreType.REASONING_LOGICAL,
                        EmployeeScoreType.REASONING_NUMERIC,
                        EmployeeScoreType.REASONING_VERBAL,
                    ]),
                },
            });

        const domainAliasList = currentAssessmentScores.map((score) =>
            employeeScoreMapper.mapEmployeeCognitiveScoreType(
                score.domain_alias as PersonalityCognitiveScoreDomainAlias,
            ),
        );

        const filteredReasoningScores = reasoningScores.filter(
            (score) =>
                !domainAliasList.includes(
                    score.score_type as EmployeeScoreType,
                ),
        );

        const reasoningScoreOutcomeScores = filteredReasoningScores.map(
            (score) => {
                const scoreOutcome =
                    score.score_outcome as unknown as CognitiveScoreOutcomePayload;
                return scoreOutcome?.cognitive_result?.domain_score ?? 0;
            },
        );

        const scores = [
            ...reasoningScoreOutcomeScores,
            ...currentAssessmentScores.map((score) => score.domain_score),
        ];

        const reasoningAverageScore = sum(scores) / scores.length;

        const cognitiveResult = this.transformReasoningOutput(
            reasoningAverageScore,
            EmployeeScoreType.REASONING_AVG,
        );

        return {
            score_type: EmployeeScoreType.REASONING_AVG,
            score: cognitiveResult.domain_score * SCORE_PERCENTAGE_MULTIPLIER,
            score_outcome: {
                cognitive_result: cognitiveResult,
            },
            score_dimension: 0,
        };
    },

    processReasoningNumeric(
        assessment: AssessmentResult,
    ): CognitivePartialScoreOutput {
        const reasoningNumericRawScores = assessment?.result_raw?.scores?.find(
            (result) =>
                result.domain_alias ===
                PersonalityCognitiveScoreDomainAlias.NUMERIC,
        );

        const cognitiveResult = this.transformReasoningOutput(
            reasoningNumericRawScores?.domain_score,
            reasoningNumericRawScores?.domain_alias,
        );

        return {
            score_type: EmployeeScoreType.REASONING_NUMERIC,
            score: cognitiveResult.domain_score * SCORE_PERCENTAGE_MULTIPLIER,
            score_outcome: {
                cognitive_result: cognitiveResult,
            },
            score_dimension: 0,
        };
    },

    processReasoningLogical(
        assessment: AssessmentResult,
    ): CognitivePartialScoreOutput {
        const reasoningLogicalRawScores = assessment?.result_raw?.scores?.find(
            (result) =>
                result.domain_alias ===
                PersonalityCognitiveScoreDomainAlias.LOGICAL,
        );

        const cognitiveResult = this.transformReasoningOutput(
            reasoningLogicalRawScores?.domain_score,
            reasoningLogicalRawScores?.domain_alias,
        );

        return {
            score_type: EmployeeScoreType.REASONING_LOGICAL,
            score: cognitiveResult.domain_score * SCORE_PERCENTAGE_MULTIPLIER,
            score_outcome: {
                cognitive_result: cognitiveResult,
            },
            score_dimension: 0,
        };
    },

    processReasoningVerbal(
        assessment: AssessmentResult,
    ): CognitivePartialScoreOutput {
        const reasoningVerbalRawScores = assessment?.result_raw?.scores?.find(
            (result) =>
                result.domain_alias ===
                PersonalityCognitiveScoreDomainAlias.VERBAL,
        );

        const cognitiveResult = this.transformReasoningOutput(
            reasoningVerbalRawScores?.domain_score,
            reasoningVerbalRawScores?.domain_alias,
        );

        return {
            score_type: EmployeeScoreType.REASONING_VERBAL,
            score: cognitiveResult.domain_score * SCORE_PERCENTAGE_MULTIPLIER,
            score_outcome: {
                cognitive_result: cognitiveResult,
            },
            score_dimension: 0,
        };
    },
};
