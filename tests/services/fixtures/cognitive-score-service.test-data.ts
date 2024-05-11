import { EmployeeScoreType } from '../../../src/constants';
import { EmployeeScore } from '../../../src/models';
import { testUtil } from '../../setup/';
import {
    testAssessmentBuilder,
    testEmployeeScoreBuilder,
    testParticipantBuilder,
} from '../builder';

const commonResultRawScore = {
    model_type: 'REASONING',
    domain_name: '',
    domain_order: 1,
    traits: [],
};

const numericAverageAssessmentScores = {
    domain_alias: 'numeric',
    domain_percentile: null,
    domain_score: 0.13043478260869565,
    ingredient_weightage: null,
};

const reasoningNumericAssessmentResult = testAssessmentBuilder.build({
    questionnaire_framework: EmployeeScoreType.REASONING_NUMERIC,
    questionnaire_id: 29,
    result_raw: {
        scores: [
            {
                domain_id: 32,
                ...commonResultRawScore,
                domain_alias: numericAverageAssessmentScores.domain_alias,
                domain_score: numericAverageAssessmentScores.domain_score,
            },
        ],
    },
});

const verbalAverageAssessmentScores = {
    domain_alias: 'verbal',
    domain_percentile: null,
    domain_score: 0.26666666666666666,
    ingredient_weightage: null,
};

const reasoningVerbalAssessmentResult = testAssessmentBuilder.build({
    questionnaire_framework: EmployeeScoreType.REASONING_VERBAL,
    questionnaire_id: 27,
    result_raw: {
        scores: [
            {
                domain_id: 30,
                ...commonResultRawScore,
                domain_alias: verbalAverageAssessmentScores.domain_alias,
                domain_score: verbalAverageAssessmentScores.domain_score,
            },
        ],
    },
});

const logicAverageAssessmentScores = {
    domain_alias: 'logical',
    domain_percentile: null,
    domain_score: 0.2777777777777778,
    ingredient_weightage: null,
};

const reasoningLogicAssessmentResult = testAssessmentBuilder.build({
    questionnaire_framework: EmployeeScoreType.REASONING_LOGIC,
    questionnaire_id: 28,
    result_raw: {
        scores: [
            {
                domain_id: 31,
                ...commonResultRawScore,
                domain_alias: logicAverageAssessmentScores.domain_alias,
                domain_score: logicAverageAssessmentScores.domain_score,
            },
        ],
    },
});

const reasoningAverageAssessmentScores = [
    logicAverageAssessmentScores,
    numericAverageAssessmentScores,
    verbalAverageAssessmentScores,
];

const reasoningAverageForSingleAssessmentScores = [
    logicAverageAssessmentScores,
];

const cognitiveAssessmentResults = [
    reasoningNumericAssessmentResult,
    reasoningVerbalAssessmentResult,
    reasoningLogicAssessmentResult,
];

const commonCognitiveResult = {
    domain_percentile: null,
    ingredient_weightage: null,
};

const employee1Participant1Scores1 = testEmployeeScoreBuilder.build({
    employee_id: testUtil.mockUuid(1),
    participant_id: testUtil.mockUuid(3),
    score_type: EmployeeScoreType.REASONING_NUMERIC,
    score_outcome: {
        cognitive_result: {
            domain_alias: 'numeric',
            domain_score: 0.08695652173913043,
            ...commonCognitiveResult,
        },
    },
});

const employee1Participant1Scores2 = testEmployeeScoreBuilder.build({
    employee_id: testUtil.mockUuid(1),
    participant_id: testUtil.mockUuid(3),
    score_type: EmployeeScoreType.REASONING_VERBAL,
    score_outcome: {
        cognitive_result: {
            domain_alias: 'verbal',
            domain_score: 0.36666666666666664,
            ...commonCognitiveResult,
        },
    },
});

const employee1Participant1Scores3 = testEmployeeScoreBuilder.build({
    employee_id: testUtil.mockUuid(1),
    participant_id: testUtil.mockUuid(1),
    score_type: EmployeeScoreType.REASONING_LOGICAL,
    score_outcome: {
        cognitive_result: {
            domain_alias: 'logical',
            domain_score: 0.2777777777777778,
            ...commonCognitiveResult,
        },
    },
});

const participant = testParticipantBuilder.build();

const entitiesToBeAdded = [
    {
        entityClass: EmployeeScore,
        data: [
            employee1Participant1Scores1,
            employee1Participant1Scores2,
            employee1Participant1Scores3,
        ],
    },
];

export const cognitiveScoreTestData = {
    entitiesToBeAdded,
    participant,
    reasoningNumericAssessmentResult,
    reasoningVerbalAssessmentResult,
    reasoningLogicAssessmentResult,
    cognitiveAssessmentResults,
    reasoningAverageAssessmentScores,
    reasoningAverageForSingleAssessmentScores,
};
