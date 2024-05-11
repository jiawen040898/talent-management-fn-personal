import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { EmployeeScoreOutcome } from '../interface';
import { AuditDataEntity } from './audit-data.entity';

@Entity({ name: 'employee_score' })
export class EmployeeScore extends AuditDataEntity {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column({
        type: 'uuid',
    })
    employee_id!: string;

    @Column({
        type: 'uuid',
    })
    participant_id!: string;

    @Column({
        type: 'uuid',
        nullable: true,
    })
    score_recipe_id?: string;

    @Column('simple-json', {
        nullable: true,
    })
    score_outcome?: EmployeeScoreOutcome;

    @Column({
        length: 100,
    })
    score_type!: string;

    @Column({
        type: 'smallint',
    })
    score_dimension!: number;

    @Column({
        type: 'decimal',
        precision: 7,
        nullable: true,
    })
    score?: number | null;

    @Column({
        type: 'decimal',
        precision: 7,
        nullable: true,
    })
    percentile?: number;

    @Column({
        length: 100,
        nullable: true,
    })
    percentile_source?: string;

    @Column({
        length: 10,
        nullable: true,
    })
    percentile_api_version?: string;
}
