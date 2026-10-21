// This file customizes webpack configuration for react-app-rewired.
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

module.exports = {
  webpack: function override(config, env) {
    // Text files imported as strings (the public API of the editor functions
    // given to external agents). First in `oneOf` so the default file loader
    // does not take them.
    const oneOfRule = config.module.rules.find(rule =>
      Array.isArray(rule.oneOf)
    );
    oneOfRule.oneOf.unshift({
      test: /\.(md|d\.ts)$/,
      type: 'asset/source',
    });

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
      plugin => !(plugin instanceof ModuleScopePlugin)
    );

    return config;
  },

  jest: function(config) {
    // Before the default transforms: the catch-all file transform would take
    // the `.md` files, and the Babel one the `.d.ts` files.
    config.transform = {
      '^.+\\.(md|d\\.ts)$': require('path').resolve(
        __dirname,
        'config/jest/rawTextTransform.js'
      ),
      ...config.transform,
    };
    config.transformIgnorePatterns = [
      '<rootDir>/node_modules/(?!react-markdown|vfile|unist-.*|unified|bail|trough|character-entities|remark-parse|mdast-util-.*|micromark|decode-named-character-reference|remark-rehype|property-information|hast-util-.*|space-separated-tokens|comma-separated-tokens|ccount|escape-string-regexp|trim-lines|hast-util-whitespace|remark-gfm|mdast-util-gfm|mdast-util-find-and-replace|mdast-util-to-markdown|markdown-table|is-plain-obj)',
    ];

    return config;
  },
};
