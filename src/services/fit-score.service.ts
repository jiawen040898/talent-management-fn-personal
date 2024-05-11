import {
    computationService,
    DomainOutcome,
    IngredientFramework,
    IngredientGroup,
    logger,
    objectParser,
} from '@pulsifi/fn';
import { groupBy, map } from 'lodash';

import {
    EmployeeScoreType,
    IngredientAliasType,
    PersonalityCognitiveScoreDomainAlias,
} from '../constants';
import { FitScoreRecipe, Recipe } from '../dtos';
import {
    CognitiveResult,
    CultureFitPartialScoreOutput,
    ParticipantPartialScoreInput,
} from '../interface';
import { employeeScoreMapper } from '../mappers';
import { EmployeeScore, Participant, Program } from '../models';
import { numberUtil } from '../utils';
import { EmployeeScoreService } from './employee-score.service';

const SCORE_MULTIPLIER = 10;

const getCultureFitEmployeeScore = (
    employeeScores: EmployeeScore[],
    recipe: Recipe,
): CultureFitPartialScoreOutput => {
    const processedDomainScores =
        FitScoreService.processCultureFitDomainScore(employeeScores);

    const cultureFitScore = computationService.computeCultureFitScore(
        processedDomainScores,
        recipe.recipe,
    );

    return {
        score: numberUtil.parseDecimal(
            cultureFitScore.score * SCORE_MULTIPLIER,
        ),
        score_outcome: {
            personality_result: cultureFitScore.domainScores,
            framework_alias: recipe.framework_alias,
        },
        score_type: EmployeeScoreType.CULTURE_FIT,
        score_dimension: EmployeeScoreService.getScoreDimension(
            cultureFitScore.score,
        ),
    };
};

const processCultureFitDomainScore = (
    employeeScores: EmployeeScore[],
): DomainOutcome[] => {
    return employeeScores.flatMap((employeeScore) => {
        const { score_type: scoreType, score_outcome: scoreOutcome } =
            employeeScore;

        switch (scoreType) {
            case EmployeeScoreType.WORK_VALUE:
            case EmployeeScoreType.WORK_STYLE:
            case EmployeeScoreType.WORK_INTEREST:
                const personalityScoreOutcome = scoreOutcome as unknown as {
                    personality_result: DomainOutcome[];
                };

                return personalityScoreOutcome?.personality_result?.map(
                    (result) => ({
                        domain_alias: result.domain_alias,
                        domain_score: result.domain_score,
                        domain_framework: scoreType,
                    }),
                ) as SafeAny;

            case EmployeeScoreType.REASONING_LOGICAL:
            case EmployeeScoreType.REASONING_NUMERIC:
            case EmployeeScoreType.REASONING_VERBAL:
                const cognitiveScoreOutcome = scoreOutcome as unknown as {
                    cognitive_result: CognitiveResult;
                };

                return {
                    domain_alias:
                        employeeScoreMapper.mapEmployeeCognitiveScoreType(
                            cognitiveScoreOutcome?.cognitive_result
                                ?.domain_alias as PersonalityCognitiveScoreDomainAlias,
                        ),
                    domain_score:
                        cognitiveScoreOutcome?.cognitive_result?.domain_score,
                };
            default:
                return [];
        }
    });
};

const mapParticipant = (
    participant: Participant,
    partialScoreOutput: ParticipantPartialScoreInput,
): Participant => {
    return {
        ...participant,
        assessment_completed_at: new Date(),
        framework_score: partialScoreOutput.score / SCORE_MULTIPLIER,
        framework_dimension: partialScoreOutput.score_dimension,
        framework_outcome: objectParser.toJSON(
            partialScoreOutput.score_outcome.personality_result,
        ),
    };
};

const validateWorkStyle = (employeeScores: EmployeeScore[]): boolean => {
    const workStyleScoreOutcome = employeeScores.find(
        (employeeScore) =>
            employeeScore.score_type === EmployeeScoreType.WORK_STYLE,
    );

    return Boolean(workStyleScoreOutcome?.score_outcome);
};

