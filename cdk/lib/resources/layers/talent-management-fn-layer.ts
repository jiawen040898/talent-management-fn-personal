import { Code } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

import { BaseLayer } from '../../base';

const layerName = 'talent-management-fn-layer';

export class TalentManagementFnLayerResource extends Construct {
    public readonly layer;
    /**
     * TalentManagementFnLayerResource
     *
     * @param scope {@link Construct}
     * @param id
     */
    constructor(scope: Construct, id: string) {
        super(scope, id);

        this.layer = new BaseLayer(scope, layerName, {
            layerVersionName: layerName,
            description: 'Talent Management Fn Layer',
            code: Code.fromAsset('layer'),
        });
    }
}
