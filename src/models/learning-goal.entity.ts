import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { ActionSource } from '../constants';
import { AuditDataEntity } from './audit-data.entity';

@Entity({ name: 'learning_goal' })
export class LearningGoal extends AuditDataEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    employee_id!: string;

    @Column({
        nullable: true,
    })
    title?: string;

    @Column({
        nullable: true,
    })
    description?: string;

    @Column({
        nullable: true,
    })
    due_at?: Date;

    @Column({ type: Date, nullable: true })
    completed_at?: Date | null;

    @Column({
        type: 'text',
        array: true,
        nullable: true,
    })
    tags?: string[];

    @Column({
        default: false,
    })
    is_deleted!: boolean;

    @Column({
        nullable: true,
    })
    assigned_by?: string;

    @Column({
        nullable: true,
    })
    assigned_username?: string;

    @Column({
        default: ActionSource.LEARNER,
        enum: ActionSource,
    })
    assigned_source?: ActionSource;
}
