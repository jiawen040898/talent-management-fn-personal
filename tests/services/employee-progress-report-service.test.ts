import { SNSClient } from '@aws-sdk/client-sns';
import { SQSClient } from '@aws-sdk/client-sqs';
import { GcpBigQueryService } from '@pulsifi/fn/services/gcp-big-query';

import { EmployeeProgressReportService } from '../../src/services/';
import { testData } from './fixtures/test-data';

const mockQuery = jest.spyOn(GcpBigQueryService, 'query');

const spySNSClient = jest
    .spyOn(SNSClient.prototype, 'send')
    .mockImplementation(jest.fn());

const spySQSClient = jest
    .spyOn(SQSClient.prototype, 'send')
    .mockImplementation();

describe('EmployeeProgressReportService', () => {
    let sut: EmployeeProgressReportService;
    beforeAll(async () => {
        sut = new EmployeeProgressReportService();
    });

    beforeEach(() => {
        spySQSClient.mockClear();
        spySNSClient.mockClear();
        mockQuery.mockClear();
    });

    describe('handleEmployeeProgressReportFromCronJob', () => {
        it('should send a list of sqs request per manager from company', async () => {
            // Arrange
            mockQuery.mockResolvedValue(testData.mockBQManagerAndStat);

            // Act
            await sut.handleEmployeeProgressReportFromCronJob([
                testData.mockCompanyLookupData,
            ]);

            // Assert
            const input: SafeAny = spySQSClient.mock.calls[0][0]?.input;
            const content: SafeAny[] = input?.Entries.map(
                // get content from batchSQSCommand
                (sqsCommand: SafeAny) => JSON.parse(sqsCommand.MessageBody),
            );

            expect({ content }).toMatchSnapshot({
                content: new Array(content.length).fill({
                    event_id: expect.any(String),
                }),
            });
            expect(mockQuery.mock.calls).toMatchSnapshot();
        });

        it('should not send anything nor prompt error if non of the company match the module', async () => {
            // Act
            await sut.handleEmployeeProgressReportFromCronJob([
                testData.mockCompanyLookupDataWithoutModule,
            ]);

            // Assert
            expect(mockQuery).not.toBeCalled();
            expect(spySQSClient).not.toBeCalled();
        });
    });

    describe('handleEmployeeProgressReportByManager', () => {
        it('should send report to notification queue', async () => {
            // Arrange
            mockQuery.mockResolvedValue(testData.mockSubordinateSummaries);

            // Act
            await sut.handleEmployeeProgressReportByManager(
                testData.mockManagerReportData.company_id,
                testData.mockManagerReportData,
            );

            // Assert
            expect(spySNSClient).toHaveBeenCalledTimes(1);
            expect(mockQuery.mock.calls).toMatchSnapshot();
        });

        it('should not send anything if there is no', async () => {
            // Arrange
            mockQuery.mockResolvedValue([]);

            // Act
            await sut.handleEmployeeProgressReportByManager(
                testData.mockManagerReportData.company_id,
                testData.mockManagerReportData,
            );

            // Assert
            expect(spySNSClient).toHaveBeenCalledTimes(0);
        });
    });
});
