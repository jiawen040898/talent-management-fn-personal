import { DataSource } from 'typeorm';

import { EmployeeScoreType } from '../../src/constants';
import * as database from '../../src/database';
import { CognitiveScoreService } from '../../src/services';
import { getTestDataSourceAndAddData, testUtil } from '../setup';
import { cognitiveScoreTestData } from './fixtures/cognitive-score-service.test-data';
import { roleFitRecipeTestData } from './fixtures/role-fit-recipe.test-data';

describe('CognitiveScoreService', () => {
    let dataSource: DataSource;
    const spygetDataSource = jest.spyOn(database, 'getDataSource');

    beforeAll(async () => {
        dataSource = await getTestDataSourceAndAddData(
            cognitiveScoreTestData.entitiesToBeAdded,
        );
        spygetDataSource.mockImplementation(() => {
            return Promise.resolve(dataSource);
        });
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    describe('processReasoningNumeric', () => {
        it('should return reasoning numeric score', () => {
            // Act
            const result = CognitiveScoreService.processReasoningNumeric(
                cognitiveScoreTestData.reasoningNumericAssessmentResult,
            );

            // Assert
            expect(result).toMatchSnapshot();
        });

        it('should return empty outcome for invalid assessment type', async () => {
            // Act
            const result = CognitiveScoreService.processReasoningNumeric(
                cognitiveScoreTestData.reasoningVerbalAssessmentResult,
            );

            // Assert
            expect(result).toMatchSnapshot();
        });
    });

    describe('processReasoningVerbal', () => {
        it('should return reasoning verbal score', () => {
            // Act
            const result = CognitiveScoreService.processReasoningVerbal(
                cognitiveScoreTestData.reasoningVerbalAssessmentResult,
            );

            // Assert
            expect(result).toMatchSnapshot();
        });

        it('should return empty outcome for invalid assessment type', async () => {
            // Act
            const result = CognitiveScoreService.processReasoningVerbal(
                cognitiveScoreTestData.reasoningLogicAssessmentResult,
            );

            // Assert
            expect(result).toMatchSnapshot();
        });
    });

    describe('processReasoningLogical', () => {
        it('should return reasoning logic score', () => {
            // Act
            const result = CognitiveScoreService.processReasoningLogical(
                cognitiveScoreTestData.reasoningLogicAssessmentResult,
            );

            // Assert
            expect(result).toMatchSnapshot();
        });

        it('should return empty outcome for invalid assessment type', async () => {
            // Act
            const result = CognitiveScoreService.processReasoningLogical(
                cognitiveScoreTestData.reasoningNumericAssessmentResult,
            );

            // Assert
            expect(result).toMatchSnapshot();
        });
    });

    describe('processReasoningAverage', () => {
        it('should return expected reasoning average score when employee score do not have any assessment completed before', async () => {
            // Act
            const result = await CognitiveScoreService.processReasoningAverage(
                cognitiveScoreTestData.reasoningAverageAssessmentScores,
                testUtil.mockUuid(2),
            );

            // Assert
            expect(result).toMatchSnapshot();
        });

        it('should return expected reasoning average score when employee score has assessment completed before', async () => {
            // Act
            const result = await CognitiveScoreService.processReasoningAverage(
                cognitiveScoreTestData.reasoningAverageForSingleAssessmentScores,
                testUtil.mockUuid(3),
            );

            // Assert
            expect(result).toMatchSnapshot();
        });

        it('should return empty outcome for invalid participant id and empty current assessment', async () => {
            // Act
            const result = await CognitiveScoreService.processReasoningAverage(
                [],
                testUtil.mockUuid(5),
            );

            // Assert
            expect(result).toMatchSnapshot();
        });
    });

    describe('getCognitiveScores', () => {
        it('should return expected cognitive score outcome', async () => {
            // Act
            const result = await CognitiveScoreService.getCognitiveScores(
                cognitiveScoreTestData.cognitiveAssessmentResults,
                cognitiveScoreTestData.participant,
                roleFitRecipeTestData.validRoleFitScoreRecipe.id,
            );

            // Assert
            expect(result).toMatchSnapshot();
        });

        it('should return empty cognitive score outcome', async () => {
            // Act
            const result = await CognitiveScoreService.getCognitiveScores(
                [],
                cognitiveScoreTestData.participant,
                roleFitRecipeTestData.validRoleFitScoreRecipe.id,
            );

            // Assert
            expect(result).toMatchSnapshot();
        });

        it('should throw error when assessment questionnaire framework type is invalid', async () => {
            // Arrange
            const cognitiveAssessmentsResultsWithInvalidFrameworkType = [
                {
                    ...cognitiveScoreTestData.reasoningNumericAssessmentResult,
                    questionnaire_framework: EmployeeScoreType.WORK_INTEREST,
                },
            ];

            // Act
            const result = async () =>
                await CognitiveScoreService.getCognitiveScores(
                    cognitiveAssessmentsResultsWithInvalidFrameworkType,
                    cognitiveScoreTestData.participant,
                    roleFitRecipeTestData.validRoleFitScoreRecipe.id,
                );

            // Assert
            await expect(result()).rejects.toThrowErrorMatchingSnapshot();
        });
    });
});
