//import pkg from "./package.json";
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default [
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
