import { CompanyLookupDto } from './company.dto';

export class CronScheduleMessage {
    company!: CompanyLookupDto[];
    timezone!: string;
    local_hour!: number;
    local_weekday!: number;
    local_timestamp!: string;
    utc_timestamp!: string;
}
