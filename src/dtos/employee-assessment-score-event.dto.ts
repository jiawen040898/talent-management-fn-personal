export class TalentManagementEmployeeAssessmentsSubmitted {
    company_id!: number;
    program_id!: number;
    participant_id!: string;
    role_fit_recipe_id?: string;
    culture_fit_recipe_id?: string;
    assessments!: AssessmentResult[];
}

export class AssessmentResult {
    id!: number;
    questionnaire_id!: number;
    employee_id!: string;
    questionnaire_framework!:
        | string
        | 'personality'
        | 'work_interest'
        | 'work_value'
        | 'reasoning_logical'
        | 'reasoning_numeric'
        | 'reasoning_verbal';

    started_at?: Date | null;
    completed_at?: Date | null;
    attempts!: number;
    question_answer_raw?: QuestionAnswerRaw | null;
    result_raw?: ResultRaw | null;
}

export class AssessmentDomainResult {
    domain_id!: number;
    domain_alias!: string;
    domain_score!: number;
    domain_percentile?: number;
    domain_name?: string;
    model_type?: string;
    domain_order?: number;
    model_type_id?: number;
    traits?: AssessmentTraitResult[];
}

export class QuestionAnswerRaw {
    answers?: AssessmentAnswer[] | null;
    video_invite?: SafeAny | null;
    video_answers?: SafeAny | null;
}

export class ResultRaw {
    scores?: AssessmentDomainResult[] | null;
}

export class AssessmentTraitResult {
    trait_id!: number;
    trait_score!: number;
    trait_alias!: string;
    trait_percentile?: number;
    trait_order?: number;
}

export class AssessmentAnswer {
    question_code!: number;
    score!: number;
    answer_at?: Date;
}
