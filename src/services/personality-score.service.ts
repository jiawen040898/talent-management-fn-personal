import {
    computationService,
    DomainOutcome,
    IngredientGroup,
    logger,
} from '@pulsifi/fn';
import { map } from 'lodash';

import { EmployeeScoreType, PersonalityOutcomeDomainAlias } from '../constants';
import { AssessmentResult, FitScoreRecipeDto, ResultRaw } from '../dtos';
import {
    PersonalityDomainOutcomeDto,
    PersonalityPartialScoreOutput,
} from '../interface';
import { Participant } from '../models';
import { numberUtil } from '../utils';

const SCORE_MULTIPLIER = 10;

export const PersonalityScoreService = {
    transformDomainOutcome(
        domainOutcome: DomainOutcome,
    ): PersonalityDomainOutcomeDto {
        return {
            ...domainOutcome,
            domain_weightage: domainOutcome.domain_weightage ?? null,
            traits: [],
        };
    },

    processWorkStyle(
        fitScoreRecipe: FitScoreRecipeDto | null,
        resultRaw?: ResultRaw | null,
    ): PersonalityPartialScoreOutput {
        const transformedWorkStyle =
            computationService.transformPersonalityToWorkStyle(
                resultRaw?.scores ?? [],
            );

        if (!fitScoreRecipe) {
            return {
                score_type: EmployeeScoreType.WORK_STYLE,
                score: null,
                score_outcome: {
                    personality_result: transformedWorkStyle.map(
                        this.transformDomainOutcome,
                    ),
                },
                score_dimension: 0,
            };
        }

        const workStyleScoreAndDomainOutcome =
            computationService.computeIngredientScore(
                transformedWorkStyle,
                fitScoreRecipe.recipe,
                IngredientGroup.WORK_STYLE,
            );

        return {
            score_type: EmployeeScoreType.WORK_STYLE,
            score: workStyleScoreAndDomainOutcome.score * SCORE_MULTIPLIER,
            score_outcome: {
                personality_result:
                    workStyleScoreAndDomainOutcome.domainScores.map(
                        this.transformDomainOutcome,
                    ),
            },
            score_dimension: 0,
        };
    },

    processWorkValue(
        fitScoreRecipe: FitScoreRecipeDto | null,
        resultRaw?: ResultRaw | null,
    ): PersonalityPartialScoreOutput {
        const transformedWorkValue =
            computationService.transformOrgValueToWorkValue(
                resultRaw?.scores ?? [],
            );

        if (!fitScoreRecipe) {
            return {
                score_type: EmployeeScoreType.WORK_VALUE,
                score: null,
                score_outcome: {
                    personality_result: transformedWorkValue.map(
                        this.transformDomainOutcome,
                    ),
                },
                score_dimension: 0,
            };
        }

        const workValueScoreAndDomainOutcome =
            computationService.computeIngredientScore(
                transformedWorkValue,
                fitScoreRecipe.recipe,
                IngredientGroup.WORK_VALUE,
            );

        return {
            score_type: EmployeeScoreType.WORK_VALUE,
            score: workValueScoreAndDomainOutcome.score * SCORE_MULTIPLIER,
            score_outcome: {
                personality_result:
                    workValueScoreAndDomainOutcome.domainScores.map(
                        this.transformDomainOutcome,
                    ),
            },
            score_dimension: 0,
        };
    },

    processWorkInterest(
        fitScoreRecipe: FitScoreRecipeDto | null,
        resultRaw?: ResultRaw | null,
    ): PersonalityPartialScoreOutput {
        const transformedWorkInterest =
            computationService.transformWorkInterestScores(
                resultRaw?.scores ?? [],
            );

        const hasInterestRiasecInIngredientAlias = fitScoreRecipe?.recipe.some(
            (recipe) =>
                recipe.ingredient_alias ===
                PersonalityOutcomeDomainAlias.INTEREST_RIASEC,
        );

        if (!fitScoreRecipe || !hasInterestRiasecInIngredientAlias) {
            return {
                score_type: EmployeeScoreType.WORK_INTEREST,
                score: null,
                score_outcome: {
                    personality_result: map(
                        transformedWorkInterest,
                        (score, alias) => ({
                            domain_alias: alias,
                            domain_score: score,
                        }),
                    ),
                },
                score_dimension: 0,
            };
        }

        const jobRiasecCode =
            fitScoreRecipe.recipe
                .find(
                    (recipe) =>
                        recipe.ingredient_alias ===
                        PersonalityOutcomeDomainAlias.INTEREST_RIASEC,
                )
                ?.ingredient_attribute?.split(',') || [];

        const workInterestScore = computationService.computeWorkInterestScore(
            jobRiasecCode,
            transformedWorkInterest,
        );

        const workInterestDomainOutcome = map(
            transformedWorkInterest,
            (score, alias) => ({
                domain_alias: alias,
                domain_score: score,
            }),
        );

        const employeeRiasecCode =
            computationService.transformDomainScoresToPersonRiasecCode(
                resultRaw?.scores ?? [],
            );

        return {
            score_type: EmployeeScoreType.WORK_INTEREST,
            score: numberUtil.parseDecimal(
                workInterestScore * SCORE_MULTIPLIER,
            ),
            score_outcome: {
                personality_result: workInterestDomainOutcome,
                job_codes: jobRiasecCode,
                person_codes: employeeRiasecCode,
            },
            score_dimension: 0,
        };
    },

    getPersonalityScores(
        assessments: AssessmentResult[],
        participant: Participant,
        fitScoreRecipe: FitScoreRecipeDto | null,
        recipeId: string,
    ): PersonalityPartialScoreOutput[] {
        try {
            const employeeScores = assessments.map((assessment) => {
                const personalityScoreType = assessment.questionnaire_framework;

                switch (personalityScoreType) {
                    case EmployeeScoreType.PERSONALITY:
                        return this.processWorkStyle(
                            fitScoreRecipe,
                            assessment.result_raw,
                        );

                    case EmployeeScoreType.WORK_VALUE:
                        return this.processWorkValue(
                            fitScoreRecipe,
                            assessment.result_raw,
                        );

                    case EmployeeScoreType.WORK_INTEREST:
                        return this.processWorkInterest(
                            fitScoreRecipe,
                            assessment.result_raw,
                        );

                    default:
                        logger.error(
                            'No personality score type found from assessment questionnaire framework.',
                            {
                                data: {
                                    assessments,
                                    framework_type: personalityScoreType,
                                    participant_id: participant.id,
                                    recipe_id: recipeId,
                                },
                            },
                        );
                        throw new Error(
                            `No personality score type found for ${personalityScoreType} from assessment questionnaire framework.`,
                        );
                }
            });

            return employeeScores;
        } catch (err) {
            logger.error('Failed to process personality score', {
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
};
