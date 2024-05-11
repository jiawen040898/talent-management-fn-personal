import { EmployeeScore, Participant } from '../models';
import { FitScoreRecipe } from './fit-score-recipe.dto';

export class TalentManagementEmployeeAssessmentScoreCalculated {
    recipe_id!: string;
    scores!: EmployeeScore[];
    recipe!: Recipe;
    participant!: Participant;
}

export class Recipe {
    framework_alias?: string | null;
    recipe!: FitScoreRecipe[];
}
