import { Repository } from 'typeorm';

import { DueType } from '../constants';
import { Employee, LearningGoal } from '../models';
import { BaseQueryBuilder } from './base-query.builder';

export class LearningGoalQueryBuilder extends BaseQueryBuilder<LearningGoal> {
    constructor(repository: Repository<LearningGoal>) {
        super(repository, 'goal');
    }

    innerJoinEmployee(): LearningGoalQueryBuilder {
        this.builder.innerJoin(
            Employee,
            'employee',
            `${this.alias}.employee_id = employee.id`,
        );

        return this;
    }

    whereLearningGoalDueDatesIn(dueDates: string[]): LearningGoalQueryBuilder {
        this.builder.andWhere(`Date(${this.alias}.due_at) IN (:...dueDates)`, {
            dueDates,
        });

        return this;
    }

    whereLearningGoalIs(): LearningGoalQueryBuilder {
        this.builder.andWhere(
            `${this.alias}.is_deleted = false AND ${this.alias}.completed_at IS NULL`,
        );

        return this;
    }

    whereEmployeeCompanyIs(companyId: number): LearningGoalQueryBuilder {
        this.builder.andWhere(`employee.company_id = :company_id`, {
            company_id: companyId,
        });

        return this;
    }

    selectAndGroupGoalDueDetails(dueDate: string): LearningGoalQueryBuilder {
        this.builder
            .select(
                `
                COUNT(${this.alias}.id) as employee_goals_due_count,
                ${this.alias}.employee_id, 
                employee.first_name AS employee_first_name, 
                employee.work_email AS employee_email,
                employee.user_account_id AS employee_user_account_id,
                employee.company_id, 
                ${this.alias}.due_at AS due_date,
                CASE WHEN Date(${this.alias}.due_at) = '${dueDate}' THEN '${DueType.TODAY}' ELSE '${DueType.IN_3_DAYS}' END AS due_type`,
            )
            .groupBy(
                `${this.alias}.employee_id, employee.first_name, employee.work_email, employee.user_account_id, employee.company_id, ${this.alias}.due_at`,
            );

        return this;
    }
}
