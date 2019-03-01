const shell = require('shelljs');
const path = require('path');
const { getLocales, getLocalePath } = require('./lib/Locales');
const isWin = /^win/.test(process.platform);

const gdScriptsPath = path.join(__dirname, '../../../scripts');
const newIdeAppPath = path.join(__dirname, '..');

let hasErrors = false;

// Launch "lingui extract" for extracting newIDE translations
shell.echo('ℹ️ Extracting translations for newIDE...');
hasErrors |= shell.exec(
  'node node_modules/.bin/lingui extract --clean --overwrite',
  {
    cwd: newIdeAppPath,
  }
).stderr;

shell.echo('ℹ️ Renaming extracted translations to ide-messages.po...');
getLocales().then(locales =>
  locales.forEach(locale => {
    const localePath = getLocalePath(locale);
    shell.mv(
      path.join(localePath, 'messages.po'),
      path.join(
        localePath,
        locale === 'en' || locale === 'pseudo_LOCALE'
          ? 'ide-messages.pot'
          : 'ide-messages.po'
      )
    );
  })
);

// Launch extractions of translations in GDCore/GDCpp/GDJS
// and extensions with gettext.
shell.echo(
  'ℹ️ Extracting translations for GDCore/GDCpp/GDJS/Extensions to scripts/gdcore-gdcpp-gdjs-extensions-messages.pot...'
);
if (isWin) {
  hasErrors |= shell.exec('ExtractTranslations.bat', {
    cwd: gdScriptsPath,
  }).stderr;
} else {
  hasErrors |= shell.exec('./ExtractTranslations.sh ', {
    cwd: gdScriptsPath,
  }).stderr;
}

if (!hasErrors) {
  shell.echo('✅ Translations extracted');
} else {
  shell.echo(`❌ Error(s) occurred while extracting translations`);
}
