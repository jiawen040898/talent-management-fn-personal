import type { Construct } from 'constructs';

import { CDKEnvironmentVariables } from '../interfaces';
import { commonEnvironmentVariables } from './common.config';

export const config = (scope: Construct): CDKEnvironmentVariables => ({
    ...commonEnvironmentVariables(scope),
    GCP_CLIENT_LIBRARY_CONFIG: JSON.stringify({
        type: 'external_account',
        audience:
            '//iam.googleapis.com/projects/1022584674293/locations/global/workloadIdentityPools/aws-staging/providers/pulsifi-aws-staging',
        subject_token_type: 'urn:ietf:params:aws:token-type:aws4_request',
        service_account_impersonation_url:
            'https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/talent-management-fn@data-staging-warehouse.iam.gserviceaccount.com:generateAccessToken',
        token_url: 'https://sts.googleapis.com/v1/token',
        credential_source: {
            environment_id: 'aws1',
            region_url:
                'http://169.254.169.254/latest/meta-data/placement/availability-zone',
            url: 'http://169.254.169.254/latest/meta-data/iam/security-credentials',
            regional_cred_verification_url:
                'https://sts.{region}.amazonaws.com?Action=GetCallerIdentity&Version=2011-06-15',
        },
    }),
    RECOMMENDATION_API_URL:
        'https://pulsifi-dev--action-recommendation-app.modal.run',
});
