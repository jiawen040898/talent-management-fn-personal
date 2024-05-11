import { envUtil } from '@pulsifi/fn';

export const gcpConfig = () => ({
    clientLibraryConfig: JSON.parse(envUtil.get('GCP_CLIENT_LIBRARY_CONFIG')),
    projectId: envUtil.get('GCP_PROJECT_ID'),
    region: envUtil.get('GCP_REGION'),
});
