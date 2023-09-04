module.exports = {
  framework: {
    name: '@storybook/react-webpack5',
  },
  features: {
    storyStoreV7: false,
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
    'storybook-addon-mock',
    '@storybook/preset-create-react-app',
  ],
  webpackFinal: async config => {
    return {
      ...config,
      resolve: {
        ...config.resolve,
        fallback: {
          ...(config.resolve || {}).fallback,
          fs: false,
          stream: false,
          os: false,
        },
      },
      // node: {
      //   ...config.node,
      //   global: true
      // }
    };
  },
};
