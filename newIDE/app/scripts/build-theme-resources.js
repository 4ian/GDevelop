const fs = require('fs');
const style = require('style-dictionary');
const readThemeRegistry = require('./lib/ReadThemeRegistry');

style.registerAction({
  name: 'set_theme_class',
  do(styleDictionary, config) {
    let path = config.files[0].destination;
    fs.writeFileSync(
      path,
      fs
        .readFileSync(path)
        .toString()
        .replace(':root', '.' + config.theme)
    );
  },
  undo() {},
});

const registry = readThemeRegistry();

for (let registration of registry) {
  const theme = registration.id;
  style
    .extend({
      source: [
        `${__dirname}/../src/UI/Theme/Global/styles.json`, // Global styles
        `${__dirname}/../src/UI/Theme/${theme}/theme.json`, // Theme specific overrides
      ],
      platforms: {
        css: {
          theme,
          transformGroup: 'css',
          files: [
            {
              format: 'css/variables',
              destination: `${__dirname}/../src/UI/Theme/${theme}/${theme}Variables.css`,
            },
          ],
          actions: ['set_theme_class'],
        },
        js: {
          transformGroup: 'js',
          files: [
            {
              format: 'json/flat',
              destination: `${__dirname}/../src/UI/Theme/${theme}/${theme}Variables.json`,
            },
          ],
        },
      },
    })
    .buildAllPlatforms();
}
