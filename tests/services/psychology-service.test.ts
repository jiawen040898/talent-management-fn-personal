import { cacheService, secretService } from '@pulsifi/fn';
import { authService } from '@pulsifi/fn/services/auth';
import axios from 'axios';

import { PsychologyApiErrorMessage } from '../../src/constants';
import {
    FailedToGetFitScoreRecipeByIdFromPsychologyApi,
    PsychologyService,
} from '../../src/services';
import { testData } from './fixtures/test-data';

describe('PsychologyService', () => {
    const spyCacheGet = jest.spyOn(cacheService, 'get');

    const mockHttpServiceGet = jest.spyOn(axios, 'get');

    jest.spyOn(authService, 'getMachineToken').mockImplementation(() => {
        return Promise.resolve(
            testData.mockMachineTokenResponse.data.access_token,
        );
    });

    jest.spyOn(secretService, 'getSecret').mockImplementation(() => {
        return Promise.resolve(testData.mockAuth0CredentialSecretResponse);
    });

    describe('getFitScoreRecipeById', () => {
        const mockFitScoreRecipeId =
            testData.mockGetFitScoreRecipe.data.data.id;

        beforeEach(() => {
            mockHttpServiceGet.mockClear();
            spyCacheGet.mockClear();
        });

        it('should get fit score recipe data', async () => {
            // Arrange
            mockHttpServiceGet.mockResolvedValue(
                testData.mockGetFitScoreRecipe,
            );
            spyCacheGet.mockResolvedValue(null);

            // Act
            const actual =
                await PsychologyService.getFitScoreRecipeById(
                    mockFitScoreRecipeId,
                );

            // Assert
            expect(actual).toMatchSnapshot();
        });

        it('should get fit score recipe data from cache', async () => {
            // Arrange
            spyCacheGet.mockResolvedValue(testData.mockGetFitScoreRecipe.data);

            // Act
            await PsychologyService.getFitScoreRecipeById(mockFitScoreRecipeId);

            // Assert
            expect(spyCacheGet).toHaveBeenCalledTimes(1);
            expect(spyCacheGet.mock.calls).toMatchSnapshot();
        });

        it('should throw error when get fit score recipe failed', async () => {
            // Arrange
            mockHttpServiceGet.mockRejectedValue(new Error());
            spyCacheGet.mockResolvedValue(null);

            // Act
            const action = () =>
                PsychologyService.getFitScoreRecipeById(mockFitScoreRecipeId);

            // Assert
            await expect(action).rejects.toThrow(
                PsychologyApiErrorMessage.FAILED_TO_GET_FIT_SCORE_RECIPE,
            );

            await expect(action).rejects.toBeInstanceOf(
                FailedToGetFitScoreRecipeByIdFromPsychologyApi,
            );
        });
    });
});
