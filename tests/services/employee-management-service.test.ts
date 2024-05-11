import { SNSClient } from '@aws-sdk/client-sns';
import { DataSource, Repository } from 'typeorm';

import * as database from '../../src/database';
import { Employee, EmployeeTask, LearningGoal } from '../../src/models';
import { EmployeeManagementService } from '../../src/services/employee-management.service';
import { getTestDataSource } from '../setup';
import { testData } from './fixtures/test-data';

describe('EmployeeManagementService', () => {
    let dataSource: DataSource;
    let employeeRepo: Repository<Employee>;
    let learningGoalRepo: Repository<LearningGoal>;
    let employeeTaskRepo: Repository<EmployeeTask>;

    const spySNSClient = jest
        .spyOn(SNSClient.prototype, 'send')
        .mockImplementation(jest.fn());

    beforeAll(async () => {
        dataSource = await getTestDataSource();

        employeeRepo = dataSource.getRepository(Employee);
        learningGoalRepo = dataSource.getRepository(LearningGoal);
        employeeTaskRepo = dataSource.getRepository(EmployeeTask);

        await employeeRepo.save(testData.employeeList);
        await learningGoalRepo.save(testData.learningGoals);
        await employeeTaskRepo.save(testData.employeeTasks);

        jest.spyOn(database, 'getDataSource').mockImplementation(() => {
            return Promise.resolve(dataSource);
        });
    });

    describe('updateUserAccountId', () => {
        it('should update user account id', async () => {
            // Act
            await EmployeeManagementService.updateUserAccountId(
                testData.testEmployeeUserCreatedEventData,
            );

            // Assert
            const employee = await employeeRepo.findOneBy({
                id: testData.employee1.id,
            });
            expect(employee?.user_account_id).toEqual(
                testData.testEmployeeUserCreatedEventData.id,
            );
        });

        it('should not replace employee that already have user account id', async () => {
            // Act
            await EmployeeManagementService.updateUserAccountId(
                testData.testEmployeeUserCreatedEventData2,
            );

            // Assert
            const employee = await employeeRepo.findOneBy({
                id: testData.employee2.id,
            });
            expect(employee?.user_account_id).toEqual(13);
        });
    });

    describe('getGoalAndTaskDueListByCompany', () => {
        it('should return all employees task and goals due list', async () => {
            // Act
            const actual =
                await EmployeeManagementService.getGoalAndTaskDueListByCompany(
                    testData.mockCompanyLookupData,
                );

            // Assert
            expect(actual).toMatchSnapshot();
        });
    });

    describe('processEmployeeTaskAndGoalByCompany', () => {
        it('should publish message to notification', async () => {
            // Act
            await EmployeeManagementService.processEmployeeTaskAndGoalByCompany(
                testData.mockCompanyLookupData,
            );

            // Assert
            expect(spySNSClient).toHaveBeenCalledTimes(2);
        });
    });
});
