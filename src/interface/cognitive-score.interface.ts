import { EmployeeScoreType } from '../constants';
import { PartialScoreOutput } from './employee-score.interface';

export class CognitiveOutcomeDto {
    domain_alias?: string;
    domain_score!: number;
    domain_percentile!: number | null;
    ingredient_weightage?: number | null;
}

export type CognitiveResult = {
    [K in keyof CognitiveOutcomeDto]?: CognitiveOutcomeDto[K] | null;
};

export interface CognitiveScoreOutcome {
    score_type: EmployeeScoreType;
    outcome: CognitiveOutcomeDto;
}

export interface CognitiveScoreOutcomePayload {
    cognitive_result: CognitiveOutcomeDto;
}

export interface CognitivePartialScoreOutput extends PartialScoreOutput {
    score_outcome: CognitiveScoreOutcomePayload;
    score: number;
}
