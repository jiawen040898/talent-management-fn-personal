import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ActionSource, EmployeeTaskStatus } from '../constants';
import { AuditDataEntity } from './audit-data.entity';

@Entity({ name: 'employee_task' })
export class EmployeeTask extends AuditDataEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    employee_id!: string;

    @Column({
        default: null,
        nullable: true,
    })
    goal_id?: string;

    @Column({
        default: null,
        nullable: true,
    })
    external_enrollment_id?: string;

    @Column({
        default: null,
        nullable: true,
    })
    learning_course_id?: string;

    @Column({
        length: 50,
    })
    task_type!: string;

    @Column({
        default: null,
        nullable: true,
    })
    title?: string;

    @Column({
        length: 2048,
        default: null,
        nullable: true,
    })
    url?: string;

    @Column({
        default: null,
        nullable: true,
    })
    description?: string;

    @Column()
    status!: EmployeeTaskStatus;

    @Column({
        default: null,
        nullable: true,
    })
    started_at?: Date;

    @Column({
        default: null,
        nullable: true,
    })
    due_at?: Date;

    @Column({
        default: null,
        nullable: true,
    })
    completed_at?: Date;

    @Column({
        default: null,
        nullable: true,
    })
    assigned_at?: Date;

    @Column({
        default: null,
        nullable: true,
    })
    assigned_by?: string;

    @Column({
        default: ActionSource.LEARNER,
        enum: ActionSource,
    })
    assigned_source?: ActionSource;

    @Column({
        default: false,
    })
    is_deleted!: boolean;
}
