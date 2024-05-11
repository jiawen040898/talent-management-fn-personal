import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { AuditDataEntity } from './audit-data.entity';
import { FeedbackCycleEmailTemplate } from './feedback-cycle-email-template.entity';

type ReviewerMinMax = {
    min: number;
    max: number;
};

interface AnswerChoiceSetting {
    choices: {
        label: string;
        value?: string | string[] | number | null;
        description?: string | null;
    }[];
    max_scale?: number;
}

interface ThematicAnalysisFailedReason {
    question: string;
    question_code: string;
    reason: string;
}

export interface FeedbackCycleReportResultMeta {
    group?: {
        [key: string]: string | Date | null | ThematicAnalysisFailedReason[];
    };
    individual?: {
        [key: string]: string | Date | null;
    };
    dashboard?: {
        provisioned_at?: Date;
        feedback_cycle_id_hash?: string;
    };
}

type RatingScaleSetting = AnswerChoiceSetting;

type ReviewerSelectionSetting = {
    selection_by: ReviewerSelectionBy;
    peer_selection?: ReviewerMinMax;
    direct_report_selection?: ReviewerMinMax;
    is_reviewer_selection_approval_enabled: boolean;
    is_auto_approve_reviewer_selection_enabled: boolean;
};

export enum ReviewerSelectionBy {
    ADMIN = 'admin',
    MANAGER = 'manager',
    REVIEWEE = 'reviewee',
}

export enum FeedbackCycleStatus {
    DRAFT = 'draft',
    PENDING = 'pending',
    ACTIVE = 'active',
    CLOSED = 'closed',
    ARCHIVED = 'archived',
}

export enum FeedbackCycleReviewerDirection {
    PEER = 'peer',
    SELF = 'self',
    MANAGER = 'manager',
    DIRECT_REPORT = 'direct_report',
    EXTERNAL = 'external',
}

@Entity({ name: 'feedback_cycle' })
export class FeedbackCycle extends AuditDataEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    company_id!: number;

    @Column({
        enum: FeedbackCycleStatus,
        length: 255,
    })
    status!: FeedbackCycleStatus;

    @Column({
        length: 100,
    })
    name!: string;

    @Column({
        length: 255,
        nullable: true,
    })
    description?: string;

    @Column()
    cycle_start_at!: Date;

    @Column()
    cycle_close_at!: Date;

    @Column()
    feedback_submission_due_at!: Date;

    @Column()
    nomination_submission_due_at!: Date;

    @Column()
    nomination_approval_due_at!: Date;

    @Column({ type: 'simple-array', array: true })
    reviewer_direction!: string[];

    @Column('simple-json', {
        nullable: true,
        default: null,
    })
    reviewer_selection_setting!: ReviewerSelectionSetting;

    @Column('simple-json', {
        nullable: true,
        default: null,
    })
    questionnaire_rating_scale_setting!: RatingScaleSetting | null;

    @OneToMany(
        () => FeedbackCycleEmailTemplate,
        (emailTemplate) => emailTemplate.feedbackCycle,
    )
    email_templates?: FeedbackCycleEmailTemplate[];

    @Column({ type: 'simple-json', nullable: true })
    report_result_meta?: FeedbackCycleReportResultMeta;

    @Column({
        default: false,
    })
    is_deleted!: boolean;
}
