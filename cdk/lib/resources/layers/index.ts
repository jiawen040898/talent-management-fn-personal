import type { LayerVersion } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { TalentManagementFnLayerResource } from './talent-management-fn-layer';

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

        this.talentManagementFnLayer = new TalentManagementFnLayerResource(
            this,
            'talent-management-fn-layer-resource',
        ).layer;
    }
}
