import {
    DateTimeColumn,
    IntegerColumn,
    JsonColumn,
} from '@pulsifi/fn/decorators/typeorm';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { QuestionnaireFramework } from '../constants';
import { AuditDataEntity } from './audit-data.entity';
import { Employee } from './employee.entity';

export interface PersonalityTrait {
    trait_id: number;
    trait_score: number;
    trait_alias: string;
    trait_percentile?: number;
    trait_order: number;
}

export interface PersonalityBase {
    domain_id: number;
    domain_alias: string;
    domain_score: number;
    domain_percentile?: number;
}

export interface PersonalityDomain extends PersonalityBase {
    domain_order: number;
    domain_name?: string;
    model_type_id?: number;
    model_type?: string;
    traits: PersonalityTrait[];
}

export class QuestionAnswerRawDto {
    question_codes?: number[];
    scores?: ScoreDto[] | null;
    answers?: ScoreDto[] | null;
}

export class ScoreDto {
    question_code!: number;
    score!: number;
    answer_at?: Date;
}

export class ResultRawDto {
    scores?: PersonalityDomain[];
}

@Entity({ name: 'employee_questionnaire' })
export class EmployeeQuestionnaire extends AuditDataEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    employee_id!: string;

    @Column({
        nullable: true,
        default: null,
        length: 100,
        enum: QuestionnaireFramework,
    })
    framework?: string;

    @IntegerColumn()
    questionnaire_id!: number;

    @DateTimeColumn({
        nullable: true,
    })
    started_at?: Date;

    @DateTimeColumn({
        nullable: true,
    })
    completed_at?: Date;

    @IntegerColumn()
    attempts!: number;

    @JsonColumn({ nullable: true })
    question_answer_raw!: QuestionAnswerRawDto | null;

    @JsonColumn({
        nullable: true,
    })
    result_raw!: ResultRawDto | null;

    @Column({
        length: 5,
    })
    api_version!: string;

    @IntegerColumn({
        nullable: true,
    })
    duration_minutes?: number | null;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
    })
    language?: string | null;

    @Column({
        default: false,
    })
    is_expired!: boolean;

    @ManyToOne(() => Employee, (employee) => employee.id)
    @JoinColumn({ name: 'employee_id' })
    employee?: Employee;
}
