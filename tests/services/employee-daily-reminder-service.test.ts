import { sqsService } from '@pulsifi/fn';

import { CompanyLookupDto } from '../../src/dtos';
import {
    CompanyService,
    EmployeeDailyReminderService,
} from '../../src/services';
import { testData } from './fixtures/test-data';

describe('EmployeeDailyReminderService', () => {
    let sut: EmployeeDailyReminderService;

    const spySqsService = jest
        .spyOn(sqsService, 'sendBatch')
        .mockImplementation();
    // const spySQSClient = jest
    //     .spyOn(sqsService, 'sendBatch')
    //     .mockImplementation();

    beforeAll(async () => {
        sut = new EmployeeDailyReminderService();
    });

    describe('processEmployeeDailyReminder', () => {
        describe('should send message by batch (less or equal 10 record)', () => {
            const companiesData: CompanyLookupDto[] = [];
            beforeAll(async () => {
                // Arrange
                for (let i = 0; i < 10; i++) {
                    companiesData.push({
                        ...testData.mockCompanyLookupData,
                        id: i,
                    });
                }

                jest.spyOn(
                    CompanyService.prototype,
                    'getActiveCompaniesSubscribedToLearningAndByTimezone',
                ).mockImplementation(() => {
                    return Promise.resolve(companiesData);
                });

                spySqsService.mockClear();
            });

            it('should send one SQS message to process company goal and task dues', async () => {
                // Act
                await sut.processEmployeeDailyReminder();

                // Assert
                expect(spySqsService).toHaveBeenCalledTimes(1);
            });
        });

        describe('should send message by batch (more than 10 record)', () => {
            const companiesData: CompanyLookupDto[] = [];
            beforeAll(async () => {
                // Arrange
                for (let i = 0; i < 20; i++) {
                    companiesData.push({
                        ...testData.mockCompanyLookupData,
                        id: i,
                    });
                }

                jest.spyOn(
                    CompanyService.prototype,
                    'getActiveCompaniesSubscribedToLearningAndByTimezone',
                ).mockImplementation(() => {
                    return Promise.resolve(companiesData);
                });

                spySqsService.mockClear();
            });

            it('should send two SQS message to process company goal and task dues', async () => {
                // Act
                await sut.processEmployeeDailyReminder();

                // Assert
                expect(spySqsService).toHaveBeenCalledTimes(2);
            });
        });
    });
});
