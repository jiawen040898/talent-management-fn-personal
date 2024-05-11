import { Employee } from './employee.entity';
import { EmployeeQuestionnaire } from './employee-questionnaire.entity';
import { EmployeeScore } from './employee-score.entity';
import { EmployeeTask } from './employee-task.entity';
import { FeedbackCycle } from './feedback-cycle.entity';
import { FeedbackCycleEmailTemplate } from './feedback-cycle-email-template.entity';
import { FeedbackCycleNotification } from './feedback-cycle-notification.entity';
import { FeedbackCycleReviewee } from './feedback-cycle-reviewee.entity';
import { FeedbackCycleRevieweeRecommendation } from './feedback-cycle-reviewee-recommendation.entity';
import { FeedbackCycleReviewer } from './feedback-cycle-reviewer.entity';
import { LearningGoal } from './learning-goal.entity';
import { Participant } from './participant.entity';
import { Program } from './program.entity';

export const ENTITIES = [
    Employee,
    EmployeeScore,
    Participant,
    LearningGoal,
    EmployeeTask,
    EmployeeQuestionnaire,
    FeedbackCycle,
    FeedbackCycleNotification,
    FeedbackCycleReviewee,
    FeedbackCycleReviewer,
    FeedbackCycleEmailTemplate,
    FeedbackCycleRevieweeRecommendation,
    Program,
];
