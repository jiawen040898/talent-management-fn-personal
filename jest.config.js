/** @type {import('jest').Config} */

module.exports = {
    ...require('@pulsifi/fn/configs/dev/jest'),
    setupFilesAfterEnv: ['<rootDir>/tests/setup/jest/custom-matchers.ts'],
    coverageThreshold: {
        global: {
            functions: 80, 
        },
    },
};
