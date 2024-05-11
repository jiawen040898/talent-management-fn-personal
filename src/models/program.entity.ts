import {
    IntegerColumn,
    JsonColumn,
    SoftDeleteColumn,
    UuidColumn,
} from '@pulsifi/fn/decorators/typeorm';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { Questionnaire } from '../dtos';
import { AuditDataEntity } from './audit-data.entity';

@Entity({ name: 'program' })
export class Program extends AuditDataEntity {
    @PrimaryGeneratedColumn()
    id?: number;

    @IntegerColumn()
    company_id!: number;

    @UuidColumn({
        nullable: true,
    })
    role_fit_recipe_id!: string | null;

    @UuidColumn({
        nullable: true,
    })
    culture_fit_recipe_id!: string | null;

    @Column({
        nullable: true,
    })
    framework_alias!: string;

    @Column({
        nullable: true,
    })
    name!: string;

    @SoftDeleteColumn({
        default: false,
    })
    is_deleted!: boolean;

    @JsonColumn({
        nullable: true,
    })
    assessments!: Questionnaire[];
}
