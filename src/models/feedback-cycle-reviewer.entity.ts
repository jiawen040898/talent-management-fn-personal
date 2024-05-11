import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { AuditDataEntity } from './audit-data.entity';

export enum ReviewerStatus {
    DRAFT = 'draft',
    PENDING = 'pending',
    READY = 'ready',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    REJECTED = 'rejected',
}

export enum ReviewerDirection {
    SELF = 'self',
    PEER = 'peer',
    MANAGER = 'manager',
    DIRECT_REPORT = 'direct_report',
    EXTERNAL = 'external',
}

export enum ReviewerSelectSource {
    SYSTEM = 'system',
    ADMIN = 'admin',
    MANAGER = 'manager',
    EMPLOYEE = 'employee',
}

@Entity({ name: 'feedback_cycle_reviewer' })
export class FeedbackCycleReviewer extends AuditDataEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'uuid',
    })
    feedback_cycle_reviewee_id!: string;

    @Column({
        type: 'uuid',
        nullable: true,
    })
    reviewer_employee_id?: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    external_reviewer_name?: string | null;

    @Column({ type: 'varchar', length: 50, nullable: true })
    external_reviewer_email?: string | null;

    @Column({
        length: 255,
    })
    status!: ReviewerStatus;

    @Column({
        length: 255,
    })
    reviewer_direction!: ReviewerDirection;

    @Column({
        length: 255,
    })
    select_source!: ReviewerSelectSource;

    @Column({
        nullable: true,
    })
    started_at?: Date;

    @Column({
        nullable: true,
    })
    completed_at?: Date;

    @Column({
        default: false,
    })
    is_deleted!: boolean;
}
