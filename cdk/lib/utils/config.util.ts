import type { Construct } from 'constructs';

import * as productionEnvVariables from '../configs/production.config';
import * as sandboxEnvVariables from '../configs/sandbox.config';
import * as stagingEnvVariables from '../configs/staging.config';
import { CDKEnvironmentVariables } from '../interfaces';

const getEnvironmentVariables = (
    scope: Construct,
    environment: string,
): CDKEnvironmentVariables => {
    const config = {
        sandbox: sandboxEnvVariables.config(scope),
        staging: stagingEnvVariables.config(scope),
        production: productionEnvVariables.config(scope),
    };

    return config[environment as keyof typeof config];
};

export const configUtil = {
    getEnvironmentVariables,
};
