import { Code, type LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { BaseLayer } from '../base/base-layer';

export class LayerGroupResources extends Construct {
    public readonly talentManagementFnLayer: LayerVersion;
    /**
     * LayerGroupResources
     *
     * @public talentManagementFnLayer {@link LayerVersion}
     *
     * @param scope {@link Construct}
     * @param id
     */
    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.talentManagementFnLayer = new BaseLayer(
            scope,
            'talent-management-fn-layer',
            {
                layerVersionName: 'talent-management-fn-layer',
                description: 'Talent Management Fn Layer',
                code: Code.fromAsset('layer'),
            },
        );
    }
}
