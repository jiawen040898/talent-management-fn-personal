import * as Factory from 'factory.ts';

import { QuestionnaireFramework } from '../../../src/constants';
import { Program } from '../../../src/models';
import { TestData } from '../../setup';

export const testProgramBuilder = Factory.Sync.makeFactory<Program>({
    id: Factory.each((i) => i),
    company_id: TestData.companyId,
    name: 'Leadership Supremacy',
    role_fit_recipe_id: '',
    culture_fit_recipe_id: '',
    framework_alias: 'polaris',
    assessments: [
        {
            questionnaire_framework: QuestionnaireFramework.PERSONALITY,
            questionnaire_id: 30,
        },
        {
            questionnaire_framework: QuestionnaireFramework.WORK_VALUE,
            questionnaire_id: 26,
        },
        {
            questionnaire_framework: QuestionnaireFramework.WORK_INTEREST,
            questionnaire_id: 25,
        },
        {
            questionnaire_framework: QuestionnaireFramework.REASONING_LOGIC,
            questionnaire_id: 28,
        },
        {
            questionnaire_framework: QuestionnaireFramework.REASONING_NUMERIC,
            questionnaire_id: 29,
        },
        {
            questionnaire_framework: QuestionnaireFramework.REASONING_VERBAL,
            questionnaire_id: 27,
        },
    ],
    is_deleted: false,
    ...TestData.auditData,
});
