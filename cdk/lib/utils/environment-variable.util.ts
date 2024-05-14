import type { Construct } from 'constructs';

import * as productionEnvVariables from '../environment-variables/production-env-variables';
import * as sandboxEnvVariables from '../environment-variables/sandbox-env-variables';
import * as stagingEnvVariables from '../environment-variables/staging-env-variables';

const getEnvironmentVariables = (scope: Construct, environment: string) => {
    const config = {
        sandbox: sandboxEnvVariables.envVariables(scope),
        staging: stagingEnvVariables.envVariables(scope),
        production: productionEnvVariables.envVariables(scope),
    };

    return config[environment as keyof typeof config];
};

export const environmentVariableUtil = {
    getEnvironmentVariables,
};
