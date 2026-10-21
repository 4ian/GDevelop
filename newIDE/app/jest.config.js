// Babel (configured in .babelrc.json) is used to strip Flow types and run Lingui macros.
module.exports = {
  roots: ['<rootDir>/src'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.js',
    '<rootDir>/src/**/*.{spec,test}.js',
  ],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: { '\\.css$': 'identity-obj-proxy' },
  transform: {
    '\\.js$': [
      'babel-jest',
      { configFile: require.resolve('./.babelrc.json'), babelrc: false },
    ],
  },
  transformIgnorePatterns: [
    '<rootDir>/node_modules/(?!react-markdown|vfile|unist-.*|unified|bail|trough|character-entities|remark-parse|mdast-util-.*|micromark|decode-named-character-reference|remark-rehype|property-information|hast-util-.*|space-separated-tokens|comma-separated-tokens|ccount|escape-string-regexp|trim-lines|hast-util-whitespace|remark-gfm|mdast-util-gfm|mdast-util-find-and-replace|mdast-util-to-markdown|markdown-table|is-plain-obj)',
  ],
  collectCoverageFrom: ['src/**/*.js'],
  resetMocks: true,
};
