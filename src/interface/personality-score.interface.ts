import { DomainOutcome, TraitOutcome } from '@pulsifi/fn';

import { EmployeeScoreType } from '../constants';
import { PartialScoreOutput } from './employee-score.interface';

export type PersonalityResult<T extends DomainOutcome> = {
    [K in keyof T]: K extends 'domain_weightage' ? T[K] | null : T[K];
};

export class WorkInterestOutcomeDto {
    domain_alias!: string;
    domain_score!: number;
}

export class WorkInterestDto {
    domain_alias!: string;
    domain_score!: number;
    person_codes?: string[][];
    job_codes?: string[];
    outcome!: WorkInterestOutcomeDto[];
    ingredient_weightage?: number;
}

export class PersonalityDomainOutcomeDto {
    domain_id?: number;
    domain_alias!: string;
    domain_score!: number;
    traits?: TraitOutcome[];
    domain_weightage?: number | null;
}

export class PersonalityOutcomeDto {
    domain_alias?: string;
    domain_score?: number;
    outcome!: PersonalityDomainOutcomeDto[];
    ingredient_weightage?: number;
}

export interface PersonalityScoreOutcome {
    score_type: EmployeeScoreType;
    score_outcome: PersonalityOutcomeDto | WorkInterestDto;
}

export interface PersonalityScoreOutcomePayload {
    personality_result:
        | PersonalityDomainOutcomeDto[]
        | WorkInterestOutcomeDto[];
    job_codes?: string[];
    person_codes?: string[][];
}

export interface PersonalityPartialScoreOutput extends PartialScoreOutput {
    score_outcome: PersonalityScoreOutcomePayload;
}
