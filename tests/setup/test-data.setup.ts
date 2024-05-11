import { AuditDataEntity } from '../../src/models/audit-data.entity';

const createdBy = 1;
const now = new Date();
const auditData: AuditDataEntity = {
    created_at: now,
    created_by: createdBy,
    updated_at: now,
    updated_by: createdBy,
};

export const TestData = {
    participantId: '746e2174-d10c-4707-989e-5ef21d9e246c',
    employeeId: '846d127e-7adf-4f98-b412-1060e95f8a87',
    companyId: 5,
    personScoreId: '07203235-e4d2-46ba-9096-3f878c66d301',
    jobScoreRecipeId: '6f26e8de-dec2-4fb9-84f6-a6e1fc6d1781',
    personType: 'employee',
    processType: 'program',
    createdBy: 1,
    createdUsername: 'Jay Pete',
    firstName: 'Jay',
    lastName: 'Pete',
    email: 'jaypete@gmail.com',
    now: new Date(),
    auditData,
};
