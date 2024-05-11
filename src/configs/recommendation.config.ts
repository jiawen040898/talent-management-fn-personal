import { envUtil } from '@pulsifi/fn';

export const recommendApiConfig = () => ({
    apiUrl: envUtil.get('RECOMMENDATION_API_URL'),
});
