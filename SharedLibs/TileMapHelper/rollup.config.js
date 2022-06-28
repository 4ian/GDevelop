//import pkg from "./package.json";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import resolve from '@rollup/plugin-node-resolve';

export default [
  {
  	input: './src/index.ts',
  	output: [
      {
        name: 'TileMapHelper',
        format: 'umd',
        file: '../../Extensions/TileMap/helper/TileMapHelper.js',
        sourcemap: true,
      },
      {
        format: "umd",
        file: "../../Extensions/TileMap/helper/TileMapHelper.d.ts",
        plugins: [dts()],
      }
    ],
  	external: ['pixi.js'],
    plugins: [
      resolve({
          extensions: ['.js'],
      }),
      typescript(),
    ],
  },
];
