import {
    Auth0Credentials,
    cacheService,
    generatorUtil,
    logger,
    secretService,
} from '@pulsifi/fn';
import { authService } from '@pulsifi/fn/services/auth';
import axios from 'axios';

import * as AWSConfig from '../configs';
import { CacheObject, CompanyModule, CompanyStatus } from '../constants';
import { CompanyLookupDto } from '../dtos';
import { dateUtil } from '../utils';

export class CompanyService {
    private baseApiUrl = `${AWSConfig.alb().dns}/identity/v1.0`;

    async getActiveCompaniesSubscribedToLearningAndByTimezone(
        timezoneList: string[],
    ): Promise<CompanyLookupDto[]> {
        const companyLookupList: CompanyLookupDto[] =
            await this.getCompanyLookup();

        return await this.filterActiveCompaniesSubscribedToLearningAndByTimezone(
            timezoneList,
            companyLookupList,
        );
    }

    async getCompanyLookup(): Promise<CompanyLookupDto[]> {
        try {
            let result;
            const url = `${this.baseApiUrl}/companies/lookup`;
            const cacheKey = CacheObject.COMPANY_LOOKUP;

            result = await cacheService.get<CompanyLookupDto[]>(cacheKey);

            if (result) {
                return result;
            }

            const auth0Secret = await secretService.getSecret<Auth0Credentials>(
                process.env.AUTH0_SM_NAME as string,
            );

            const token = await authService.getMachineToken({
                client_id: auth0Secret.AUTH0_ENTERPRISE_M2M_CLIENT_ID,
                client_secret: auth0Secret.AUTH0_ENTERPRISE_M2M_CLIENT_SECRET,
                audience: `${AWSConfig.auth0().audience}`,
                grant_type: `${AWSConfig.auth0().grantType}`,
                domain: `${AWSConfig.auth0().domain}`,
            });

            result = await axios
                .get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    return response.data.data;
                });

            return result;
        } catch (err) {
            logger.error('Fail to getCompanyLookup', { err });
            throw err;
        }
    }

    async getCompanyById(
        companyId: number,
    ): Promise<CompanyLookupDto | undefined> {
        try {
            const url = `${this.baseApiUrl}/companies/${companyId}`;

            const cacheKey = generatorUtil.cacheKey(
                CacheObject.COMPANY_ID,
                companyId,
            );

            let result = await cacheService.get<CompanyLookupDto>(cacheKey);
            if (result) {
                return result;
            }

            const auth0Secret = await secretService.getSecret<Auth0Credentials>(
                process.env.AUTH0_SM_NAME as string,
            );

            const token = await authService.getMachineToken({
                client_id: auth0Secret.AUTH0_ENTERPRISE_M2M_CLIENT_ID,
                client_secret: auth0Secret.AUTH0_ENTERPRISE_M2M_CLIENT_SECRET,
                audience: `${AWSConfig.auth0().audience}`,
                grant_type: `${AWSConfig.auth0().grantType}`,
                domain: `${AWSConfig.auth0().domain}`,
            });

            result = await axios
                .get(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                })
                .then((response) => {
                    return response.data.data;
                });

            return result;
        } catch (err) {
            logger.error('Fail to getCompanyById', { err });
            throw err;
        }
    }

    private async filterActiveCompaniesSubscribedToLearningAndByTimezone(
        timezoneList: string[],
        companiesList: CompanyLookupDto[],
    ): Promise<CompanyLookupDto[]> {
        return companiesList.filter((company) => {
            const companyMatched =
                !company.is_deleted &&
                company.status === CompanyStatus.ACTIVE &&
                company.products.find(
                    (prd) => prd.module === CompanyModule.TALENT_LEARNING,
                ) &&
                timezoneList.find((tz) => tz === company.timezone);

            if (companyMatched) {
                company.localDate = dateUtil.getCurrentLocalTimeByTimeZone(
                    company.timezone,
                );
            }

            return companyMatched;
        });
    }
}
