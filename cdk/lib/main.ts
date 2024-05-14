import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

import { LambdaGroupResources } from './resources/functions';
import { IAMRoleGroupResources } from './resources/iam';
import { LayerGroupResources } from './resources/layers';
import { SQSGroupResources } from './resources/sqs';
import { StepFunctionGroupResources } from './resources/step-functions';

export class MainStack extends Stack {
    /**
     * MainStack
     *
     * @param scope {@link Construct}
     * @param id
     * @param props {@link StackProps}
     */
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        /* IAM */
        const iamRoleGroupResources = new IAMRoleGroupResources(
            this,
            'iam-role-group-resources',
        );

        /* SQS */
        const sqsGroupResources = new SQSGroupResources(
            this,
            'sqs-group-resources',
        );

        /* LAYER */
        const layerGroupResources = new LayerGroupResources(
            this,
            'layer-group-resources',
        );

        /* LAMBDA */
        const lambdaGroupResources = new LambdaGroupResources(
            this,
            'lambda-group-resources',
            {
                iamRoleGroupResources: iamRoleGroupResources,
                layerGroupResources: layerGroupResources,
                sqsGroupResources: sqsGroupResources,
            },
        );

        /* STEP FUNCTION */
        const stepFunctionGroup = new StepFunctionGroupResources(
            this,
            'step-function-group-resources',
            {
                iamRoleGroupResources,
            },
        );

        lambdaGroupResources.node.addDependency(iamRoleGroupResources);
        lambdaGroupResources.node.addDependency(sqsGroupResources);
        lambdaGroupResources.node.addDependency(layerGroupResources);
        stepFunctionGroup.node.addDependency(iamRoleGroupResources);
    }
}
