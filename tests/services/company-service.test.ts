import { cacheService, secretService } from '@pulsifi/fn';
import { authService } from '@pulsifi/fn/services/auth';
import axios from 'axios';

import { CompanyModule, CompanyStatus } from '../../src/constants';
import { CompanyLookupDto } from '../../src/dtos';
import { CompanyService } from '../../src/services';
import { testData } from './fixtures/test-data';

describe('CompanyService', () => {
    let sut: CompanyService;

    const spyCacheGet = jest
        .spyOn(cacheService, 'get')
        .mockImplementation(() => {
            return Promise.resolve(JSON.stringify(jest.fn()));
        });

    jest.spyOn(authService, 'getMachineToken').mockImplementation(() => {
        return Promise.resolve(
            testData.mockMachineTokenResponse.data.access_token,
        );
    });

    jest.spyOn(axios, 'get').mockImplementation(() => {
        return Promise.resolve(testData.mockCompanyLookupList);
    });

    jest.spyOn(secretService, 'getSecret').mockImplementation(() => {
        return Promise.resolve(testData.mockAuth0CredentialSecretResponse);
    });

    beforeAll(async () => {
        sut = new CompanyService();
    });

    describe('getCompanyLookup', () => {
        describe('should get data from identity endpoint', () => {
            let actual: CompanyLookupDto[];

            beforeAll(async () => {
                // Arrange
                spyCacheGet.mockImplementationOnce(() => {
                    return Promise.resolve(null);
                });

                // Act
                actual = await sut.getCompanyLookup();
            });

            it('should return company lookup data', async () => {
                // Assert
                expect(actual).toMatchSnapshot();
            });
        });

        describe('should get company lookup data from cache', () => {
            beforeAll(async () => {
                // Arrange
                spyCacheGet.mockClear();

                // Act
                await sut.getCompanyLookup();
            });

            it('should return company lookup data', async () => {
                // Assert
                expect(spyCacheGet).toHaveBeenCalledTimes(1);
                expect(spyCacheGet.mock.calls).toMatchSnapshot();
            });
        });
    });

    describe('getActiveCompaniesSubscribedToLearningAndByTimezone', () => {
        describe('should filter and return companies correctly', () => {
            let actual: CompanyLookupDto[];
            const timezoneList = ['Japan'];

            beforeAll(async () => {
                // Act
                actual =
                    await sut.getActiveCompaniesSubscribedToLearningAndByTimezone(
                        timezoneList,
                    );
            });

            it('should filter and return companies data', async () => {
                // Assert
                expect({ actual }).toMatchSnapshot({
                    actual: new Array(actual.length).fill({
                        localDate: expect.any(String),
                    }),
                });

                actual.forEach((item) => {
                    expect(item.is_deleted).toBeFalsy();
                    expect(item.status).toEqual(CompanyStatus.ACTIVE);
                    expect(
                        timezoneList.some((tz) => item.timezone.includes(tz)),
                    ).toBe(true);
                    expect(
                        item.products.some((prd) =>
                            CompanyModule.TALENT_LEARNING.includes(prd.module),
                        ),
                    ).toBe(true);
                });
            });
        });
    });
});
