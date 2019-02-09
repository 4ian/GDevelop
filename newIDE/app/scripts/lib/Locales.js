const fs = require('fs');
const path = require('path');
const ISO6391 = require('iso-639-1');

const newIdeAppPath = path.join(__dirname, '../..');
const localesBasePath = path.join(newIdeAppPath, 'src/locales');

const getShortestCode = langLongCode => {
  if (langLongCode === 'pt_BR') return langLongCode;

  const langParts = langLongCode.split('_');
  return langParts[0];
};

const getLocales = () => {
  return new Promise((resolve, reject) => {
    fs.readdir(localesBasePath, (error, locales) => {
      if (error) {
        return reject(error);
      }

      return resolve(
        locales
          .filter(name => name !== '.DS_Store')
          .filter(name => name !== 'LocalesMetadata.js')
          .filter(name => name !== '_build')
      );
    });
  });
};

const getLocalePath = localeName => {
  return path.join(localesBasePath, localeName);
};

const getLocaleCompiledCatalogPath = localeName => {
  return path.join(getLocalePath(localeName), 'messages.js');
};

const getLocaleMetadataPath = () => {
  return path.join(localesBasePath, 'LocalesMetadata.js');
}

const getLocaleName = langCode => ISO6391.getName(getShortestCode(langCode));
const getLocaleNativeName = langCode => ISO6391.getNativeName(getShortestCode(langCode));

module.exports = {
  getLocales,
  getLocalePath,
  getLocaleCompiledCatalogPath,
  getLocaleMetadataPath,
  getLocaleName,
  getLocaleNativeName,
};
