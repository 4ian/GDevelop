module.exports = {
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
};
