import { EmployeeScoreType } from '../../../src/constants';
import { testAssessmentBuilder, testParticipantBuilder } from '../builder';
import { commonAssessmentTestData } from './common-assessment.test-data';

const workStyleFrameworkQuestionnaire = {
    framework: EmployeeScoreType.PERSONALITY,
    questionnaireId: 30,
    scores: commonAssessmentTestData.workStyleAssessmentScores,
};

const workValueFrameworkQuestionnaire = {
    framework: EmployeeScoreType.WORK_VALUE,
    questionnaireId: 26,
    scores: commonAssessmentTestData.workValueAssessmentScores,
};

const workInterestFrameworkQuestionnaire = {
    framework: EmployeeScoreType.WORK_INTEREST,
    questionnaireId: 25,
    scores: commonAssessmentTestData.workInterestAssessmentScores,
};

const personalityAssessmentResults = [
    workStyleFrameworkQuestionnaire,
    workValueFrameworkQuestionnaire,
    workInterestFrameworkQuestionnaire,
].map((frameworkQuestionnaire) =>
    testAssessmentBuilder.build({
        questionnaire_framework: frameworkQuestionnaire.framework,
        questionnaire_id: frameworkQuestionnaire.questionnaireId,
        result_raw: {
            scores: frameworkQuestionnaire.scores,
        },
    }),
);

const [
    workStyleAssessmentResult,
    workValueAssessmentResult,
    workInterestAssessmentResult,
] = personalityAssessmentResults;

const participant = testParticipantBuilder.build();

export const personalityScoreTestData = {
    personalityAssessmentResults,
    participant,
    workStyleAssessmentResult,
    workValueAssessmentResult,
    workInterestAssessmentResult,
};
