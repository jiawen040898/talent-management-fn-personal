import { FitScoreRecipe } from 'src/dtos';

import {
    EmployeeScoreType,
    FitModelType,
    FrameworkType,
} from '../../../src/constants';
import { testUtil } from '../../setup';

const fullQuestionnaireFrameworks = [
    {
        questionnaire_id: 25,
        questionnaire_framework: EmployeeScoreType.WORK_INTEREST,
    },
    {
        questionnaire_id: 26,
        questionnaire_framework: EmployeeScoreType.WORK_VALUE,
    },
    {
        questionnaire_id: 27,
        questionnaire_framework: EmployeeScoreType.REASONING_VERBAL,
    },
    {
        questionnaire_id: 28,
        questionnaire_framework: EmployeeScoreType.REASONING_LOGIC,
    },
    {
        questionnaire_id: 29,
        questionnaire_framework: EmployeeScoreType.REASONING_NUMERIC,
    },
    {
        questionnaire_id: 30,
        questionnaire_framework: EmployeeScoreType.PERSONALITY,
    },
];

const roleFitInterestRiasec = {
    weightage: 0.09207718553512945,
    ingredient_alias: 'interest_riasec',
    ingredient_group: 'recipe',
    ingredient_attribute: 'E,C,S',
};

const workStyleIngredientAliasWeightage = [
    {
        weightage: 0.06271626297577854,
        ingredient_alias: 'achievement_effort',
    },
    {
        weightage: 0.06459054209919263,
        ingredient_alias: 'persistence',
    },
    {
        weightage: 0.06891580161476356,
        ingredient_alias: 'initiative',
    },
    {
        weightage: 0.0658881199538639,
        ingredient_alias: 'leadership',
    },
    {
        weightage: 0.06271626297577854,
        ingredient_alias: 'cooperation',
    },
    {
        weightage: 0.05392156862745098,
        ingredient_alias: 'concern_for_others',
    },
    {
        weightage: 0.05521914648212226,
        ingredient_alias: 'social_orientation',
    },
    {
        weightage: 0.061995386389850055,
        ingredient_alias: 'self_control',
    },
    {
        weightage: 0.0651672433679354,
        ingredient_alias: 'stress_tolerance',
    },
    {
        weightage: 0.0658881199538639,
        ingredient_alias: 'adaptability_flexibility',
    },
    {
        weightage: 0.0658881199538639,
        ingredient_alias: 'dependability',
    },
    {
        weightage: 0.0589677047289504,
        ingredient_alias: 'attention_to_detail',
    },
    {
        weightage: 0.06689734717416378,
        ingredient_alias: 'integrity',
    },
    {
        weightage: 0.061995386389850055,
        ingredient_alias: 'independence',
    },
    {
        weightage: 0.059544405997693194,
        ingredient_alias: 'innovation',
    },
    {
        weightage: 0.05968858131487889,
        ingredient_alias: 'analytical_thinking',
    },
];

const roleFitWorkStyleIngredientGroup = workStyleIngredientAliasWeightage.map(
    (aliasWeightage) => ({
        ...aliasWeightage,
        ingredient_group: 'work_style',
        ingredient_attribute: null,
        ingredient_framework: null,
    }),
);

const workValueIngredientAliasWeightage = [
    {
        weightage: 0.17475409836065575,
        ingredient_alias: 'achievement',
    },
    {
        weightage: 0.1859016393442623,
        ingredient_alias: 'independence',
    },
    {
        weightage: 0.15311475409836064,
        ingredient_alias: 'recognition',
    },
    {
        weightage: 0.13114754098360656,
        ingredient_alias: 'relationships',
    },
    {
        weightage: 0.17475409836065575,
        ingredient_alias: 'support',
    },
    {
        weightage: 0.18032786885245902,
        ingredient_alias: 'working_conditions',
    },
];

const roleFitWorkValueIngredientGroup = workValueIngredientAliasWeightage.map(
    (aliasWeightage) => ({
        ...aliasWeightage,
        ingredient_group: 'work_value',
        ingredient_attribute: null,
        ingredient_framework: null,
    }),
);

const recipeIngredientAliasWeightage = [
    {
        weightage: 0.08722741433021806,
        ingredient_alias: 'reasoning_verbal',
    },
    {
        weightage: 0.0910273527095957,
        ingredient_alias: 'reasoning_logical',
    },
    {
        weightage: 0.07664920749032898,
        ingredient_alias: 'reasoning_numeric',
    },
    {
        weightage: 0.09207718553512945,
        ingredient_alias: 'work_style',
    },
    {
        weightage: 0.09207718553512945,
        ingredient_alias: 'work_value',
    },
];

const roleFitRecipeIngredientGroup = [
    ...recipeIngredientAliasWeightage.map((aliasWeightage) => ({
        ...aliasWeightage,
        ingredient_group: 'recipe',
        ingredient_attribute: null,
        ingredient_framework: null,
    })),
    roleFitInterestRiasec,
];

const fullRoleFitRecipe: FitScoreRecipe[] = [
    ...roleFitWorkStyleIngredientGroup,
    ...roleFitWorkValueIngredientGroup,
    ...roleFitRecipeIngredientGroup,
];

const validRoleFitScoreRecipe = {
    id: testUtil.mockUuid(1),
    company_id: 5,
    fit_score_type: FrameworkType.ROLE_FIT,
    fit_model_type: FitModelType.TEMPLATE,
    job_title: 'Software Engineer',
    job_competency: [],
    recipe: fullRoleFitRecipe,
    questionnaire: fullQuestionnaireFrameworks,
    competency_inclusiveness: false,
    framework_alias: 'polaris',
};

export const roleFitRecipeTestData = {
    validRoleFitScoreRecipe,
};
