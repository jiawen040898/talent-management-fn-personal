import { logger } from '@pulsifi/fn';

import {
    EmployeeScoreType,
    IngredientAliasType,
    PersonalityCognitiveScoreDomainAlias,
} from '../constants';
import { EmployeeScoreOutcome } from '../interface';
import { EmployeeScore, Participant } from '../models';

export const employeeScoreMapper = {
    mapEmployeeScore(
        participant: Participant,
        employeeScore: EmployeeScore | null,
        employeeScoreType: EmployeeScoreType,
        scoreValue: number | null,
        scoreOutcome: EmployeeScoreOutcome,
        jobScoreRecipeId: string,
        updatedBy: number,
    ): EmployeeScore {
        const output: EmployeeScore = {
            employee_id: participant.employee_id,
            participant_id: participant.id,
            score: scoreValue,
            score_outcome: scoreOutcome,
            score_recipe_id: jobScoreRecipeId,
            score_type: employeeScoreType,
            score_dimension: 0,
            created_by: employeeScore ? employeeScore.created_by : updatedBy,
            updated_by: updatedBy,
        };

        output.id = employeeScore?.id;

        return output;
    },

    mapEmployeeCognitiveScoreType(
        personalityScoreType: PersonalityCognitiveScoreDomainAlias,
    ): EmployeeScoreType {
        let scoreType = null;
        switch (personalityScoreType) {
            case PersonalityCognitiveScoreDomainAlias.LOGICAL:
                scoreType = EmployeeScoreType.REASONING_LOGICAL;
                break;

            case PersonalityCognitiveScoreDomainAlias.NUMERIC:
                scoreType = EmployeeScoreType.REASONING_NUMERIC;
                break;

            case PersonalityCognitiveScoreDomainAlias.VERBAL:
                scoreType = EmployeeScoreType.REASONING_VERBAL;
                break;

            case PersonalityCognitiveScoreDomainAlias.REASONING_AVG:
                scoreType = EmployeeScoreType.REASONING_AVG;
                break;
            default:
                logger.error('No employee cognitive score type found.', {
                    data: personalityScoreType,
                });
                throw new Error('No employee cognitive score type found.');
        }

        return scoreType;
    },

    mapEmployeeScoreType(alias: IngredientAliasType): EmployeeScoreType {
        switch (alias) {
            case IngredientAliasType.HARD_SKILLS:
                return EmployeeScoreType.HARD_SKILL;

            case IngredientAliasType.INTEREST_RIASEC:
                return EmployeeScoreType.WORK_INTEREST;

            default:
                return alias as unknown as EmployeeScoreType;
        }
    },
};
