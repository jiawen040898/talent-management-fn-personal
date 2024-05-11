export interface IEventModel<T> {
    event_type: string;
    company_id: number;
    user_account_id: number;
    timestamp?: Date;
    event_id: string;
    data: T;
}

export interface IApplicationWithdraw {
    company_id: number;
    job_application_id: string;
    job_id: string;
    job_title: string;
    withdrawn_reason: string;
    withdrawn_at: Date;
}

export interface ICompanyCreated {
    company_id: number;
    company_name: string;
}

export interface FeedbackCycleClosed {
    feedback_cycle_id: string;
    company_id: number;
}
