const path = require('path');
const fs = require('fs');
const dir = path.resolve(__dirname, '../../src/UI/Theme/');

function matchAll(pattern, input) {
  return input
    .match(new RegExp(pattern, 'g'))
    .map(index => index.match(new RegExp(pattern)));
}

module.exports = () => {
  const registryFileContents = fs.readFileSync(path.resolve(dir, './ThemeRegistry.js')).toString();

  return matchAll(/\['(.*)']: (.*),/, registryFileContents)
    .map(it => {
      return ({
        name: it[1],
        id: it[2],
      });
    });
};
