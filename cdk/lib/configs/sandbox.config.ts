import type { Construct } from 'constructs';

import { CDKEnvironmentVariables } from '../interfaces';
import { commonEnvironmentVariables } from './common.config';

export const config = (scope: Construct): CDKEnvironmentVariables => ({
    ...commonEnvironmentVariables(scope),
    GCP_CLIENT_LIBRARY_CONFIG: JSON.stringify({
        audience:
            '//iam.googleapis.com/projects/564311958262/locations/global/workloadIdentityPools/aws-sandbox/providers/pulsifi-aws-sandbox',
        credential_source: {
            environment_id: 'aws1',
            region_url:
                'http://169.254.169.254/latest/meta-data/placement/availability-zone',
            regional_cred_verification_url:
                'https://sts.{region}.amazonaws.com?Action=GetCallerIdentity\u0026Version=2011-06-15',
            url: 'http://169.254.170.2$AWS_CONTAINER_CREDENTIALS_RELATIVE_URI',
        },
        service_account_impersonation_url:
            'https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/talent-management-fn@data-sandbox-warehouse.iam.gserviceaccount.com:generateAccessToken',
        subject_token_type: 'urn:ietf:params:aws:token-type:aws4_request',
        token_url: 'https://sts.googleapis.com/v1/token',
        type: 'external_account',
    }),
    RECOMMENDATION_API_URL:
        'https://pulsifi-dev--action-recommendation-app.modal.run',
});
