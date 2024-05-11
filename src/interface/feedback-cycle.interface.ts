export interface FeedbackEmailTemplate {
    subject: string;
    body_in_html: string;
}

export interface FeedbackRecommendation {
    company_id?: number;
    company_name?: string;
    reviewee_user_account_id: number;
    reviewee_id: string;
    reviewee_employee_id: string;
    reviewee_email: string;
    reviewee_first_name: string;
    reviewee_last_name: string;
}

export interface FeedbackNomination {
    company_id?: number;
    company_name: string;
    feedback_cycle_id: string;
    feedback_cycle_name: string;
    feedback_cycle_start_date: Date;
    feedback_cycle_close_date: Date;
    nomination_submission_deadline: Date;
    nomination_approval_deadline: Date;
    feedback_submission_deadline: Date;
    reviewee_user_account_id: number;
    reviewee_id: string;
    reviewee_employee_id: string;
    reviewee_status: string;
    reviewee_email: string;
    reviewee_first_name: string;
    reviewee_last_name: string;
    manager_id: string;
    manager_user_account_id: number;
    manager_email: string;
    manager_first_name: string;
    manager_last_name: string;
    deadline: string;
    total_nomination: number;
    is_auto_approve_reviewer_selection_enabled: boolean;
}

export interface FeedbackResponse {
    company_name: string;
    feedback_cycle_id: string;
    feedback_cycle_name: string;
    feedback_cycle_start_date: Date;
    feedback_cycle_close_date: Date;
    nomination_submission_deadline: Date;
    nomination_approval_deadline: Date;
    feedback_submission_deadline: Date;
    reviewer_user_account_id: number;
    reviewer_id: string;
    reviewer_employee_id: string;
    reviewer_status: string;
    reviewer_direction: string;
    reviewer_email: string;
    reviewer_first_name: string;
    reviewer_last_name: string;
    reviewee_id: string;
    reviewee_employee_id: string;
    reviewee_user_account_id: number;
    reviewee_email: string;
    reviewee_first_name: string;
    reviewee_last_name: string;
    external_reviewer_name: string | null;
    external_reviewer_email: string | null;
    deadline: string;
    notification_category: string;
    notification_due_date: string;
    email_template?: FeedbackEmailTemplate;
}
