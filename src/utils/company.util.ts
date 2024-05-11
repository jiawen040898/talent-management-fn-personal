import { CompanyLookupDto } from '../dtos';

export const companyUtil = {
    filterCompanyWithFeedbackModule(company: CompanyLookupDto[]) {
        return company.filter((c) =>
            c.products.some((p) => p.module === 'talent_management'),
        );
    },

    getCompanyDefaultLocale(company: CompanyLookupDto) {
        return (
            company.locales?.find((i) => i.is_default === true)?.locale ||
            'en-US'
        );
    },
};
