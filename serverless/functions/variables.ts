import { Tags } from 'serverless/aws';

export const tags: Tags = {
    Type: 'AWS::Lambda::Function',
};

export const version = '${env:TAG_VERSION}';

export const layers = [
    '${self:custom.regionToLambdaExtensionLayerArn.${opt:region}}',
];
