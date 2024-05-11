import { SNSClient } from '@aws-sdk/client-sns';
import { dateTimeUtil } from '@pulsifi/fn';
import { DataSource } from 'typeorm';

import * as database from '../../src/database';
import { EmployeeScoreService } from '../../src/services';
import { testData } from '../services/fixtures/test-data';
import { getTestDataSource, getTestDataSourceAndAddData } from '../setup';
import { TestData } from '../setup/test-data.setup';
import { cultureFitRecipeTestData } from './fixtures/culture-fit-recipe.test-data';
import { employeeScoreTestData } from './fixtures/employee-score-service.test-data';
import { roleFitRecipeTestData } from './fixtures/role-fit-recipe.test-data';

jest.mock('../../src/services/psychology.service', () => {
    const mBInstance = {
        getFitScoreRecipeById: jest.fn(
            () => testData.mockGetFitScoreRecipe.data.data,
        ),
    };
    const mB = jest.fn(() => mBInstance);
    return { PsychologyService: mB };
});

const mockDateTimeNow = jest.spyOn(dateTimeUtil, 'now');
mockDateTimeNow.mockReturnValue(new Date('2023-01-31T12:34:56.789Z'));
const mockGetFitScoreRecipe = jest.fn();

const spySNSClient = jest
    .spyOn(SNSClient.prototype, 'send')
    .mockImplementation(jest.fn());

describe('[employeeScoreService]', () => {
    let dataSource: DataSource;
    const spyGetDataSource = jest.spyOn(database, 'getDataSource');

    beforeAll(async () => {
        dataSource = await getTestDataSource();
        EmployeeScoreService.getFitScoreRecipe = mockGetFitScoreRecipe;

        dataSource = await getTestDataSourceAndAddData(
            employeeScoreTestData.entitiesToBeAdded,
        );
        spyGetDataSource.mockImplementation(() => {
            return Promise.resolve(dataSource);
        });
    });

    it('should pass processPersonalityScore', async () => {
        // Act
        const result = await EmployeeScoreService.processPersonality(
            employeeScoreTestData.personalityAssessmentResults,
            employeeScoreTestData.participant,
            roleFitRecipeTestData.validRoleFitScoreRecipe,
            roleFitRecipeTestData.validRoleFitScoreRecipe.id,
        );

        // Assert
        expect(result).toMatchSnapshot();
    });

    it('should pass processCognitive', async () => {
        // Act
        const result = await EmployeeScoreService.processCognitive(
            employeeScoreTestData.cognitiveAssessmentResults,
            employeeScoreTestData.participant,
            roleFitRecipeTestData.validRoleFitScoreRecipe.id,
        );

        // Assert
        expect(result).toMatchSnapshot();
    });

    describe('processEmployeeAssessmentScoreCalculated', () => {
        beforeEach(() => {
            spySNSClient.mockClear();
        });

        it('should pass sendTMAssessmentScoreCalculated event', async () => {
            // Act
            await EmployeeScoreService.processEmployeeAssessmentScoreCalculated(
                employeeScoreTestData.participant,
                cultureFitRecipeTestData.validCultureFitScoreRecipe,
                TestData.companyId,
            );

            // Assert
            expect(spySNSClient).toHaveBeenCalledTimes(1);
        });
    });

    describe('processEmployeeAssessmentScore', () => {
        const roleFitRecipeId =
            roleFitRecipeTestData.validRoleFitScoreRecipe.id;
        const cultureFitRecipeId =
            cultureFitRecipeTestData.validCultureFitScoreRecipe.id;

        beforeEach(() => {
            mockGetFitScoreRecipe.mockClear();
            mockGetFitScoreRecipe.mockImplementation((id) =>
                id === roleFitRecipeId
                    ? roleFitRecipeTestData.validRoleFitScoreRecipe
                    : cultureFitRecipeTestData.validCultureFitScoreRecipe,
            );
            spySNSClient.mockClear();
        });

        it.each([
            [
                'role fit id and cognitive assessment result',
                roleFitRecipeId,
                undefined,
                employeeScoreTestData.cognitiveAssessmentResults,
                1,
                0,
            ],
            [
                'role fit id and personality assessment result',
                roleFitRecipeId,
                undefined,
                employeeScoreTestData.personalityAssessmentResults,
                1,
                0,
            ],
            [
                'culture fit id and cognitive assessment result',
                undefined,
                cultureFitRecipeId,
                employeeScoreTestData.cognitiveAssessmentResults,
                1,
                1,
            ],
            [
                'role fit id, culture fit id and cognitive assessment result',
                roleFitRecipeId,
                cultureFitRecipeId,
                employeeScoreTestData.cognitiveAssessmentResults,
                2,
                1,
            ],
            [
                'role fit id, culture fit id and personality assessment result',
                roleFitRecipeId,
                cultureFitRecipeId,
                employeeScoreTestData.personalityAssessmentResults,
                2,
                1,
            ],
            [
                'role fit id, culture fit id and all assessment result',
                roleFitRecipeId,
                cultureFitRecipeId,
                [
                    ...employeeScoreTestData.personalityAssessmentResults,
                    ...employeeScoreTestData.cognitiveAssessmentResults,
                ],
                2,
                1,
            ],
        ])(
            'should pass if there are %s in employee assessment submitted event',
            async (
                _,
                roleFitRecipeId,
                cultureFitRecipeId,
                assessments,
                expectGetFitScoreRecipeToBeCalledTimes,
                expectSnsToBeCalledTimes,
            ) => {
                // Act
                await EmployeeScoreService.processEmployeeAssessmentScore({
                    company_id: TestData.companyId,
                    program_id: employeeScoreTestData.participant.program_id,
                    participant_id: employeeScoreTestData.participant.id,
                    role_fit_recipe_id: roleFitRecipeId,
                    culture_fit_recipe_id: cultureFitRecipeId,
                    assessments: assessments,
                });

                // Assert
                expect(mockGetFitScoreRecipe).toHaveBeenCalledTimes(
                    expectGetFitScoreRecipeToBeCalledTimes,
                );
                expect(spySNSClient).toHaveBeenCalledTimes(
                    expectSnsToBeCalledTimes,
                );
            },
        );
    });
});
