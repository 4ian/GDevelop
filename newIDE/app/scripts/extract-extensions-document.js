/**
 * Launch this script to generate a list(in markdown format) of all custom extensions.
 */

const fs = require('fs');
const axios = require('axios');

const extensionsRegistoryURL =
  'https://raw.githubusercontent.com/4ian/GDevelop-extensions/master/extensions-registry.json';
const outputFile = 'community-made-extensions.dokuwiki.md';

const writeFile = content => {
  return new Promise((resolve, reject) => {
    fs.writeFile(outputFile, content, err => {
      if (err) return reject(err);
      resolve();
    });
  });
};

(async () => {
  try {
    const response = await axios.get(extensionsRegistoryURL);
    let texts = '# List of community-made extensions\n\n';

    response.data.extensionShortHeaders.forEach(element => {
      texts +=
        '## ' + element.fullName + '\n' + element.shortDescription + '\n\n';
    });

    writeFile(texts).then(
      () => console.info(`✅ Done. File generated: ${outputFile}`),
      err => console.error('❌ Error while writing output', err)
    );
  } catch (err) {
    console.error('❌ Error while fetching data', err);
  }
})();
