/**
 * Launch this script to generate a list(in markdown format) of all custom extensions.
 */

const fs = require("fs");
const https = require("https");

const extensionsRegistoryURL = 'https://raw.githubusercontent.com/4ian/GDevelop-extensions/master/extensions-registry.json';
const outputFile = 'community-made-extensions.dokuwiki.md';

const writeFile = content => {
  return new Promise((resolve, reject) => {
    fs.writeFile(outputFile, content, err => {
      if (err) return reject(err);
      resolve();
    });
  });
};

https.get(extensionsRegistoryURL, function(res) {
  let data = '',
    json_data;

  res.on('data', function(stream) {
    data += stream;
  });
  
  res.on('end', function() {
    json_data = JSON.parse(data);
    let texts = '## List of community-made extensions\n\n';
    
    json_data.extensionShortHeaders
    .forEach(element => {
      texts += '### ' + element.fullName + '\n' + element.shortDescription + '\n\n';
    });
    
    writeFile(texts)
    .then(
      () => console.info(`✅ Done. File generated: ${outputFile}`),
      err => console.error('❌ Error while writing output', err)
    );
  });
})
.on('error', function(e) {
  console.log(e.message);
});
