module.exports = {
    ...require('@pulsifi/fn/configs/dev/eslint'),
    parserOptions: {
        project: ['./tsconfig.json', './cdk/tsconfig.json'],
        sourceType: 'module',
    },
};
