import * as Factory from 'factory.ts';

import { Participant } from '../../../src/models';
import { TestData, testUtil } from '../../setup';

export const testParticipantBuilder = Factory.Sync.makeFactory<Participant>({
    id: Factory.each((i) => testUtil.mockUuid(i + 1)),
    program_id: Factory.each((i) => i + 1),
    company_id: TestData.companyId,
    employee_id: Factory.each((i) => testUtil.mockUuid(i + 1)),
    framework_dimension: 0,
    ...TestData.auditData,
});
