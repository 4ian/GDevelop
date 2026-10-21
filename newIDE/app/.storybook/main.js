export default {
  // Uses the Rsbuild configuration of the app (rsbuild.config.js).
  framework: 'storybook-react-rsbuild',
  stories: ['../src/stories/**/*.stories.js'],
  staticDirs: ['../public'],
  // Docs are not used, and generating them for all files (including the huge
  // locales) would be slow and use a lot of memory.
  typescript: { reactDocgen: false },
};
