import { CompanyStatus } from '../constants';

export class CompanyLookupDto {
    id!: number;
    name!: string;
    timezone!: string;
    is_deleted!: boolean;
    products!: CompanyProduct[];
    locales?: CompanyLocale[];
    status!: CompanyStatus;
    localDate!: string;
}

export class CompanyLocale {
    locale!: string;
    is_default!: boolean;
}

export class CompanyProduct {
    module!: string;
}
