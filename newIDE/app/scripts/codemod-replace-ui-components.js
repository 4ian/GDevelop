const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const recursive = require('recursive-readdir');

const newIdeAppSrcPath = path.join(__dirname, '../src');
const verbose = true;
const dryRun = true;

const excludedPaths = ['UI', 'locales'];

const importsToReplace = [
  {
    oldImport: 'material-ui/FlatButton',
    newImport: path.join(newIdeAppSrcPath, 'UI/FlatButton'),
  },
  {
    oldImport: 'material-ui/RaisedButton',
    newImport: path.join(newIdeAppSrcPath, 'UI/RaisedButton'),
  },
  {
    oldImport: 'material-ui/TextField',
    newImport: path.join(newIdeAppSrcPath, 'UI/TextField'),
  },
  {
    oldImport: 'material-ui/IconButton',
    newImport: path.join(newIdeAppSrcPath, 'UI/IconButton'),
  },
  {
    oldImport: 'material-ui/SelectField',
    newImport: path.join(newIdeAppSrcPath, 'UI/SelectField'),
  },
  {
    oldImport: 'material-ui/MenuItem',
    newImport: path.join(newIdeAppSrcPath, 'UI/MenuItem'),
  },
  {
    oldImport: 'material-ui/Checkbox',
    newImport: path.join(newIdeAppSrcPath, 'UI/Checkbox'),
  },
  {
    oldImport: 'material-ui/Table',
    newImport: path.join(newIdeAppSrcPath, 'UI/Table'),
  },
  {
    oldImport: 'material-ui/Toggle',
    newImport: path.join(newIdeAppSrcPath, 'UI/Toggle'),
  },
  {
    oldImport: 'material-ui/Tabs',
    newImport: path.join(newIdeAppSrcPath, 'UI/Tabs'),
  },
  {
    oldImport: 'material-ui/List',
    newImport: path.join(newIdeAppSrcPath, 'UI/List'),
  },
  {
    oldImport: 'material-ui/Subheader',
    newImport: path.join(newIdeAppSrcPath, 'UI/Subheader'),
  },
  {
    oldImport: 'material-ui/Toolbar',
    newImport: path.join(newIdeAppSrcPath, 'UI/Toolbar'),
  },
];

/**
 * Replace an import by another.
 */
const replaceImport = (oldImport, newImport) => source => {
  const regex = new RegExp(` from '${oldImport}';`, '');
  return source.replace(regex, match => {
    const replacement = ` from '${newImport}';`;

    if (verbose)
      console.log('Replace "' + match + '" by "' + replacement + '"');
    return replacement;
  });
};

const replaceImportsInFile = filePath =>
  new Promise((resolve, reject) =>
    fs.readFile(filePath, { encoding: 'utf8' }, (err, source) => {
      if (err) return reject(err);

      let newSource = source;
      importsToReplace.forEach(({ oldImport, newImport }) => {
        const newRelativeImport = path.relative(
          path.dirname(filePath),
          newImport
        );

        newSource = replaceImport(oldImport, newRelativeImport)(newSource);
      });

      if (source === newSource) {
        return resolve({
          filePath,
          changed: false,
        });
      }

      if (!dryRun) {
        fs.writeFile(filePath, newSource, { encoding: 'utf8' }, err => {
          if (err) {
            shell.echo(`❌ Error while writing file ${filePath}: `, err);
            return reject(err);
          }

          resolve({
            filePath,
            changed: true,
          });
        });
      } else {
        shell.echo('ℹ️  Would write ' + filePath);
        resolve({
          filePath,
          changed: true,
        });
      }
    })
  );

recursive(newIdeAppSrcPath, function(err, files) {
  if (err) {
    shell.echo(`❌ Error(s) occurred while reading files `, err);
    shell.exit(1);
  }

  Promise.all(
    files.map(filePath => {
      if (excludedPaths.some(excludedPath => filePath.includes(excludedPath)))
        return null;

      return replaceImportsInFile(filePath);
    })
  ).then(results => {
    if (dryRun) {
      shell.echo(
        `⚠️  This was a dry-run, set dryRun to false to do real changes.`
      );
      shell.exit(0);
    }
  });
});