const validateWorkValue = (employeeScores: EmployeeScore[]): boolean => {
    const foundWorkStyleEmployeeScore = employeeScores.find(
        (employeeScore) =>
            employeeScore.score_type === EmployeeScoreType.WORK_VALUE,
    );

    return Boolean(foundWorkStyleEmployeeScore?.score_outcome);
};

const validateWorkInterest = (employeeScores: EmployeeScore[]): boolean => {
    const foundWorkStyleEmployeeScore = employeeScores.find(
        (employeeScore) =>
            employeeScore.score_type === EmployeeScoreType.WORK_INTEREST,
    );

    return Boolean(foundWorkStyleEmployeeScore?.score_outcome);
};

const validatePulsifiDefault = (
    employeeScores: EmployeeScore[],
    recipes: FitScoreRecipe[],
): boolean => {
    const processedRecipesIngredientAlias = recipes.map((recipe) => {
        return employeeScoreMapper.mapEmployeeScoreType(
            recipe.ingredient_alias as unknown as IngredientAliasType,
        );
    });

    const uniqueRecipeIngredientAlias = [
        ...new Set(processedRecipesIngredientAlias),
    ];

    return uniqueRecipeIngredientAlias.every((ingredientAlias) => {
        const employeeScore = employeeScores.find(
            (employeeScore) => employeeScore.score_type === ingredientAlias,
        );

        return Boolean(employeeScore?.score_outcome);
    });
};

const validateIfFitScoreIsReadyToBeComputed = (
    recipes: FitScoreRecipe[],
    employeeScores: EmployeeScore[],
    isCultureFit = true,
): boolean => {
    if (!recipes.length) {
        throw new Error('Missing recipes for employee fit score computation');
    }

    const recipesToBeValidated = recipes.filter((recipe) =>
        isCultureFit
            ? recipe.ingredient_group !== IngredientGroup.RECIPE
            : recipe.ingredient_group === IngredientGroup.RECIPE,
    );

    const groupedRecipeByIngredientFramework = groupBy(
        recipesToBeValidated,
        (recipe) => recipe.ingredient_framework,
    );

    const validatedResult = map(
        groupedRecipeByIngredientFramework,
        (ingredientFrameworkRecipe, ingredientFramework) => {
            switch (ingredientFramework) {
                case EmployeeScoreType.WORK_STYLE:
                    return validateWorkStyle(employeeScores);
                case EmployeeScoreType.WORK_VALUE:
                    return validateWorkValue(employeeScores);
                case EmployeeScoreType.WORK_INTEREST:
                    return validateWorkInterest(employeeScores);
                case IngredientFramework.PULSIFI_DEFAULT:
                    return validatePulsifiDefault(
                        employeeScores,
                        ingredientFrameworkRecipe,
                    );
                default:
                    return false;
            }
        },
    );

    return validatedResult.every((result) => result);
};

const shouldCalculateEmployeeFitScore = (
    program: Program,
    fitScoreRecipe: { recipe: FitScoreRecipe[]; id: string },
    employeeScores: EmployeeScore[],
    participantId: string,
): boolean => {
    try {
        if (!program?.culture_fit_recipe_id) {
            return false;
        }

        const processedFitScoreRecipe = fitScoreRecipe.recipe.map((recipe) => ({
            ...recipe,
            ingredient_framework:
                recipe.ingredient_framework ??
                IngredientFramework.PULSIFI_DEFAULT,
        }));

        return validateIfFitScoreIsReadyToBeComputed(
            processedFitScoreRecipe,
            employeeScores,
        );
    } catch (err) {
        logger.error(
            'Failed to validate if fit score is ready to be computed',
            {
                data: {
                    participant_id: participantId,
                    recipe_id: fitScoreRecipe?.id,
                },
                err,
            },
        );
        throw err;
    }
};

export const FitScoreService = {
    getCultureFitEmployeeScore,
    processCultureFitDomainScore,
    mapParticipant,
    shouldCalculateEmployeeFitScore,
    validateIfFitScoreIsReadyToBeComputed,
    validateWorkStyle,
    validateWorkValue,
    validateWorkInterest,
    validatePulsifiDefault,
};
