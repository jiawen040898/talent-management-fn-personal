export class Company {
    name!: string;
}
export class FeedbackCycle {
    id!: string;
    name!: string;
    start_date!: string;
    close_date!: string;
    nomination_submission_deadline!: string;
    nomination_approval_deadline!: string;
    feedback_submission_deadline!: string;
}
export class Receiver {
    id!: string;
    employee_id!: string;
    user_account_id!: number;
    first_name!: string;
    last_name?: string;
    full_name!: string;
    email!: string;
}

export class Provider {
    id!: string;
    employee_id!: string;
    user_account_id!: number;
    first_name!: string;
    last_name?: string;
    full_name!: string;
    email!: string;
}

export class Manager {
    employee_id!: string;
    user_account_id!: number;
    first_name!: string;
    last_name?: string;
    full_name!: string;
    email!: string;
}

export class EmailTemplate {
    subject!: string;
    body_in_html!: string;
}

export class CallToAction {
    url!: string;
}

export class EmailSender {
    name!: string;
    email?: string;
}

export class EmailRecipient {
    name!: string;
    email!: string;
}

export class BasicFeedbackEvent {
    company!: Company;
    receiver!: Receiver;
    call_to_action!: CallToAction;
    email_sender!: EmailSender;
}

export class FeedbackEvent extends BasicFeedbackEvent {
    cycle!: FeedbackCycle;
    provider?: Provider;
    manager?: Manager;
    total_nomination!: number;
    email_template?: EmailTemplate;
    email_recipient!: EmailRecipient;
}
