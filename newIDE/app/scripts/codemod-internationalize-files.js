const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const recursive = require('recursive-readdir');

const newIdeAppSrcPath = path.join(__dirname, '../src');
const verbose = true;
const dryRun = true;

const importStr = `import { Trans } from '@lingui/macro'`;
const importExistenceCheckStr = `import { Trans`;

const tagsWhereToInsertTranslation = [
  'EmptyMessage',
  'p',
  'Line',
  'BackgroundText',
];
const propsWhereToInsertTranslation = [
  'label',
  'floatingLabelText',
  'hintText',
  'title',
  'primaryText',
  'message',
  'Label',
];

//TODO support for style={styles.addAnimationText}
/**
 * Replace <tagName>Something</tagName> by <tagName><Trans>Something</Trans></tagName>
 */
const addTranslationTagInTag = tagName => source => {
  const tagOpeningRegex = `<${tagName}>`;
  const tagClosingRegex = `<\\/${tagName}>`;
  const regex = new RegExp(
    tagOpeningRegex + '([^<>]*[^<>])' + tagClosingRegex,
    'g'
  );
  return source.replace(regex, (match, tagContent) => {
    if (tagContent.trim().indexOf('{') === 0) {
      if (verbose) console.log('Ignored', match);
      return match; // Tag is entirely composed of an expression, ignore;
    }

    if (verbose) console.log('Replace (tag)', match);
    return `<${tagName}><Trans>${tagContent}</Trans></${tagName}>`;
  });
};

/**
 * Replace propName="Something" by propName={<Trans>Something</Trans>}
 */
const addTranslationTagInProp = propName => source => {
  let newSource = source;
  const sanitize = str =>
    str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const regex = new RegExp(propName + '="([^"]+)"', 'g');
  newSource = source.replace(regex, (match, propValue) => {
    if (verbose) console.log('Replace (prop variant 1)', match);
    return propName + '={<Trans>' + sanitize(propValue) + '</Trans>}';
  });

  const regexVariant2 = new RegExp(propName + '={"([^"]+)"}', 'g');
  newSource = newSource.replace(regexVariant2, (match, propValue) => {
    if (verbose) console.log('Replace (prop variant 2)', match);
    return propName + '={<Trans>' + sanitize(propValue) + '</Trans>}';
  });

  const regexVariant3 = new RegExp(propName + "={'([^']+)'}", 'g');
  newSource = newSource.replace(regexVariant3, (match, propValue) => {
    if (verbose) console.log('Replace (prop variant 3)', match);
    return propName + '={<Trans>' + sanitize(propValue) + '</Trans>}';
  });

  return newSource;
};

/**
 * Add the "import { Trans } from ..." at the top of the file, if needed.
 */
const addTranslationImport = source => {
  if (source.includes(importExistenceCheckStr)) return source;

  let newSource = source;
  const flowDeclarationRegex = /\/\/[\s]*@flow/;
  if (flowDeclarationRegex.test(newSource)) {
    // Add after flow declaration
    newSource = newSource.replace(flowDeclarationRegex, match => {
      if (verbose) console.log('Add import (after flow) for', match);
      return '// @flow\n' + importStr + '\n';
    });
  } else {
    if (verbose) console.log('Add import (beginning of the file)');
    newSource = importStr + '\n' + newSource;
  }

  return newSource;
};

const internationalizeFile = filePath =>
  new Promise((resolve, reject) =>
    fs.readFile(filePath, { encoding: 'utf8' }, (err, source) => {
      if (err) return reject(err);

      let newSource = source;
      tagsWhereToInsertTranslation.forEach(tagName => {
        newSource = addTranslationTagInTag(tagName)(newSource);
      });
      propsWhereToInsertTranslation.forEach(propName => {
        newSource = addTranslationTagInProp(propName)(newSource);
      });

      if (source === newSource) {
        return resolve({
          filePath,
          changed: false,
        });
      }

      newSource = addTranslationImport(newSource);

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
      return internationalizeFile(filePath);
    })
  ).then(results => {
    if (dryRun) {
      shell.echo(`⚠️  This was a dry-run, set dryRun to false to do real changes.`);
      shell.exit(0);
    }
  });
});
