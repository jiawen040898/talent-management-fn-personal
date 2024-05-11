import { IngredientFramework } from '@pulsifi/fn';
import { ParticipantPartialScoreInput } from 'src/interface';

import { FitScoreService } from '../../src/services';
import { cultureFitRecipeTestData } from './fixtures/culture-fit-recipe.test-data';
import { employeeScoreTestData } from './fixtures/employee-score-service.test-data';
import { fitScoreTestData } from './fixtures/fit-score-service.test-data';
import { roleFitRecipeTestData } from './fixtures/role-fit-recipe.test-data';

describe('FitScoreService', () => {
    describe('processCultureFitDomainScore', () => {
        it('should return expected domain outcome', () => {
            // Act
            const result = FitScoreService.processCultureFitDomainScore(
                fitScoreTestData.employeeScores,
            );

            // Assert
            expect(result).toMatchObject(
                fitScoreTestData.processedDomainScores,
            );
        });
    });

    describe('getCultureFitEmployeeScore', () => {
        it('should return culture fit score', () => {
            // Act
            const result = FitScoreService.getCultureFitEmployeeScore(
                fitScoreTestData.employeeScores,
                cultureFitRecipeTestData.validCultureFitScoreRecipe,
            );

            // Assert
            expect(result).toMatchSnapshot();
        });
    });

    describe('mapParticipant', () => {
        it('should return participant with score', () => {
            // Arrange
            const partialScoreOutput: ParticipantPartialScoreInput = {
                score: fitScoreTestData.score,
                score_dimension: fitScoreTestData.scoreDimension,
                score_outcome: {
                    personality_result:
                        fitScoreTestData.computeCultureFitDomainScores,
                },
            };

            // Act
            const result = FitScoreService.mapParticipant(
                fitScoreTestData.participant,
                partialScoreOutput,
            );

            // Assert
            expect(result).toMatchSnapshot({
                created_at: expect.any(Date),
                updated_at: expect.any(Date),
                assessment_completed_at: expect.any(Date),
            });
        });
    });

    describe('validateWorkStyle', () => {
        it('should return true if valid employee scores is given', () => {
            // Act
            const isWorkStyleValid = FitScoreService.validateWorkStyle(
                employeeScoreTestData.employeeScores,
            );

            // Assert
            expect(isWorkStyleValid).toBeTrue();
        });

        it('should return false if empty employee scores is given', () => {
            // Act
            const isWorkStyleValid = FitScoreService.validateWorkStyle([]);

            // Assert
            expect(isWorkStyleValid).toBeFalse();
        });
    });

    describe('validateWorkValue', () => {
        it('should return true if valid employee scores is given', () => {
            // Act
            const isWorkValueValid = FitScoreService.validateWorkValue(
                employeeScoreTestData.employeeScores,
            );

            // Assert
            expect(isWorkValueValid).toBeTrue();
        });

        it('should return false if invalid employee scores is given', () => {
            // Act
            const isWorkValueValid = FitScoreService.validateWorkValue([]);

            // Assert
            expect(isWorkValueValid).toBeFalse();
        });
    });

    describe('validateWorkInterest', () => {
        it('should return true if valid employee scores is given', () => {
            // Act
            const isWorkInterestValid = FitScoreService.validateWorkInterest(
                employeeScoreTestData.employeeScores,
            );

            // Assert
            expect(isWorkInterestValid).toBeTrue();
        });

        it('should return false if invalid employee scores is given', () => {
            // Act
            const isWorkInterestValid = FitScoreService.validateWorkInterest(
                [],
            );

            // Assert
            expect(isWorkInterestValid).toBeFalse();
        });
    });

    describe('validatePulsifiDefault', () => {
        it('should pass validate role fit recipe', () => {
            // Act
            const shouldPassedValidatePulsifiDefault =
                FitScoreService.validatePulsifiDefault(
                    employeeScoreTestData.employeeScores,
                    employeeScoreTestData.ingredientFrameworkRecipe,
                );

            // Assert
            expect(shouldPassedValidatePulsifiDefault).toBeTrue();
        });

        it('should pass validate culture fit recipe, since there is no ingredient framework as pulsifi_default', () => {
            // Act
            const shouldPassedValidatePulsifiDefault =
                FitScoreService.validatePulsifiDefault(
                    employeeScoreTestData.employeeScores,
                    [],
                );

            // Assert
            expect(shouldPassedValidatePulsifiDefault).toBeTrue();
        });
    });

    describe('validateIfFitScoreIsReadyToBeComputed', () => {
        // Arrange
        const isCultureFit = true;

        it('should pass validate role fit recipe', () => {
            // Arrange
            const newRoleFitRecipe =
                roleFitRecipeTestData.validRoleFitScoreRecipe.recipe.map(
                    (recipe) => ({
                        ...recipe,
                        ingredient_framework:
                            recipe.ingredient_framework ??
                            IngredientFramework.PULSIFI_DEFAULT,
                    }),
                );

            // Act
            const isFitScoreReadyToBeComputed =
                FitScoreService.validateIfFitScoreIsReadyToBeComputed(
                    newRoleFitRecipe,
                    employeeScoreTestData.employeeScores,
                    !isCultureFit,
                );

            // Assert
            expect(isFitScoreReadyToBeComputed).toBeTrue();
        });

        it('should pass validate culture fit recipe', () => {
            // Arrange
            const newCultureFitRecipe =
                cultureFitRecipeTestData.validCultureFitScoreRecipe.recipe.map(
                    (recipe) => ({
                        ...recipe,
                        ingredient_framework:
                            recipe.ingredient_framework ??
                            IngredientFramework.PULSIFI_DEFAULT,
                    }),
                );

            // Act
            const isFitScoreReadyToBeComputed =
                FitScoreService.validateIfFitScoreIsReadyToBeComputed(
                    newCultureFitRecipe,
                    employeeScoreTestData.employeeScores,
                    isCultureFit,
                );

            // Assert
            expect(isFitScoreReadyToBeComputed).toBeTrue();
        });

        it('should failed when employee assessment scores is empty', () => {
            // Act
            const result = () =>
                FitScoreService.validateIfFitScoreIsReadyToBeComputed(
                    roleFitRecipeTestData.validRoleFitScoreRecipe.recipe,
                    [],
                );

            // Assert
            expect(result).not.toBeTrue();
        });

        it('should failed when employee assessment is not completed', () => {
            // Arrange
            const incompleteAssessmentScores = [
                fitScoreTestData.employee1ScoreReasoningNumeric,
                fitScoreTestData.employee1ScoreReasoningLogical,
                fitScoreTestData.employee1ScoreReasoningVerbal,
                fitScoreTestData.employee1ScoreWorkStyle,
            ];

            // Act
            const result = () =>
                FitScoreService.validateIfFitScoreIsReadyToBeComputed(
                    roleFitRecipeTestData.validRoleFitScoreRecipe.recipe,
                    incompleteAssessmentScores,
                );

            // Assert
            expect(result).not.toBeTrue();
        });

        it('should throw error when recipe is empty', () => {
            // Act
            const result = () =>
                FitScoreService.validateIfFitScoreIsReadyToBeComputed(
                    [],
                    employeeScoreTestData.employeeScores,
                );

            // Assert
            expect(result).toThrowErrorMatchingSnapshot();
        });
    });

    describe('shouldCalculateEmployeeFitScore', () => {
        it('should return true when all data is valid', () => {
            // Act
            const shouldSendEvent =
                FitScoreService.shouldCalculateEmployeeFitScore(
                    employeeScoreTestData.program2,
                    cultureFitRecipeTestData.validCultureFitScoreRecipe,
                    employeeScoreTestData.employeeScores,
                    employeeScoreTestData.participant.id,
                );

            // Assert
            expect(shouldSendEvent).toBeTrue();
        });

        it(`should throw error when fit score recipe's recipe is empty`, () => {
            // Arrange
            const emptyRecipe = {
                ...cultureFitRecipeTestData.validCultureFitScoreRecipe,
                recipe: [],
            };

            // Act
            const result = () =>
                FitScoreService.shouldCalculateEmployeeFitScore(
                    employeeScoreTestData.program2,
                    emptyRecipe,
                    employeeScoreTestData.employeeScores,
                    employeeScoreTestData.participant.id,
                );

            // Assert
            expect(result).toThrowErrorMatchingSnapshot();
        });
    });
});
