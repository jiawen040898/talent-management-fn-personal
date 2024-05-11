import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { FeedBackCycleRevieweeRecommendationResultMeta } from '../interface';
import { AuditDataEntity } from './audit-data.entity';

export enum RevieweeStatus {
    DRAFT = 'draft',
    PENDING_NOMINATION = 'pending_nomination',
    PENDING_NOMINATION_APPROVAL = 'pending_nomination_approval',
    READY_FOR_FEEDBACK = 'ready_for_feedback',
    FEEDBACK_IN_PROGRESS = 'feedback_in_progress',
    COMPLETED = 'completed',
}
export enum RevieweeApprovedSource {
    SYSTEM = 'system',
    MANAGER = 'manager',
}
@Entity({ name: 'feedback_cycle_reviewee' })
export class FeedbackCycleReviewee extends AuditDataEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'uuid',
    })
    feedback_cycle_id!: string;

    @Column({
        type: 'uuid',
    })
    reviewee_employee_id!: string;

    @Column({
        type: 'uuid',
        nullable: true,
    })
    reviewer_selection_manager_id?: string;

    @Column({
        enum: RevieweeStatus,
        length: 255,
    })
    status!: RevieweeStatus;

    @Column({
        nullable: true,
    })
    reviewer_selection_approved_at?: Date;

    @Column({
        length: 255,
        nullable: true,
    })
    reviewer_selection_approved_source?: RevieweeApprovedSource;

    @Column({
        default: false,
    })
    is_deleted!: boolean;

    @Column({ type: 'simple-json', nullable: true })
    recommendation_result_meta?: FeedBackCycleRevieweeRecommendationResultMeta | null;
}
