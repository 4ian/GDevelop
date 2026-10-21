// @ts-check
// Build configuration of the app (`npm start` and `npm run build`).
const { defineConfig } = require('@rsbuild/core');
const { pluginReact } = require('@rsbuild/plugin-react');
const { pluginBabel } = require('@rsbuild/plugin-babel');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = defineConfig({
  plugins: [
    // SWC compiles the code (syntax lowering, React Refresh) and minifies it.
    pluginReact(),
    // Babel only runs what SWC can't do: strip Flow types and run Lingui macros.
    // Lingui macros output JSX that SWC can't parse (escaped quotes in
    // attributes), so Babel also compiles JSX.
    pluginBabel({
      include: /[\\/]src[\\/]/,
      // Locales are already compiled by Lingui, and are huge.
      exclude: /[\\/]src[\\/]locales[\\/]/,
      babelLoaderOptions: config => {
        config.babelrc = false;
        config.configFile = false;
        config.sourceType = 'unambiguous';
        config.presets = [];
        config.plugins = [
          require.resolve('@babel/plugin-transform-flow-strip-types'),
          require.resolve('babel-plugin-macros'),
          [
            require.resolve('@babel/plugin-transform-react-jsx'),
            { runtime: 'automatic', development: !isProduction },
          ],
        ];
      },
    }),
  ],
  source: {
    entry: { index: './src/index.js' },
    define: {
      // Same values as the ones given by react-scripts before.
      'process.env.PUBLIC_URL': JSON.stringify(isProduction ? '.' : ''),
      'process.env.REACT_APP_ENV': JSON.stringify(
        process.env.REACT_APP_ENV || ''
      ),
    },
  },
  html: {
    template: './public/index.html',
  },
  output: {
    distPath: { root: 'build' },
    // Relative URLs, so that the build works from any folder (including
    // when loaded from the filesystem by Electron).
    assetPrefix: 'auto',
    sourceMap: { js: isProduction ? 'source-map' : 'cheap-module-source-map' },
  },
  server: {
    port: 3000,
    // Same as react-scripts: open a browser, unless BROWSER=none is set.
    open: process.env.BROWSER !== 'none',
  },
  performance: {
    // Makes restarts of the development server about 4 times faster. Not used
    // for production builds, as it's still experimental in Rsbuild 1.
    buildCache: !isProduction,
  },
  tools: {
    rspack: config => {
      // Same as webpack defaults for web targets, which some libraries rely on.
      config.node = { global: true, __filename: 'mock', __dirname: 'mock' };
      // A lot of packages we use in node_modules trigger source map warnings
      // but it is not a blocking issue, so we ignore them.
      config.ignoreWarnings = [/Failed to parse source map/];
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      config.module.rules.unshift({
        test: /\.worker\.js$/,
        loader: 'worker-rspack-loader',
        options: {
          filename: '[name].[contenthash].worker.js',
        },
      });
      return config;
    },
  },
});
