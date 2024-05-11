import { join } from 'path';

const basePath = process.env.SERVERLESS_STAGE === 'test' ? '..' : 'src';

const getAbsolutePath = (relativeFilePath: string): string => {
    return join(__dirname, `${basePath}/${relativeFilePath}`);
};

export const pathUtil = {
    getAbsolutePath,
};
