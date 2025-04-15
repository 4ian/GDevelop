// This file customizes webpack configuration for react-app-rewired
// without relying on customize-cra

module.exports = function override(config, env) {
  // Add worker-loader rule
  config.module.rules.push({
    test: /\.worker\.js$/,
    use: {
      loader: 'worker-loader',
      options: {
        filename: '[name].[contenthash].worker.js',
      },
    },
  });

  // Ignore source map warnings
  config.ignoreWarnings = [/Failed to parse source map/];

  return config;
};
