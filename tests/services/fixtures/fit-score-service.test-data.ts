import { DomainFramework } from '@pulsifi/fn';

import { EmployeeScoreType } from '../../../src/constants';
import { testUtil } from '../../setup/';
import { testEmployeeScoreBuilder, testParticipantBuilder } from '../builder';
import { commonAssessmentTestData } from './common-assessment.test-data';

const employee1ScoreReasoningNumeric = testEmployeeScoreBuilder.build({
    employee_id: testUtil.mockUuid(1),
    participant_id: testUtil.mockUuid(3),
    score_type: EmployeeScoreType.REASONING_NUMERIC,
    score_outcome: {
        cognitive_result: {
            domain_alias: 'numeric',
            domain_score: 0.08695652173913043,
            domain_percentile: null,
            ingredient_weightage: null,
        },
    },
});

const employee1ScoreReasoningLogical = testEmployeeScoreBuilder.build({
    employee_id: testUtil.mockUuid(1),
    participant_id: testUtil.mockUuid(3),
    score_type: EmployeeScoreType.REASONING_LOGICAL,
    score_outcome: {
        cognitive_result: {
            domain_alias: 'logical',
            domain_score: 0.2777777777777778,
            domain_percentile: null,
            ingredient_weightage: null,
        },
    },
});

const employee1ScoreReasoningVerbal = testEmployeeScoreBuilder.build({
    employee_id: testUtil.mockUuid(1),
    participant_id: testUtil.mockUuid(3),
    score_type: EmployeeScoreType.REASONING_VERBAL,
    score_outcome: {
        cognitive_result: {
            domain_alias: 'verbal',
            domain_score: 0.36666666666666664,
            domain_percentile: null,
            ingredient_weightage: null,
        },
    },
});

const employee1ScoreWorkStyle = testEmployeeScoreBuilder.build({
    employee_id: testUtil.mockUuid(1),
    participant_id: testUtil.mockUuid(3),
    score_type: EmployeeScoreType.WORK_STYLE,
    score_outcome: {
        personality_result:
            commonAssessmentTestData.workStylePersonalityResult.map(
                (personalityResult) => ({
                    ...personalityResult,
                    traits: [],
                }),
            ),
    },
});

const employee1ScoreWorkValue = testEmployeeScoreBuilder.build({
    employee_id: testUtil.mockUuid(1),
    participant_id: testUtil.mockUuid(3),
    score_type: EmployeeScoreType.WORK_VALUE,
    score_outcome: {
        personality_result:
            commonAssessmentTestData.workValuePersonalityResult.map(
                (personalityResult) => ({
                    ...personalityResult,
                    traits: [],
                }),
            ),
    },
});

const employee1ScoreWorkInterest = testEmployeeScoreBuilder.build({
    employee_id: testUtil.mockUuid(1),
    participant_id: testUtil.mockUuid(3),
    score_type: EmployeeScoreType.WORK_INTEREST,
    score_outcome: {
        personality_result:
            commonAssessmentTestData.workInterestAssessmentScores.map(
                (assessmentScore) => ({
                    domain_alias: assessmentScore.domain_alias,
                    domain_score: assessmentScore.domain_score,
                }),
            ),
        person_codes: [['S', 'C', 'E']],
        job_codes: ['E', 'C', 'S'],
    },
});

const employeeScores = [
    employee1ScoreReasoningNumeric,
    employee1ScoreReasoningLogical,
    employee1ScoreReasoningVerbal,
    employee1ScoreWorkStyle,
    employee1ScoreWorkValue,
    employee1ScoreWorkInterest,
];

