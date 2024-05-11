import {
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
} from 'typeorm';

import { FeedbackCycleRevieweeRecommendationRecommendationDimension } from '../constants';
import {
    FeedbackCycleRevieweeRecommendationActions,
    FeedbackCycleRevieweeRecommendationQuestionMeta,
    FeedbackCycleRevieweeRecommendationResources,
    FeedbackCycleRevieweeRecommendationSkills,
} from '../interface';
import { AuditDataEntity } from './audit-data.entity';
import { FeedbackCycle } from './feedback-cycle.entity';
import { FeedbackCycleReviewee } from './feedback-cycle-reviewee.entity';

@Entity({ name: 'feedback_cycle_reviewee_recommendation' })
export class FeedbackCycleRevieweeRecommendation extends AuditDataEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        type: 'uuid',
    })
    feedback_cycle_id!: string;

    @Column({
        type: 'uuid',
    })
    feedback_cycle_reviewee_id!: string;

    @Column()
    feedback_cycle_question_id!: number;

    @Column({ nullable: true })
    dimension_type?: number;

    @Column({
        enum: FeedbackCycleRevieweeRecommendationRecommendationDimension,
    })
    recommendation_dimension!: FeedbackCycleRevieweeRecommendationRecommendationDimension;

    @Column({
        default: 0,
        type: 'decimal',
        precision: 10,
        scale: 7,
        nullable: true,
    })
    score?: number | null;

    @Column({ type: 'simple-json', nullable: true })
    action?: FeedbackCycleRevieweeRecommendationActions[] | null;

    @Column({ type: 'simple-json', nullable: true })
    resource_book?: FeedbackCycleRevieweeRecommendationResources[] | null;

    @Column({ type: 'simple-json', nullable: true })
    resource_course?: FeedbackCycleRevieweeRecommendationResources[] | null;

    @Column({ type: 'simple-json', nullable: true })
    skill?: FeedbackCycleRevieweeRecommendationSkills[] | null;

    @Column({ type: 'simple-json', nullable: true })
    question_meta?: FeedbackCycleRevieweeRecommendationQuestionMeta | null;

    @Column({
        default: false,
    })
    is_deleted!: boolean;

    @ManyToOne(() => FeedbackCycle, (feedbackCycle) => feedbackCycle.id)
    @JoinColumn({ name: 'feedback_cycle_id' })
    feedback_cycle?: FeedbackCycle;

    @ManyToOne(() => FeedbackCycleReviewee, (reviewee) => reviewee.id)
    @JoinColumn({ name: 'feedback_cycle_reviewee_id' })
    reviewee?: FeedbackCycleReviewee;
}
