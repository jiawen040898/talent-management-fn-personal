export class IEmployeeUserCreatedEventData {
    employee_id!: string;
    id!: number;
    status?: string;
    email?: string;
    first_name?: string;
    last_name?: string | null;
    ext_tenant?: string;
    ext_user_id?: string | null;
    ext_connection_name?: string | null;
    picture_url?: string | null;
    is_connection_sso?: boolean;
    last_login_at?: Date | null;
    modules_roles?: UserModuleRoleDto[];
}

export class UserModuleRoleDto {
    alias!: string;
    module_type!: string;
    profile_id?: string;
    company_id!: number;
}
