export class EmployeeTaskAndGoalDue {
    employee_goals_due_count!: number;
    employee_tasks_due_count!: number;
    employee_id!: string;
    employee_first_name!: string;
    employee_email!: string;
    due_date!: string;
    due_type!: string;
    employee_user_account_id!: number;
    company_id!: number;

    constructor(input: EmployeeTaskAndGoalDue) {
        this.employee_goals_due_count = input.employee_goals_due_count ?? 0;
        this.employee_tasks_due_count = input.employee_tasks_due_count ?? 0;
        this.employee_id = input.employee_id;
        this.employee_first_name = input.employee_first_name;
        this.employee_email = input.employee_email;
        this.due_date = input.due_date;
        this.due_type = input.due_type;
        this.employee_user_account_id = input.employee_user_account_id;
        this.company_id = input.company_id;
    }
}
