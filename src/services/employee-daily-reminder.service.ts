import { EventModel, generatorUtil, logger, sqsService } from '@pulsifi/fn';
import { chunk } from 'lodash';

import * as AWSConfig from '../configs';
import { EventType } from '../constants';
import { CompanyLookupDto } from '../dtos';
import { CompanyService } from '../services';
import { dateUtil } from '../utils';

export class EmployeeDailyReminderService {
    private companyService = new CompanyService();

    async processEmployeeDailyReminder(): Promise<void> {
        const timezoneList = dateUtil.getListOfTimezoneByTimeRange(8, 9);
        const companiesList: CompanyLookupDto[] =
            await this.companyService.getActiveCompaniesSubscribedToLearningAndByTimezone(
                timezoneList,
            );

        if (companiesList.length) {
            await this.sendGetEmployeeTaskAndGoalByCompanyMessage(
                companiesList,
            );
        }
    }

    private async sendGetEmployeeTaskAndGoalByCompanyMessage(
        companies: CompanyLookupDto[],
    ): Promise<void> {
        try {
            const chunkCompaniesByTenList = chunk(companies, 10);

            for (const chunkCompanies of chunkCompaniesByTenList) {
                const messageGroupId = generatorUtil.uuid();
                const entries: SafeAny = [];
                const params = {
                    Entries: entries,
                    QueueUrl: AWSConfig.sqs().queueUrl,
                };

                for (const company of chunkCompanies) {
                    const message: EventModel<CompanyLookupDto> = {
                        event_type:
                            EventType.GET_EMPLOYEE_TASK_AND_GOAL_BY_COMPANY,
                        event_id: generatorUtil.uuid(),
                        company_id: company.id,
                        user_account_id: 0,
                        data: company,
                    };

                    const entry: SafeAny = {
                        Id: generatorUtil.uuid(),
                        MessageGroupId: messageGroupId,
                        MessageBody: JSON.stringify(message),
                    };

                    params.Entries.push(entry);
                }

                await sqsService.sendBatch(params.Entries, AWSConfig.sqs());
            }
        } catch (err) {
            logger.error('Fail to send message to queue.', { err });
            throw err;
        }
    }
}
