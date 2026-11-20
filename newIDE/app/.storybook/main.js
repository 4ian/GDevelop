module.exports = {
  env: config => ({ REACT_APP_ENV: '', ...config }),
  framework: {
    name: '@storybook/react-webpack5',
  },

  features: {
    storyStoreV7: false,
  },

  // The stories have no translation catalog: the texts are compiled by the browser,
  // which only the development version of the library can do. Without this,
  // a built Storybook displays the variables of texts as "{0}".
  webpackFinal: async config => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@lingui/core$': require.resolve(
        '@lingui/core/cjs/core.development.js'
      ),
    };
    return config;
  },

  stories: ['../src/stories/**/*.stories.js'],
  staticDirs: ['../public'],

  addons: [
    {
      name: '@storybook/addon-essentials',
      options: {
        docs: false,
      },
    },
    '@storybook/preset-create-react-app',
  ],
};
