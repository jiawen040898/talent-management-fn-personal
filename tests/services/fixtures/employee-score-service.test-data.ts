import { EmployeeScoreType } from '../../../src/constants';
import {
    Employee,
    EmployeeScore,
    Participant,
    Program,
} from '../../../src/models';
import { TestData, testUtil } from '../../setup';
import {
    testAssessmentBuilder,
    testEmployeeScoreBuilder,
    testParticipantBuilder,
    testProgramBuilder,
} from '../builder';
import { commonAssessmentTestData } from './common-assessment.test-data';
import { testData } from './test-data';

const workStyleAssessmentResult = testAssessmentBuilder.build({
    questionnaire_framework: EmployeeScoreType.PERSONALITY,
    questionnaire_id: 30,
    result_raw: {
        scores: commonAssessmentTestData.workStyleAssessmentScores,
    },
});

const workValueAssessmentResult = testAssessmentBuilder.build({
    questionnaire_framework: EmployeeScoreType.WORK_VALUE,
    questionnaire_id: 26,
    result_raw: {
        scores: commonAssessmentTestData.workValueAssessmentScores,
    },
});

const workInterestAssessmentResult = testAssessmentBuilder.build({
    questionnaire_framework: EmployeeScoreType.WORK_INTEREST,
    questionnaire_id: 25,
    result_raw: {
        scores: commonAssessmentTestData.workInterestAssessmentScores,
    },
});

const personalityAssessmentResults = [
    workStyleAssessmentResult,
    workValueAssessmentResult,
    workInterestAssessmentResult,
];

const employee = {
    id: TestData.employeeId,
    user_account_id: TestData.createdBy,
    company_id: TestData.companyId,
    first_name: TestData.firstName,
    last_name: TestData.lastName,
    work_email: TestData.email,
    created_by: TestData.createdBy,
    updated_by: TestData.createdBy,
};

const employee2 = {
    id: testUtil.mockUuid(1),
    user_account_id: TestData.createdBy,
    company_id: TestData.companyId,
    first_name: TestData.firstName,
    last_name: TestData.lastName,
    work_email: TestData.email,
    created_by: TestData.createdBy,
    updated_by: TestData.createdBy,
};

const employee3 = {
    id: testUtil.mockUuid(2),
    user_account_id: TestData.createdBy,
    company_id: TestData.companyId,
    first_name: TestData.firstName,
    last_name: TestData.lastName,
    work_email: TestData.email,
    created_by: TestData.createdBy,
    updated_by: TestData.createdBy,
};

const participant = testParticipantBuilder.build({
    program_id: 2,
    employee_id: employee2.id,
});

const reasoningNumericAssessmentResult = testAssessmentBuilder.build({
    questionnaire_framework: EmployeeScoreType.REASONING_NUMERIC,
    questionnaire_id: 29,
    result_raw: {
        scores: [
            {
                traits: [],
                domain_id: 32,
                model_type: 'REASONING',
                domain_name: '',
                domain_alias: 'numeric',
                domain_order: 1,
                domain_score: 0.13043478260869565,
            },
        ],
    },
});

const reasoningVerbalAssessmentResult = testAssessmentBuilder.build({
    questionnaire_framework: EmployeeScoreType.REASONING_VERBAL,
    questionnaire_id: 27,
    result_raw: {
        scores: [
            {
                traits: [],
                domain_id: 30,
                model_type: 'REASONING',
                domain_name: '',
                domain_alias: 'verbal',
                domain_order: 1,
                domain_score: 0.26666666666666666,
            },
        ],
    },
});

const reasoningLogicAssessmentResult = testAssessmentBuilder.build({
    questionnaire_framework: EmployeeScoreType.REASONING_LOGIC,
    questionnaire_id: 28,
    result_raw: {
        scores: [
            {
                traits: [],
                domain_id: 31,
                model_type: 'REASONING',
                domain_name: '',
                domain_alias: 'logical',
                domain_order: 1,
                domain_score: 0.2777777777777778,
            },
        ],
    },
});

