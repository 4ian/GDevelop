// @noflow
const fs = require('fs');
const path = require('path');

const srcRoot = path.resolve(__dirname, '../..');
const removedComponentPath = path.join(__dirname, 'SubscriptionChecker.js');
const thisFile = path.resolve(__filename);

const listJavaScriptFiles = dir => {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (entry.name === 'locales') continue;

      files.push(...listJavaScriptFiles(entryPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.js')) {
      files.push(entryPath);
    }
  }

  return files;
};

describe('SubscriptionChecker removal', () => {
  it('removes the SubscriptionChecker component and all application references', () => {
    expect(fs.existsSync(removedComponentPath)).toBe(false);

    const remainingReferences = listJavaScriptFiles(srcRoot)
      .filter(filePath => path.resolve(filePath) !== thisFile)
      .filter(filePath =>
        fs.readFileSync(filePath, 'utf8').includes('SubscriptionChecker')
      );

    expect(remainingReferences).toEqual([]);
  });
});
