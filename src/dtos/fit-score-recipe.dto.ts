import { FitModelType, FrameworkType } from '../constants';

export class Questionnaire {
    questionnaire_id!: number;
    questionnaire_framework!: string;
}

export class FitScoreRecipe {
    weightage!: number;
    ingredient_alias!: string;
    ingredient_group!: string;
    ingredient_framework?: string | null;
    ingredient_attribute?: string | null;
}

export class FitScoreRecipeDto {
    id!: string;
    company_id!: number;
    fit_score_type!: FrameworkType;
    fit_model_type!: FitModelType;
    job_title!: string | null;
    job_competency!: string[];
    recipe!: FitScoreRecipe[];
    questionnaire!: Questionnaire[];
    competency_inclusiveness!: boolean;
    framework_alias!: string | null;
}
