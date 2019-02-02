const fs = require('fs');
const path = require('path');

const newIdeAppPath = path.join(__dirname, '../..');
const localesBasePath =  path.join(newIdeAppPath, 'src/locales')

const getLocales = () => {
  return new Promise((resolve, reject) => {
    fs.readdir(localesBasePath, (error, locales) => {
      if (error) {
        return reject(error);
      }

      return resolve(
        locales
          .filter(name => name !== '.DS_Store')
          .filter(name => name !== '_build')
      );
    });
  });
};

const getLocalePath = (localeName) => {
    return path.join(localesBasePath, localeName);
}

module.exports = {
  getLocales,
  getLocalePath,
};