const processedDomainScores = [
    {
        domain_alias: 'reasoning_numeric',
        domain_score: 0.08695652173913043,
    },
    {
        domain_alias: 'reasoning_logical',
        domain_score: 0.2777777777777778,
    },
    {
        domain_alias: 'reasoning_verbal',
        domain_score: 0.36666666666666664,
    },
    ...commonAssessmentTestData.workStylePersonalityResult.map(
        (assessment) => ({
            domain_alias: assessment.domain_alias,
            domain_score: assessment.domain_score,
            domain_framework: DomainFramework.WORK_STYLE,
        }),
    ),
    ...commonAssessmentTestData.workValuePersonalityResult.map(
        (assessment) => ({
            domain_alias: assessment.domain_alias,
            domain_score: assessment.domain_score,
            domain_framework: DomainFramework.WORK_VALUE,
        }),
    ),
    ...commonAssessmentTestData.workInterestAssessmentScores.map(
        (assessment) => ({
            domain_alias: assessment.domain_alias,
            domain_score: assessment.domain_score,
            domain_framework: DomainFramework.WORK_INTEREST,
        }),
    ),
];

const participant = testParticipantBuilder.build({
    id: testUtil.mockUuid(4),
    program_id: 4,
});

const score = 1;

const scoreDimension = 1;

