module.exports = {
  framework: {
    name: '@storybook/react-webpack5',
    options: { fastRefresh: true },
  },
  stories: ['../src/stories/index.js', '../src/stories/**/*.stories.js'],
  addons: [
    {
      name: '@storybook/addon-essentials',
      options: {
        docs: false,
      },
    },
    'storybook-addon-mock/register',
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
