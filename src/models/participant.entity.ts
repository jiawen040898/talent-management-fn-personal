import {
    DecimalColumn,
    IntegerColumn,
    JsonColumn,
    UuidColumn,
} from '@pulsifi/fn/decorators/typeorm';
import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { AuditDataEntity } from './audit-data.entity';
import { Employee } from './employee.entity';
import { Program } from './program.entity';

@Entity({ name: 'participant' })
export class Participant extends AuditDataEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    company_id!: number;

    @Column()
    program_id!: number;

    @UuidColumn()
    employee_id!: string;

    @JsonColumn({
        nullable: true,
    })
    framework_outcome?: JSON;

    @DecimalColumn({ nullable: true })
    framework_score?: number;

    @IntegerColumn({
        nullable: true,
    })
    framework_dimension?: number;

    @Column({
        nullable: true,
    })
    assessment_completed_at?: Date;

    @Column({
        nullable: true,
    })
    person_score_id?: string;

    @ManyToOne(() => Employee, (employee) => employee.id)
    @JoinColumn({ name: 'employee_id' })
    employee?: Employee;

    @ManyToOne(() => Program, (program) => program.id)
    @JoinColumn({ name: 'program_id' })
    program?: Program;
}
