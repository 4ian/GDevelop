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

const getLocaleSourceCatalogFiles = localeName => {
  if (localeName === 'en') return ['ide-messages.pot'];
  if (localeName === 'pseudo_LOCALE') return ['ide-messages.pot'];

  return ['ide-messages.po', 'gdcore-gdcpp-gdjs-extensions-messages.po'];
}

const getLocalePath = localeName => {
  return path.join(localesBasePath, localeName);
};

const getLocaleCatalogPath = localeName => {
  return path.join(getLocalePath(localeName), 'messages.po');
};

const getLocaleCompiledCatalogPath = localeName => {
  return path.join(getLocalePath(localeName), 'messages.js');
};

const getLocaleMetadataPath = () => {
  return path.join(localesBasePath, 'LocalesMetadata.js');
};

const getLocaleName = langCode => {
  if (langCode === 'pt_BR') {
    return 'Brazilian Portuguese';
  } else if (langCode === 'zh_CN') {
    return 'Chinese Simplified';
  } else if (langCode === 'zh_TW') {
    return 'Chinese Traditional';
  } else if (langCode === 'sr_CS') {
    return 'Serbian (Latin)';
  } else if (langCode === 'fil_PH') {
    return 'Filipino';
  } else if (langCode === 'pseudo_LOCALE') {
    return 'for development only';
  }

  return ISO6391.getName(getShortestCode(langCode));
};
const getLocaleNativeName = langCode => {
  if (langCode === 'pt_BR') {
    return 'Português brasileiro';
  } else if (langCode === 'zh_CN') {
    return '简化字';
  } else if (langCode === 'zh_TW') {
    return '正體字';
  } else if (langCode === 'sr_CS') {
    return 'srpski';
  } else if (langCode === 'fil_PH') {
    return 'Mga Filipino';
  } else if (langCode === 'pseudo_LOCALE') {
    return 'Pseudolocalization';
  }

  return ISO6391.getNativeName(getShortestCode(langCode));
};

module.exports = {
  getLocales,
  getLocalePath,
  getLocaleSourceCatalogFiles,
  getLocaleCatalogPath,
  getLocaleCompiledCatalogPath,
  getLocaleMetadataPath,
  getLocaleName,
  getLocaleNativeName,
};
