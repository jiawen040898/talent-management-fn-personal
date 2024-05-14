import { spawnSync } from 'node:child_process';

import type {
    IBuildProvider,
    ProviderBuildOptions,
} from '@mrgrain/cdk-esbuild';

/**
 * BundlingAssets
 *
 * @param from
 * @param to
 */
export type BundlingAssets = {
    from: string[];
    to: string[];
};

/**
 * BuildScriptProviderProps
 *
 * @optional bundlingAssets
 * @optional externalModules
 */
export type BuildScriptProviderProps = {
    bundlingAssets?: BundlingAssets[];
    externalModules?: string[];
};

/**
 * @link https://github.com/mrgrain/cdk-esbuild/tree/v5/examples/typescript/esbuild-with-plugins
 * @description esbuild bundling operations within AWS CDK applications, the reason we use this
 * way to bundle code is because AWS CDK Construct NodeJSFunction (using esbuild) does not support
 * emitDecoratorMetadata settings
 */
export class BuildScriptProvider implements IBuildProvider {
    private bundlingAssets: BundlingAssets[] = [];
    private externalModules: string[] = [];
    constructor(
        public readonly scriptPath: string,
        props?: BuildScriptProviderProps,
    ) {
        this.bundlingAssets = props?.bundlingAssets ?? [];
        this.externalModules = props?.externalModules ?? [];
    }

    buildSync(options: ProviderBuildOptions): void {
        const result = spawnSync(
            'node',
            [
                this.scriptPath,
                JSON.stringify(options),
                JSON.stringify(this.bundlingAssets),
                JSON.stringify(this.externalModules),
            ],
            {
                stdio: ['inherit', 'inherit', 'pipe'],
            },
        );

        if (result.stderr.byteLength > 0) {
            throw result.stderr.toString();
        }
    }
}
