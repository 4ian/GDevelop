module.exports = {
  framework: {
    name: '@storybook/react-webpack5',
  },
  stories: ['../src/stories/index.js', '../src/stories/**/*.stories.js'],
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
  webpackFinal: async (config, { configType }) => {
    config.resolve = {
        ...config.resolve,
        fallback: {
            ...(config.resolve || {}).fallback,
            fs: false,
            stream: false,
            os: false,
        },
    }
    return config
  },
};
