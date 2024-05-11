import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { AuditDataEntity } from './audit-data.entity';

export enum ReminderCategory {
    NOMINATION_SUBMISSION = 'nomination_submission',
    NOMINATION_APPROVAL = 'nomination_approval',
    FEEDBACK_SUBMISSION = 'feedback_submission',
}

@Entity({ name: 'feedback_cycle_notification' })
export class FeedbackCycleNotification extends AuditDataEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: 'uuid',
    })
    feedback_cycle_id!: string;

    @Column({
        length: 255,
    })
    category!: ReminderCategory;

    @Column()
    due_before_days!: number;

    @Column()
    due_at!: Date;
}
