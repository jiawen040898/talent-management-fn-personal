export class ManagerSubordinateAggregatedReportData {
    company_id!: number;
    company_name!: string;
    company_is_live!: boolean;
    manager_employee_id!: string;
    manager_name!: string;
    manager_first_name!: string;
    manager_email!: string | null;
    manager_user_account_id!: number | null;
    total_action_completed!: number;
    total_action_overdue!: number;
    total_new_action!: number;
    total_goal_completed!: number;
    total_goal_overdue!: number;
    total_new_goal!: number;
    subordinates_summary?: SubordinatesProgressData[];
}

export class SubordinatesProgressData {
    employee_id!: string;
    name!: string;
    overdue_count!: number;
    new_count!: number;
    completed_count!: number;
}
