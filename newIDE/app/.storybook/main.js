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
  // This fix the error "Can't resolve 'fs'" because of the package "jimp".
  // See https://github.com/storybookjs/storybook/issues/16833#issuecomment-1060655174
  webpackFinal: config => {
    config.node = { fs: 'empty' };
    return config;
  },
};
