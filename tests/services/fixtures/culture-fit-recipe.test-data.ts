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

const peopleCentricAliasFramework = [
    {
        ingredient_alias: 'social',
        ingredient_framework: 'work_interest',
    },
    {
        ingredient_alias: 'support',
        ingredient_framework: 'work_value',
    },
    {
        ingredient_alias: 'cooperation',
        ingredient_framework: 'work_style',
    },
    {
        ingredient_alias: 'concern_for_others',
        ingredient_framework: 'work_style',
    },
    {
        ingredient_alias: 'social_orientation',
        ingredient_framework: 'work_style',
    },
];

const cultureFitPeopleCentricIngredientGroup = peopleCentricAliasFramework.map(
    (aliasFramework) => ({
        ...aliasFramework,
        ingredient_group: 'people_centric',
        weightage: 0.2,
    }),
);

const ownershipAliasFramework = [
    {
        ingredient_alias: 'investigative',
        ingredient_framework: 'work_interest',
    },
    {
        ingredient_alias: 'independence',
        ingredient_framework: 'work_value',
    },
    {
        ingredient_alias: 'relationships',
        ingredient_framework: 'work_value',
    },
    {
        ingredient_alias: 'leadership',
        ingredient_framework: 'work_style',
    },
    {
        ingredient_alias: 'integrity',
        ingredient_framework: 'work_style',
    },
];

const cultureFitOwnerIngredientGroup = ownershipAliasFramework.map(
    (aliasFramework) => ({
        ...aliasFramework,
        ingredient_group: 'ownership',
        weightage: 0.2,
    }),
);

const learningAliasFramework = [
    {
        ingredient_alias: 'working_conditions',
        ingredient_framework: 'work_value',
    },
    {
        ingredient_alias: 'achievement_effort',
        ingredient_framework: 'work_style',
    },
    {
        ingredient_alias: 'initiative',
        ingredient_framework: 'work_style',
    },
    {
        ingredient_alias: 'independence',
        ingredient_framework: 'work_style',
    },
];

const cultureFitLearningIngredientGroup = learningAliasFramework.map(
    (aliasFramework) => ({
        ...aliasFramework,
        ingredient_group: 'learning',
        weightage: 0.25,
    }),
);

const avantGardeAliasFramework = [
    {
        ingredient_alias: 'realistic',
        ingredient_framework: 'work_interest',
    },
    {
        ingredient_alias: 'independence',
        ingredient_framework: 'work_value',
    },
    {
        ingredient_alias: 'working_conditions',
        ingredient_framework: 'work_value',
    },
    {
        ingredient_alias: 'adaptability_flexibility',
        ingredient_framework: 'work_style',
    },
    {
        ingredient_alias: 'innovation',
        ingredient_framework: 'work_style',
    },
    {
        ingredient_alias: 'analytical_thinking',
        ingredient_framework: 'work_style',
    },
];

const cultureFitAvantGardeIngredientGroup = avantGardeAliasFramework.map(
    (aliasFramework) => ({
        ...aliasFramework,
        ingredient_group: 'avant_garde',
        weightage: 0.166666667,
    }),
);

const resultsDrivenAliasFramework = [
    {
        ingredient_alias: 'achievement',
        ingredient_framework: 'work_value',
    },
    {
        ingredient_alias: 'recognition',
        ingredient_framework: 'work_value',
    },
    {
        ingredient_alias: 'achievement_effort',
        ingredient_framework: 'work_style',
    },
    {
        ingredient_alias: 'persistence',
        ingredient_framework: 'work_style',
    },
    {
        ingredient_alias: 'dependability',
        ingredient_framework: 'work_style',
    },
];

const cultureFitResultDrivenIngredientGroup = resultsDrivenAliasFramework.map(
    (aliasFramework) => ({
        ...aliasFramework,
        ingredient_group: 'results_driven',
        weightage: 0.2,
    }),
);

const inSyncAliasFramework = [
    {
        ingredient_alias: 'support',
        ingredient_framework: 'work_value',
    },
    {
        ingredient_alias: 'concern_for_others',
        ingredient_framework: 'work_style',
    },
    {
        ingredient_alias: 'self_control',
        ingredient_framework: 'work_style',
    },
    {
        ingredient_alias: 'stress_tolerance',
        ingredient_framework: 'work_style',
    },
];

const cultureFitInSyncIngredientGroup = inSyncAliasFramework.map(
    (aliasFramework) => ({
        ...aliasFramework,
        ingredient_group: 'in_sync',
        weightage: 0.25,
    }),
);

const stakeholderSavvyAliasFramework = [
    {
        ingredient_alias: 'enterprising',
        ingredient_framework: 'work_interest',
    },
    {
        ingredient_alias: 'relationships',
        ingredient_framework: 'work_value',
    },
    {
        ingredient_alias: 'leadership',
        ingredient_framework: 'work_style',
    },
    {
        ingredient_alias: 'social_orientation',
        ingredient_framework: 'work_style',
    },
    {
        ingredient_alias: 'self_control',
        ingredient_framework: 'work_style',
    },
];

const cultureFitStakeholderSavvyIngredientGroup =
    stakeholderSavvyAliasFramework.map((aliasFramework) => ({
        ...aliasFramework,
        ingredient_group: 'stakeholder_savvy',
        weightage: 0.2,
    }));

const recipeAlias = [
    'people_centric',
    'ownership',
    'learning',
    'avant_garde',
    'results_driven',
    'in_sync',
    'stakeholder_savvy',
];

const cultureFitRecipeIngredientGroup = recipeAlias.map((alias) => ({
    ingredient_group: 'recipe',
    ingredient_alias: alias,
    weightage: 0.14285,
    ingredient_attribute: null,
    ingredient_framework: null,
}));

const partialCultureFitRecipe = [
    ...cultureFitPeopleCentricIngredientGroup,
    ...cultureFitOwnerIngredientGroup,
    ...cultureFitLearningIngredientGroup,
    ...cultureFitAvantGardeIngredientGroup,
    ...cultureFitResultDrivenIngredientGroup,
    ...cultureFitInSyncIngredientGroup,
    ...cultureFitStakeholderSavvyIngredientGroup,
];

const fullCultureFitRecipe = [
    ...partialCultureFitRecipe,
    ...cultureFitRecipeIngredientGroup,
];

const validCultureFitScoreRecipe = {
    id: testUtil.mockUuid(2),
    company_id: 5,
    fit_score_type: FrameworkType.CULTURE_FIT,
    fit_model_type: FitModelType.TEMPLATE,
    job_title: 'Software Engineer',
    job_competency: [],
    recipe: fullCultureFitRecipe,
    questionnaire: fullQuestionnaireFrameworks,
    competency_inclusiveness: false,
    framework_alias: 'polaris',
};

export const cultureFitRecipeTestData = {
    validCultureFitScoreRecipe,
};
