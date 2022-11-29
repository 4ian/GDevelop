//import pkg from "./package.json";
import typescript from "@rollup/plugin-typescript";
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default [
  {
  	input: './src/index.ts',
  	output: [
      {
        name: 'TileMapHelper',
        format: 'umd',
        file: '../../Extensions/TileMap/helper/TileMapHelper.js',
        sourcemap: true,
        plugins: [
          terser({
            format: {
              comments: false
            },
          })
        ]
      },
    ],
  	external: ['pixi.js'],
    plugins: [
      resolve({
          extensions: ['.js'],
      }),
      typescript({ tsconfig: './tsconfig.json' }),
    ],
  },
];
