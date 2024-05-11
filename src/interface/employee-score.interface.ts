import { EmployeeScoreType } from '../constants';
import { CognitiveScoreOutcomePayload } from './cognitive-score.interface';
import { FitScoreOutcomePayload } from './fit-score.interface';
import { PersonalityScoreOutcomePayload } from './personality-score.interface';

export type EmployeeScoreOutcome =
    | JSON
    | FitScoreOutcomePayload
    | PersonalityScoreOutcomePayload
    | CognitiveScoreOutcomePayload;

export interface PartialScoreOutput {
    score: number | null;
    score_type: EmployeeScoreType;
    score_dimension: number;
}
