const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const recursive = require('recursive-readdir');

const newIdeAppSrcPath = path.join(__dirname, '../src');

const analyzeFile = filePath =>
  new Promise((resolve, reject) =>
    fs.readFile(filePath, { encoding: 'utf8' }, (err, content) => {
      if (err) return reject(err);

      const results = {
        filePath: filePath,
        supportsTrans: false,
        requiresTrans: false,
        supportsI18n: false,
        requiresI18n: false,
        reason: '(no reason)',
      };

      results.supportsTrans = content.includes('import { Trans }');
      results.supportsI18n =
        content.includes('import { t }') && content.includes('i18n');

      if (
        content.includes("from 'react';") &&
        (content.includes('label="') ||
          content.includes('label={') ||
          content.includes('Label="') ||
          content.includes('Label={') ||
          content.includes('floatingLabelText="') ||
          content.includes('floatingLabelText={') ||
          content.includes('title="') ||
          content.includes('title={') ||
          content.includes('message="') ||
          content.includes('message={') ||
          content.includes('primaryText=') ||
          content.includes('primaryText={') ||
          content.includes('hintText=') ||
          content.includes('hintText={') ||
          content.includes('tooltip=') ||
          content.includes('tooltip={') ||
          content.includes('<EmptyMessage') ||
          content.includes('<MiniToolbarText') ||
          content.includes('<BackgroundText'))
        // /(?<!key)=("|\{["'])/.test(content)
      ) {
        results.requiresTrans = true;
        results.reason = 'React with string properties';
      }

      if (content.includes('label: \'')) {
        results.requiresTrans = true;
        results.reason = '"label: " with a string found';
      }

      if (
        content.includes('showWarningBox(') ||
        content.includes('showErrorBox(') ||
        content.includes('showMessageBox(')
      ) {
        results.requiresI18n = true;
        results.reason = 'message box found';
      }

      if (content.includes('confirm(')) {
        results.requiresI18n = true;
        results.reason = 'confirm function found';
      }

      if (content.includes('No i18n in this file')) {
        results.requiresTrans = false;
        results.requiresI18n = false;
        results.reason = "Explicit comment telling no i18n required";
      }

      // Other things: (Base layer)
      // Manual things: makeNonBreakable

      resolve(results);
    })
  );

recursive(newIdeAppSrcPath, function(err, files) {
  if (err) {
    shell.echo(`❌ Error(s) occurred while reading files `, err);
    shell.exit(1);
  }

  Promise.all(
    files.map(filePath => {
      return analyzeFile(filePath);
    })
  ).then(results => {
    const requireTrans = results.filter(({ requiresTrans }) => requiresTrans);
    const dontRequireTrans = results.filter(
      ({ requiresTrans }) => !requiresTrans
    );
    const missingTransSupport = requireTrans.filter(
      ({ supportsTrans }) => !supportsTrans
    );
    const requireI18n = results.filter(({ requiresI18n }) => requiresI18n);
    const dontRequireI18n = results.filter(({ requiresI18n }) => !requiresI18n);
    const missingI18nSupport = requireI18n.filter(
      ({ supportsI18n }) => !supportsI18n
    );

    shell.echo(`ℹ️ No Trans required: ${dontRequireTrans.length} files`);
    shell.echo(`ℹ️ Requires Trans: ${requireTrans.length} files`);
    shell.echo(
      `ℹ️ Missing Trans support: ${missingTransSupport.length} files:`
    );
    missingTransSupport.forEach(({ filePath, reason }) => {
      shell.echo(`  * ${filePath} (Reason: ${reason})`);
    });
    shell.echo(`ℹ️ No i18n required: ${dontRequireI18n.length} files`);
    shell.echo(`ℹ️ Requires i18n: ${requireI18n.length} files`);
    shell.echo(`ℹ️ Missing i18n support: ${missingI18nSupport.length} files:`);
    missingI18nSupport.forEach(({ filePath, reason }) => {
      shell.echo(`  * ${filePath} (Reason: ${reason})`);
    });
  });
});
