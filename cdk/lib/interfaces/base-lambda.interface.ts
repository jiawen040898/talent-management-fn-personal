import type { IRole } from 'aws-cdk-lib/aws-iam';
import type { LayerVersion } from 'aws-cdk-lib/aws-lambda';
import type { Queue } from 'aws-cdk-lib/aws-sqs';

export interface LambdaResourceProps {
    iamRole: IRole;
    layers: LayerVersion[];
    sqs?: Queue;
}
