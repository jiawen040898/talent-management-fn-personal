import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { AuditDataEntity } from './audit-data.entity';

export enum UserAccountStatus {
    ACTIVE = 'active',
    PENDING = 'pending',
    DISABLED = 'disabled',
    NOT_INVITED = 'not_invited',
}

@Entity({ name: 'employee' })
export class Employee extends AuditDataEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({
        default: 0,
    })
    user_account_id?: number;

    @Column()
    company_id!: number;

    @Column({
        length: 100,
    })
    first_name!: string;

    @Column({
        length: 100,
    })
    last_name!: string;

    @Column({
        length: 255,
    })
    work_email!: string;

    @Column({
        enum: UserAccountStatus,
        default: UserAccountStatus.ACTIVE,
    })
    status!: UserAccountStatus;
}
