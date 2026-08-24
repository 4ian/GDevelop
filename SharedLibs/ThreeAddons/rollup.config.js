//import pkg from "./package.json";
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default [
  {
    // Bundle the whole Three.js library as a classic script exposing the
    // global `THREE` namespace (Three.js stopped providing such a build
    // after r160). The bundle is written directly to the game engine
    // ("Runtime") files, where it's expected to be a plain script setting
    // a global - like pixi.js and ThreeAddons.js.
    input: './src/three.ts',
    output: [
      {
        name: 'THREE',
        format: 'iife',
        file: './dist/three.js',
        sourcemap: true,
      },
      {
        name: 'THREE',
        format: 'iife',
        file: '../../GDJS/Runtime/pixi-renderers/three.js',
        sourcemap: false,
      },
    ],
    plugins: [
      resolve({
        extensions: ['.js'],
      }),
      terser(),
    ],
  },
  {
  	input: './src/index.ts',
  	output: [
      {
        name: 'THREE_ADDONS',
        format: 'umd',
        file: './dist/ThreeAddons.js',
        sourcemap: true,
        plugins: [],
        globals: {
          'three': 'THREE',
        },
      },
    ],
  	external: ['three'],
    plugins: [
      resolve({
          extensions: ['.js'],
      }),
			terser(),
    ],
  },
];
