import {
    Environment,
    envUtil,
    EventModel,
    generatorUtil,
    logger,
    snsService,
    sqsService,
} from '@pulsifi/fn';
import { GcpBigQueryService } from '@pulsifi/fn/services/gcp-big-query';
import { chunk } from 'lodash';

import * as AWSConfig from '../configs';
import { gcpConfig } from '../configs';
import { BigQueries, DomainEventType, EventType } from '../constants';
import {
    CompanyLookupDto,
    ManagerSubordinateAggregatedReportData,
    SubordinatesProgressData,
} from '../dtos';

export class EmployeeProgressReportService {
    private readonly environment: Environment;

    constructor() {
        this.environment = envUtil.get('NODE_ENV') as Environment;
    }

    async handleEmployeeProgressReportFromCronJob(
        companies: CompanyLookupDto[],
    ): Promise<void> {
        const validCompanies = companies.filter((company) =>
            this.isCompanyHaveTalentManagementModule(company),
        );

        if (!validCompanies.length) {
            return;
        }

        const validCompanyIds = validCompanies.map((company) => company.id);

        let managersReportData =
            await GcpBigQueryService.query<ManagerSubordinateAggregatedReportData>(
                gcpConfig(),
                BigQueries.GET_MANAGER_STATS_BY_COMPANY,
                {
                    company_id: validCompanyIds,
                },
            );

        managersReportData = managersReportData.filter((manager) =>
            Boolean(manager.manager_user_account_id && manager.manager_email),
        );

        await this.sendTalentManagementHandlingManagerWeeklyProgressEvent(
            managersReportData,
        );
    }

    async handleEmployeeProgressReportByManager(
        companyId: number,
        managerSubordinateAggregatedReportData: ManagerSubordinateAggregatedReportData,
    ): Promise<void> {
        const subordinatesSummary =
            await GcpBigQueryService.query<SubordinatesProgressData>(
                gcpConfig(),
                BigQueries.GET_MANAGER_SUBORDINATES_STATS,
                {
                    company_id: companyId,
                    manager_employee_id:
                        managerSubordinateAggregatedReportData.manager_employee_id,
                },
            );

        if (!subordinatesSummary.length) {
            return;
        }

        managerSubordinateAggregatedReportData.subordinates_summary =
            subordinatesSummary;

        await this.sendTalentManagementManagerWeeklySubordinateProgressReportEventMessage(
            companyId,
            managerSubordinateAggregatedReportData,
        );
    }

    private isCompanyHaveTalentManagementModule(
        company: CompanyLookupDto,
    ): boolean {
        const products = company.products.map((product) => product.module);
        return products.includes('talent_management');
    }

    private async sendTalentManagementHandlingManagerWeeklyProgressEvent(
        managerReportDataList: ManagerSubordinateAggregatedReportData[],
    ): Promise<void> {
        try {
            const chunkManagerReportDataByTenList = chunk(
                managerReportDataList,
                10,
            );

            for (const chunkManagerReportData of chunkManagerReportDataByTenList) {
                const messageGroupId = generatorUtil.uuid();
                const entries = chunkManagerReportData.map(
                    (managerReportData) => {
                        const message: EventModel<ManagerSubordinateAggregatedReportData> =
                            {
                                event_type:
                                    EventType.TALENT_MANAGEMENT_HANDLING_MANAGER_WEEKLY_PROGRESS,
                                event_id: generatorUtil.uuid(),
                                company_id: managerReportData.company_id,
                                user_account_id: 0,
                                data: managerReportData,
                            };

                        return {
                            Id: generatorUtil.uuid(),
                            MessageGroupId: messageGroupId,
                            MessageBody: JSON.stringify(message),
                        };
                    },
                );

                const params = {
                    Entries: entries,
                    QueueUrl: AWSConfig.sqs().queueUrl,
                };

                await sqsService.sendBatch(params.Entries, AWSConfig.sqs());
            }
        } catch (err) {
            logger.error('Fail to send message to queue.', { err });
            throw err;
        }
    }

    private async sendTalentManagementManagerWeeklySubordinateProgressReportEventMessage(
        companyId: number,
        managerSubordinateAggregatedReportData: ManagerSubordinateAggregatedReportData,
    ): Promise<void> {
        const message: EventModel<ManagerSubordinateAggregatedReportData> = {
            event_type:
                DomainEventType.MANAGER_WEEKLY_SUBORDINATE_PROGRESS_REPORT,
            event_id: generatorUtil.uuid(),
            company_id: companyId,
            user_account_id: 0,
            data: managerSubordinateAggregatedReportData,
        };

        await snsService.sendEventModel(message, AWSConfig.sns());
    }
}
