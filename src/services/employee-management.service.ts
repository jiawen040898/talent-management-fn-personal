import { EventModel, snsService } from '@pulsifi/fn';
import { merge } from 'lodash';

import {
    EmployeeTaskQueryBuilder,
    LearningGoalQueryBuilder,
} from '../builders';
import * as AWSConfig from '../configs';
import { DomainEventType } from '../constants';
import { getDataSource } from '../database';
import {
    CompanyLookupDto,
    EmployeeTaskAndGoalDue,
    IEmployeeUserCreatedEventData,
} from '../dtos';
import { Employee, EmployeeTask, LearningGoal } from '../models';
import { dateUtil } from '../utils';

export const EmployeeManagementService = {
    async updateUserAccountId(
        event: IEmployeeUserCreatedEventData,
    ): Promise<void> {
        const dataSource = await getDataSource();

        await dataSource.getRepository(Employee).update(
            {
                id: event.employee_id,
                user_account_id: 0,
            },
            {
                user_account_id: event.id,
            },
        );
    },

    async processEmployeeTaskAndGoalByCompany(
        company: CompanyLookupDto,
    ): Promise<void> {
        const goalAndTaskDueList: EmployeeTaskAndGoalDue[] =
            await this.getGoalAndTaskDueListByCompany(company);

        for (const data of goalAndTaskDueList) {
            const message: EventModel<EmployeeTaskAndGoalDue> = {
                event_type: DomainEventType.EMPLOYEE_REMINDER,
                event_id: data.employee_id,
                company_id: data.company_id,
                user_account_id: data.employee_user_account_id,
                data,
            };
            await snsService.sendEventModel(message, AWSConfig.sns());
        }
    },

    async getGoalAndTaskDueListByCompany(
        company: CompanyLookupDto,
    ): Promise<EmployeeTaskAndGoalDue[]> {
        const dueDates: string[] = [
            company.localDate,
            dateUtil.addDays(3, company.localDate),
        ];

        const dataSource = await getDataSource();

        const goalQueryBuilder = new LearningGoalQueryBuilder(
            dataSource.getRepository(LearningGoal),
        )
            .innerJoinEmployee()
            .whereLearningGoalDueDatesIn(dueDates)
            .whereLearningGoalIs()
            .whereEmployeeCompanyIs(company.id)
            .selectAndGroupGoalDueDetails(company.localDate)
            .build();

        const taskQueryBuilder = new EmployeeTaskQueryBuilder(
            dataSource.getRepository(EmployeeTask),
        )
            .innerJoinEmployee()
            .whereEmployeeTaskDueDatesIn(dueDates)
            .whereEmployeeTaskIs()
            .whereEmployeeCompanyIs(company.id)
            .selectAndGroupTaskDueDetails(company.localDate)
            .build();

        const goalsDueList = await goalQueryBuilder.getRawMany();
        const employeeTaskDueList = await taskQueryBuilder.getRawMany();

        const goalAndTaskDueList = merge(goalsDueList, employeeTaskDueList).map(
            (item) => {
                return new EmployeeTaskAndGoalDue(item);
            },
        );

        return goalAndTaskDueList;
    },
};
