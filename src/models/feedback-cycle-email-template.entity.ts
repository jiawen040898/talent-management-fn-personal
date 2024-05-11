import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { AuditDataEntity } from './audit-data.entity';
import { FeedbackCycle } from './feedback-cycle.entity';

export enum EmailCommunicationType {
    EMPLOYEE_FEEDBACK_REVIEWEE_RESPONSE_SUBMISSION_REMINDER = 'employee_feedback_reviewee_response_submission_reminder',
    EMPLOYEE_FEEDBACK_REVIEWER_RESPONSE_SUBMISSION_REMINDER = 'employee_feedback_reviewer_response_submission_reminder',
    EMPLOYEE_FEEDBACK_REVIEWEE_RESPONSE_REQUESTED = 'employee_feedback_reviewee_response_requested',
    EMPLOYEE_FEEDBACK_REVIEWER_RESPONSE_REQUESTED = 'employee_feedback_reviewer_response_requested',
}

@Entity({ name: 'feedback_cycle_email_template' })
export class FeedbackCycleEmailTemplate extends AuditDataEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: 'uuid',
    })
    feedback_cycle_id!: string;

    @Column()
    email_communication_type!: EmailCommunicationType;

    @Column()
    subject!: string;

    @Column()
    body_in_html!: string;

    @Column({
        nullable: true,
    })
    sender_name?: string;

    @Column({
        nullable: true,
    })
    sender_email?: string;

    @Column({
        nullable: true,
    })
    reply_name?: string;

    @Column({
        nullable: true,
    })
    reply_email?: string;

    @ManyToOne(
        () => FeedbackCycle,
        (feedbackCycle) => feedbackCycle.email_templates,
    )
    @JoinColumn({ name: 'feedback_cycle_id' })
    feedbackCycle?: FeedbackCycle;
}
