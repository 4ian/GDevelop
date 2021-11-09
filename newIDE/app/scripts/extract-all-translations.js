const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const { getLocales, getLocalePath } = require('./lib/Locales');
const isWin = /^win/.test(process.platform);

const gdScriptsPath = path.join(__dirname, '../../../scripts');
const newIdeAppPath = path.join(__dirname, '..');

let hasErrors = false;

// Clean existing English messages catalog, if any
const enMessagesJsPath = path.join(newIdeAppPath, 'src/locales/en/messages.js');
if (fs.existsSync(enMessagesJsPath)) {
  shell.echo(
    `ℹ️ Removing ${enMessagesJsPath} as "en" should not have any translations ("pot" file)`
  );
  shell.rm(enMessagesJsPath);
}
const enIdeMessagesPotPath = path.join(
  newIdeAppPath,
  'src/locales/en/ide-messages.pot'
);
if (fs.existsSync(enIdeMessagesPotPath)) {
  shell.echo(
    `ℹ️ Removing ${enIdeMessagesPotPath} as "en" should not have any translations ("pot" file)`
  );
  shell.rm(enIdeMessagesPotPath);
}

// Launch "lingui extract" for extracting newIDE translations
shell.echo('ℹ️ Extracting translations for newIDE...');

hasErrors |=
  shell.exec('node node_modules/.bin/lingui extract --clean --overwrite', {
    cwd: newIdeAppPath,
  }).code !== 0;

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

// Launch extractions of translations in GDCore/GDJS
// and extensions with gettext.
shell.echo(
  'ℹ️ Extracting translations for GDCore/GDJS/Extensions to scripts/gdcore-gdcpp-gdjs-extensions-messages.pot...'
);
if (isWin) {
  hasErrors |=
    shell.exec('ExtractTranslations.bat', {
      cwd: gdScriptsPath,
    }).code !== 0;
} else {
  hasErrors |=
    shell.exec('./ExtractTranslations.sh ', {
      cwd: gdScriptsPath,
    }).code !== 0;
}

if (!hasErrors) {
  shell.echo('✅ Translations extracted');
} else {
  shell.echo(`❌ Error(s) occurred while extracting translations`);
  shell.exit(1);
}
