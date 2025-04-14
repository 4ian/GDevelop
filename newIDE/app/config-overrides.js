const { override, addWebpackModuleRule } = require('customize-cra');

const ignoreWarnings = value => config => {
  config.ignoreWarnings = value;
  return config;
};

module.exports = override(
  // Add worker-loader rule
  addWebpackModuleRule({
    test: /\.worker\.js$/,
    use: {
      loader: 'worker-loader',
      options: {
        filename: '[name].[contenthash].worker.js',
      },
    },
  }),
  ignoreWarnings([/Failed to parse source map/])
);
