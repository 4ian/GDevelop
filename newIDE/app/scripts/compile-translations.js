const shell = require('shelljs');
const path = require('path');
const { getLocales, getLocalePath } = require('./lib/Locales');
const isWin = /^win/.test(process.platform);

const newIdeAppPath = path.join(__dirname, '..');

let msgcat = '';
if (isWin) {
  shell.echo(`ℹ️ Skipping translations compilation on Windows.`);
  shell.echo(
    `ℹ️ Pull Requests are welcome to add support for "msgcat" on Windows!`
  );
  shell.exit(0);
  return;
} else {
  msgcat = shell.exec('type msgcat 2>/dev/null', { silent: true }).stdout;
  if (!msgcat) {
    msgcat = shell.exec('find /usr -name "msgcat" -print -quit 2>/dev/null', {
      silent: true,
    }).stdout;
  }
}

msgcat = msgcat.trim();
if (!msgcat) {
  shell.echo(
    `ℹ️ msgcat not found not found on your computer - skipping translations compilation.`
  );
  shell.echo(
    `ℹ️ Install "gettext" with "brew install gettext" (macOS) or your Linux package manager.`
  );
  shell.exit(0);
  return;
}

getLocales().then(
  locales => {
    return Promise.all(
      locales.map(locale => {
        return new Promise(resolve => {
          shell.exec(
            msgcat +
              ' ide-messages.po gdcore-gdcpp-gdjs-extensions-messages.po -o messages.po',
            {
              cwd: getLocalePath(locale),
              silent: true,
            },
            (code, stdout, stderr) =>
              resolve({
                locale,
                shellOutput: {
                  code,
                  stdout,
                  stderr,
                },
              })
          );
        });
      })
    ).then(results => {
      const successes = results.filter(
        ({ shellOutput }) => shellOutput.code === 0
      );
      const failures = results.filter(
        ({ shellOutput }) => shellOutput.code !== 0
      );

      const successesLocales = successes.map(({ locale }) => locale).join(',');
      if (successesLocales) {
        shell.echo(`ℹ️ Concatened translations for ${successesLocales}.`);
      }
      if (failures.length) {
        failures.forEach(({ locale, shellOutput }) => {
          shell.echo(
            `❌ Error(s) occurred while concatening translations for ${locale}: ` +
              shellOutput.stderr
          );
        });
      }

      // Launch "lingui compile" for transforming .PO files into
      // js files ready to be used with @lingui/react newIDE translations
      shell.exec('node node_modules/.bin/lingui compile', {
        cwd: newIdeAppPath,
      });

      shell.exit(0);
      return;
    });
  },
  error => {
    shell.echo(`❌ Error(s) occurred while listing locales folders: ` + error);
    shell.exit(1);
    return;
  }
);