const computeCultureFitDomainScores = [
    {
        domain_alias: 'people_centric',
        domain_score: 0.7172222,
        domain_weightage: 0.14285,
        traits: [
            {
                trait_alias: 'social',
                trait_framework: 'work_interest',
                trait_score: 0.8125,
                trait_weightage: 0.2,
            },
            {
                trait_alias: 'support',
                trait_framework: 'work_value',
                trait_score: 0.5861111111111111,
                trait_weightage: 0.2,
            },
            {
                trait_alias: 'cooperation',
                trait_framework: 'work_style',
                trait_score: 0.75,
                trait_weightage: 0.2,
            },
            {
                trait_alias: 'concern_for_others',
                trait_framework: 'work_style',
                trait_score: 0.625,
                trait_weightage: 0.2,
            },
            {
                trait_alias: 'social_orientation',
                trait_framework: 'work_style',
                trait_score: 0.8125,
                trait_weightage: 0.2,
            },
        ],
    },
    {
        domain_alias: 'ownership',
        domain_score: 0.6222937,
        domain_weightage: 0.14285,
        traits: [
            {
                trait_alias: 'investigative',
                trait_framework: 'work_interest',
                trait_score: 0.3125,
                trait_weightage: 0.2,
            },
            {
                trait_alias: 'independence',
                trait_framework: 'work_value',
                trait_score: 0.6956349206349207,
                trait_weightage: 0.2,
            },
            {
                trait_alias: 'relationships',
                trait_framework: 'work_value',
                trait_score: 0.545,
                trait_weightage: 0.2,
            },
            {
                trait_alias: 'leadership',
                trait_framework: 'work_style',
                trait_score: 0.7458333333333333,
                trait_weightage: 0.2,
            },
            {
                trait_alias: 'integrity',
                trait_framework: 'work_style',
                trait_score: 0.8125,
                trait_weightage: 0.2,
            },
        ],
    },
    {
        domain_alias: 'learning',
        domain_score: 0.7294396000000001,
        domain_weightage: 0.14285,
        traits: [
            {
                trait_alias: 'working_conditions',
                trait_framework: 'work_value',
                trait_score: 0.6603174603174603,
                trait_weightage: 0.25,
            },
            {
                trait_alias: 'achievement_effort',
                trait_framework: 'work_style',
                trait_score: 0.8229166666666666,
                trait_weightage: 0.25,
            },
            {
                trait_alias: 'initiative',
                trait_framework: 'work_style',
                trait_score: 0.7678571428571429,
                trait_weightage: 0.25,
            },
            {
                trait_alias: 'independence',
                trait_framework: 'work_style',
                trait_score: 0.6666666666666666,
                trait_weightage: 0.25,
            },
        ],
    },
    {
        domain_alias: 'avant_garde',
        domain_score: 0.6556796,
        domain_weightage: 0.14285,
        traits: [
            {
                trait_alias: 'realistic',
                trait_framework: 'work_interest',
                trait_score: 0.3125,
                trait_weightage: 0.166666667,
            },
            {
                trait_alias: 'independence',
                trait_framework: 'work_value',
                trait_score: 0.6956349206349207,
                trait_weightage: 0.166666667,
            },
            {
                trait_alias: 'working_conditions',
                trait_framework: 'work_value',
                trait_score: 0.6603174603174603,
                trait_weightage: 0.166666667,
            },
            {
                trait_alias: 'adaptability_flexibility',
                trait_framework: 'work_style',
                trait_score: 0.828125,
                trait_weightage: 0.166666667,
            },
            {
                trait_alias: 'innovation',
                trait_framework: 'work_style',
                trait_score: 0.8125,
                trait_weightage: 0.166666667,
            },
            {
                trait_alias: 'analytical_thinking',
                trait_framework: 'work_style',
                trait_score: 0.625,
                trait_weightage: 0.166666667,
            },
        ],
    },
    {
        domain_alias: 'results_driven',
        domain_score: 0.7612103,
        domain_weightage: 0.14285,
        traits: [
            {
                trait_alias: 'achievement',
                trait_framework: 'work_value',
                trait_score: 0.8373015873015873,
                trait_weightage: 0.2,
            },
            {
                trait_alias: 'recognition',
                trait_framework: 'work_value',
                trait_score: 0.7083333333333333,
                trait_weightage: 0.2,
            },
            {
                trait_alias: 'achievement_effort',
                trait_framework: 'work_style',
                trait_score: 0.8229166666666666,
                trait_weightage: 0.2,
            },
            {
                trait_alias: 'persistence',
                trait_framework: 'work_style',
                trait_score: 0.8125,
                trait_weightage: 0.2,
            },
            {
                trait_alias: 'dependability',
                trait_framework: 'work_style',
                trait_score: 0.625,
                trait_weightage: 0.2,
            },
        ],
    },
    {
        domain_alias: 'in_sync',
        domain_score: 0.6944444999999999,
        domain_weightage: 0.14285,
        traits: [
            {
                trait_alias: 'support',
                trait_framework: 'work_value',
                trait_score: 0.5861111111111111,
                trait_weightage: 0.25,
            },
            {
                trait_alias: 'concern_for_others',
                trait_framework: 'work_style',
                trait_score: 0.625,
                trait_weightage: 0.25,
            },
            {
                trait_alias: 'self_control',
                trait_framework: 'work_style',
                trait_score: 0.8375,
                trait_weightage: 0.25,
            },
            {
                trait_alias: 'stress_tolerance',
                trait_framework: 'work_style',
                trait_score: 0.7291666666666666,
                trait_weightage: 0.25,
            },
        ],
    },
    {
        domain_alias: 'stakeholder_savvy',
        domain_score: 0.7319167,
        domain_weightage: 0.14285,
        traits: [
            {
                trait_alias: 'enterprising',
                trait_framework: 'work_interest',
                trait_score: 0.71875,
                trait_weightage: 0.2,
            },
            {
                trait_alias: 'relationships',
                trait_framework: 'work_value',
                trait_score: 0.545,
                trait_weightage: 0.2,
            },
            {
                trait_alias: 'leadership',
                trait_framework: 'work_style',
                trait_score: 0.7458333333333333,
                trait_weightage: 0.2,
            },
            {
                trait_alias: 'social_orientation',
                trait_framework: 'work_style',
                trait_score: 0.8125,
                trait_weightage: 0.2,
            },
            {
                trait_alias: 'self_control',
                trait_framework: 'work_style',
                trait_score: 0.8375,
                trait_weightage: 0.2,
            },
        ],
    },
];

export const fitScoreTestData = {
    employeeScores,
    processedDomainScores,
    participant,
    score,
    scoreDimension,
    computeCultureFitDomainScores,
    employee1ScoreReasoningNumeric,
    employee1ScoreReasoningLogical,
    employee1ScoreReasoningVerbal,
    employee1ScoreWorkStyle,
};
