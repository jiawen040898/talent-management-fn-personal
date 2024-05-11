import { DomainOutcome, TraitOutcome } from '@pulsifi/fn';

import { EmployeeScoreType } from '../constants';
import { PartialScoreOutput } from './employee-score.interface';

export type DomainTraitOutcome = DomainOutcome & { traits?: TraitOutcome[] };

export interface FitScoreOutcomePayload {
    personality_result: DomainOutcome[];
    framework_alias?: string | null;
}

export interface CultureFitScore {
    score: number;
    score_outcome: FitScoreOutcomePayload;
    score_type: EmployeeScoreType.CULTURE_FIT;
    score_dimension: number;
}

export interface CultureFitOutcome {
    score: number;
    domainScores: DomainTraitOutcome[];
}

export interface CultureFitScoreOutcome {
    score: number;
    score_outcome: CultureFitOutcome;
}

export interface CultureFitPartialScoreOutput extends PartialScoreOutput {
    score_outcome: FitScoreOutcomePayload;
    score: number;
}

export type ParticipantPartialScoreInput = Omit<
    CultureFitPartialScoreOutput,
    'score_type'
>;
