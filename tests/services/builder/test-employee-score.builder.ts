import * as Factory from 'factory.ts';

import { EmployeeScoreType } from '../../../src/constants';
import { EmployeeScore } from '../../../src/models';
import { TestData, testUtil } from '../../setup';

export const testEmployeeScoreBuilder = Factory.Sync.makeFactory<EmployeeScore>(
    {
        id: Factory.each((i) => i),
        employee_id: Factory.each((i) => testUtil.mockUuid(i + 1)),
        participant_id: Factory.each((i) => testUtil.mockUuid(i + 1)),
        score_outcome: {
            personality_result: [
                {
                    domain_alias: 'achievement_effort',
                    domain_score: 0.6041666666666666,
                    domain_weightage: 0.0627168877854,
                },
                {
                    domain_alias: 'persistence',
                    domain_score: 0.4375,
                    domain_weightage: 0.0645905770991,
                },
            ],
        },
        score_type: EmployeeScoreType.WORK_STYLE,
        score_dimension: 0,
        score: 5.6899214,
        ...TestData.auditData,
    },
);
