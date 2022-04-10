import pkg from "./package.json";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

export default [
  // {
  //   input: "src/index.ts",
  //   output: {
  //     name: "TileMapHelper",
  //     format: "umd",
  //     file: "../../Extensions/TileMap/helper/TileMapHelper.js",
  //     sourcemap: true,
  //   },
  //   plugins: [
  //     //typescript(),

  //     // It doesn't seem necessary
  //     // /**
  //     //  * https://github.com/bigtimebuddy/pixi-rollup-example/blob/main/rollup.config.js
  //     //  * 
  //     //  * Required!
  //     //  *
  //     //  * `preferBuiltins` is required to not confuse Rollup with
  //     //  * the 'url' dependence that is used by PixiJS utils
  //     //  */
  //     // resolve({
  //     //   preferBuiltins: false,
  //     // }),
  //     // /**
  //     //  * Required!
  //     //  *
  //     //  * PixiJS third-party dependencies use CommonJS exports
  //     //  * and do not have modules bundles available
  //     //  */
  //     // commonjs(),
  //   ],
  //   external: ["pixi.js"],
  // },
  //To try without plugin-typescript
  {
  	input: './dist/index.js',//'../../Extensions/TileMap/helper/index.js',//
  	output: {
  		name: 'TileMapHelper',
  		format: 'umd',
  		file: '../../Extensions/TileMap/helper/TileMapHelper.js',
  		sourcemap: true,
  	},
  	external: ['pixi.js'],
    plugins: [
      resolve({
          extensions: ['.js'],
      }),
    ],
  },
  //This is to produce a d.ts in one file.
  {
  	input: "../../Extensions/TileMap/helper/dts/index.d.ts",
  	output: [{ file: "../../Extensions/TileMap/helper/TileMapHelper.d.ts", format: "umd" }],
  	plugins: [dts()],
  }
];
