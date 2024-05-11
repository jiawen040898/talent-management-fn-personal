import { EmployeeScoreType } from '../../src/constants';
import { PersonalityScoreService } from '../../src/services';
import { personalityScoreTestData } from './fixtures/personality-score-service.test-data';
import { roleFitRecipeTestData } from './fixtures/role-fit-recipe.test-data';

describe('PersonalityScoreService', () => {
    describe('processWorkStyle', () => {
        it('should return expected work style outcome if fit score recipe is not empty', () => {
            // Act
            const result = PersonalityScoreService.processWorkStyle(
                roleFitRecipeTestData.validRoleFitScoreRecipe,
                personalityScoreTestData.workStyleAssessmentResult.result_raw,
            );

            // Assert
            expect(result).toMatchSnapshot();
        });

        it('should return expected work style outcome if fit score recipe is empty', () => {
            // Act
            const result = PersonalityScoreService.processWorkStyle(
                null,
                personalityScoreTestData.workStyleAssessmentResult.result_raw,
            );

            // Assert
            expect(result).toMatchSnapshot();
        });

        it.each([{ scores: [] }, undefined, null])(
            'should throw error when result raw is %s',
            (resultRaw) => {
                // Act
                const result = () =>
                    PersonalityScoreService.processWorkStyle(
                        roleFitRecipeTestData.validRoleFitScoreRecipe,
                        resultRaw,
                    );

                // Assert
                expect(result).toThrowErrorMatchingSnapshot();
            },
        );
    });

    describe('processWorkValue', () => {
        it('should return expected work value outcome if fit score recipe is not empty', () => {
            // Act
            const result = PersonalityScoreService.processWorkValue(
                roleFitRecipeTestData.validRoleFitScoreRecipe,
                personalityScoreTestData.workValueAssessmentResult.result_raw,
            );

            // Assert
            expect(result).toMatchSnapshot();
        });

        it('should return expected work value outcome if fit score recipe is empty', () => {
            // Act
            const result = PersonalityScoreService.processWorkValue(
                null,
                personalityScoreTestData.workValueAssessmentResult.result_raw,
            );

            // Assert
            expect(result).toMatchSnapshot();
        });

        it.each([{ scores: [] }, undefined, null])(
            'should throw error when result raw is %s',
            (resultRaw) => {
                // Act
                const result = () =>
                    PersonalityScoreService.processWorkValue(
                        roleFitRecipeTestData.validRoleFitScoreRecipe,
                        resultRaw,
                    );

                // Assert
                expect(result).toThrowErrorMatchingSnapshot();
            },
        );
    });

    describe('processWorkInterest', () => {
        it('should return expected work interest outcome if fit score recipe is not empty', () => {
            // Act
            const result = PersonalityScoreService.processWorkInterest(
                roleFitRecipeTestData.validRoleFitScoreRecipe,
                personalityScoreTestData.workInterestAssessmentResult
                    .result_raw,
            );

            // Assert
            expect(result).toMatchSnapshot();
        });

        it('should return expected work interest outcome if fit score recipe is empty', () => {
            // Act
            const result = PersonalityScoreService.processWorkInterest(
                null,
                personalityScoreTestData.workInterestAssessmentResult
                    .result_raw,
            );

            // Assert
            expect(result).toMatchSnapshot();
        });

        it.each([{ scores: [] }, undefined, null])(
            'should throw error when result raw is %s',
            (resultRaw) => {
                // Act
                const result = () =>
                    PersonalityScoreService.processWorkInterest(
                        roleFitRecipeTestData.validRoleFitScoreRecipe,
                        resultRaw,
                    );

                // Assert
                expect(result).toThrowErrorMatchingSnapshot();
            },
        );
    });

    describe('getPersonalityScores', () => {
        it('should return personality score outcome', () => {
            // Act
            const result = PersonalityScoreService.getPersonalityScores(
                personalityScoreTestData.personalityAssessmentResults,
                personalityScoreTestData.participant,
                roleFitRecipeTestData.validRoleFitScoreRecipe,
                roleFitRecipeTestData.validRoleFitScoreRecipe.id,
            );

            // Assert
            expect(result).toMatchSnapshot();
        });

        it('should throw error when assessment questionnaire framework is not in personality score type', () => {
            // Arrange
            const assessmentWithEmptyResultRaw =
                personalityScoreTestData.personalityAssessmentResults.map(
                    (result) => ({
                        ...result,
                        questionnaire_framework:
                            EmployeeScoreType.REASONING_LOGIC,
                    }),
                );

            // Act
            const result = () =>
                PersonalityScoreService.getPersonalityScores(
                    assessmentWithEmptyResultRaw,
                    personalityScoreTestData.participant,
                    roleFitRecipeTestData.validRoleFitScoreRecipe,
                    roleFitRecipeTestData.validRoleFitScoreRecipe.id,
                );

            // Assert
            expect(result).toThrowErrorMatchingSnapshot();
        });

        it('should throw error when result raw is empty', () => {
            // Arrange
            const assessmentWithEmptyResultRaw =
                personalityScoreTestData.personalityAssessmentResults.map(
                    (result) => ({
                        ...result,
                        result_raw: null,
                    }),
                );

            // Act
            const result = () =>
                PersonalityScoreService.getPersonalityScores(
                    assessmentWithEmptyResultRaw,
                    personalityScoreTestData.participant,
                    roleFitRecipeTestData.validRoleFitScoreRecipe,
                    roleFitRecipeTestData.validRoleFitScoreRecipe.id,
                );

            // Assert
            expect(result).toThrowErrorMatchingSnapshot();
        });
    });
});
