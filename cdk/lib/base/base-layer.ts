import { RemovalPolicy } from 'aws-cdk-lib';
import {
    Architecture,
    LayerVersion,
    type LayerVersionProps,
    Runtime,
} from 'aws-cdk-lib/aws-lambda';
import type { Construct } from 'constructs';

export class BaseLayer extends LayerVersion {
    /**
     * BaseLayer
     *
     * @param scope {@link Construct}
     * @param id
     * @param props {@link LayerVersionProps}
     */
    constructor(scope: Construct, id: string, props: LayerVersionProps) {
        /* Default layer configuration */
        const defaultLayerConfiguration = {
            compatibleRuntimes: [Runtime.NODEJS_20_X],
            compatibleArchitectures: [Architecture.X86_64, Architecture.ARM_64],
            removalPolicy: RemovalPolicy.RETAIN,
            ...props,
        };

        super(scope, id, defaultLayerConfiguration);
    }
}
