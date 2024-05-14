import { error } from '@actions/core';
import esbuild from "esbuild";
import { nodeExternalsPlugin } from 'esbuild-node-externals';
import { copy } from 'esbuild-plugin-copy';
import time from "esbuild-plugin-time";
import { esbuildDecorators } from 'esbuild-plugin-typescript-decorators';

/**
 * @description esbuild script for bundling assets, 
 * decorators, external dependencies handling, and asset copying
 */
const options = JSON.parse(process.argv.slice(2, 3));
const assets = JSON.parse(process.argv.slice(3, 4));
const externalModules = JSON.parse(process.argv.slice(4, 5));

await esbuild
  .build({
    ...options,
    bundle: true,
    minify: true,
    plugins: [
      time(),
      esbuildDecorators(),
      nodeExternalsPlugin({
        packagePath: externalModules
      }),
      copy({ assets })
    ],
  })
  .catch((e) => {
    error(e);
    process.exit(1)
  });
