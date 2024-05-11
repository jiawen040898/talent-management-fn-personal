import * as Factory from 'factory.ts';

import { EmployeeScoreType } from '../../../src/constants';
import { AssessmentResult } from '../../../src/dtos';
import { testUtil } from '../../setup';

export const testAssessmentBuilder = Factory.Sync.makeFactory<AssessmentResult>(
    {
        id: Factory.each((i) => i + 1),
        employee_id: Factory.each((i) => testUtil.mockUuid(i + 1)),
        questionnaire_framework: EmployeeScoreType.PERSONALITY,
        questionnaire_id: 30,
        started_at: new Date(),
        completed_at: new Date(),
        attempts: 1,
        question_answer_raw: {
            answers: [
                {
                    score: 0,
                    answer_at: new Date(),
                    question_code: 154,
                },
                {
                    score: 1,
                    answer_at: new Date(),
                    question_code: 165,
                },
            ],
        },
        result_raw: {
            scores: [
                {
                    traits: [
                        {
                            trait_id: 13,
                            trait_alias: 'imagination',
                            trait_order: 1,
                            trait_score: 0.625,
                        },
                        {
                            trait_id: 14,
                            trait_alias: 'artistic_interests',
                            trait_order: 2,
                            trait_score: 0.75,
                        },
                    ],
                    domain_id: 3,
                    model_type: 'FIVE_FACTOR_MODEL',
                    domain_alias: 'openness_to_experience',
                    domain_order: 1,
                    domain_score: 0.7708333333333334,
                },
            ],
        },
    },
);