const cognitiveAssessmentResults = [
    reasoningNumericAssessmentResult,
    reasoningVerbalAssessmentResult,
    reasoningLogicAssessmentResult,
];

const employee1ScoreReasoningNumeric = testEmployeeScoreBuilder.build({
    employee_id: testUtil.mockUuid(1),
    participant_id: participant.id,
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
    participant_id: participant.id,
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
    participant_id: participant.id,
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
    participant_id: participant.id,
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
    participant_id: participant.id,
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
    participant_id: participant.id,
    score_type: EmployeeScoreType.WORK_INTEREST,
    score_outcome: {
        personality_result:
            commonAssessmentTestData.workInterestAssessmentScores.map(
                (assessment) => ({
                    domain_alias: assessment.domain_alias,
                    domain_score: assessment.domain_score,
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

const participant2 = testParticipantBuilder.build({
    id: TestData.participantId,
    company_id: TestData.companyId,
    program_id: testData.program.id,
    employee_id: employee.id,
    created_by: TestData.createdBy,
});

const participant3 = testParticipantBuilder.build({
    program_id: 3,
    employee_id: employee3.id,
});

const participants = [participant, participant2, participant3];

const program = testProgramBuilder.build({
    id: testData.program.id,
    company_id: testData.program.company_id,
    name: 'Test Program',
    culture_fit_recipe_id: testData.program.culture_fit_recipe_id,
});

const program2 = testProgramBuilder.build({
    id: 2,
    company_id: TestData.companyId,
    name: 'Test Program 2',
    culture_fit_recipe_id: testUtil.mockUuid(1),
});

const program3 = testProgramBuilder.build({
    id: 3,
    company_id: TestData.companyId,
    name: 'Test Program 3',
    culture_fit_recipe_id: null,
});

const programs = [program, program2, program3];

const ingredientFrameworkRecipe = [
    {
        weightage: 0.09207718553512945,
        ingredient_alias: 'interest_riasec',
        ingredient_group: 'recipe',
        ingredient_attribute: 'E,C,S',
        ingredient_framework: 'pulsifi_default',
    },
    {
        weightage: 0.08722741433021806,
        ingredient_alias: 'reasoning_verbal',
        ingredient_group: 'recipe',
        ingredient_framework: 'pulsifi_default',
    },
    {
        weightage: 0.0910273527095957,
        ingredient_alias: 'reasoning_logical',
        ingredient_group: 'recipe',
        ingredient_framework: 'pulsifi_default',
    },
    {
        weightage: 0.07664920749032898,
        ingredient_alias: 'reasoning_numeric',
        ingredient_group: 'recipe',
        ingredient_framework: 'pulsifi_default',
    },
    {
        weightage: 0.09207718553512945,
        ingredient_alias: 'work_style',
        ingredient_group: 'recipe',
        ingredient_framework: 'pulsifi_default',
    },
    {
        weightage: 0.09207718553512945,
        ingredient_alias: 'work_value',
        ingredient_group: 'recipe',
        ingredient_framework: 'pulsifi_default',
    },
];

const entitiesToBeAdded = [
    {
        entityClass: EmployeeScore,
        data: employeeScores,
    },
    {
        entityClass: Employee,
        data: [employee, employee2, employee3],
    },
    {
        entityClass: Program,
        data: programs,
    },
    {
        entityClass: Participant,
        data: participants,
    },
];

export const employeeScoreTestData = {
    entitiesToBeAdded,
    personalityAssessmentResults,
    cognitiveAssessmentResults,
    participant,
    participant3,
    workStyleAssessmentResult,
    workValueAssessmentResult,
    workInterestAssessmentResult,
    employeeScores,
    program,
    program2,
    ingredientFrameworkRecipe,
};
