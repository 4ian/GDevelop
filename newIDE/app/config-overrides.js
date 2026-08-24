// This file customizes webpack configuration for react-app-rewired.
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

module.exports = {
  webpack: function override(config, env) {
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: {
        loader: 'worker-loader',
        options: {
          filename: '[name].[contenthash].worker.js',
        },
      },
    });

    // A lot of packages we use in node_modules trigger source map warnings
    // but it is not a blocking issue, so we ignore them.
    config.ignoreWarnings = [/Failed to parse source map/];

    config.resolve.plugins = config.resolve.plugins.filter(
      (plugin) => !(plugin instanceof ModuleScopePlugin)
    );

    return config;
  },

  jest: function(config) {
    config.transformIgnorePatterns = [
      '<rootDir>/node_modules/(?!react-markdown|vfile|unist-.*|unified|bail|trough|character-entities|remark-parse|mdast-util-.*|micromark|decode-named-character-reference|remark-rehype|property-information|hast-util-.*|space-separated-tokens|comma-separated-tokens|ccount|escape-string-regexp|trim-lines|hast-util-whitespace|remark-gfm|mdast-util-gfm|mdast-util-find-and-replace|mdast-util-to-markdown|markdown-table|is-plain-obj)',
    ];

    return config;
  },
};
