// @ts-check

const gdevelopWikiUrlRoot = '/gdevelop5';
const improperlyFormattedHelpPaths = new Set();

/** @param {string} str */
const toKebabCase = str => {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2') // get all lowercase letters that are near to uppercase ones
    .replace(/[\s_]+/g, '-') // replace all spaces and low dash
    .toLowerCase(); // convert to lower case
};

/**
 * @param {string} path
 * @returns {string}
 */
const getHelpLink = path => {
  if (!path) return '';

  /** @param {string} path */
  const isRelativePathToDocumentationRoot = path => {
    return path.startsWith('/');
  };

  /** @param {string} path */
  const isDocumentationAbsoluteUrl = path => {
    return path.startsWith('http://') || path.startsWith('https://');
  };

  if (isRelativePathToDocumentationRoot(path))
    return `${gdevelopWikiUrlRoot}${path}`;

  if (isDocumentationAbsoluteUrl(path)) return path;

  improperlyFormattedHelpPaths.add(path);
  return '';
};

/**
 * @param {string} helpPagePath
 * @returns {string}
 */
const generateReadMoreLink = helpPagePath => {
  const url = getHelpLink(helpPagePath);
  if (!url) return '';

  return `[Read more explanations about it.](${url})`;
};

const renamedExtensionNames = {
  AdMob: 'Admob',
  BuiltinFile: 'Storage',
  FileSystem: 'Filesystem',
  TileMap: 'Tilemap',
  BuiltinMouse: 'MouseTouch',
};

/**
 * @param {string} extensionName
 * @returns {string}
 */
const getExtensionFolderName = extensionName => {
  return toKebabCase(
    renamedExtensionNames[extensionName] ||
      extensionName.replace(/^Builtin/, '')
  );
};

module.exports = {
  gdevelopWikiUrlRoot,
  improperlyFormattedHelpPaths,
  getHelpLink,
  generateReadMoreLink,
  getExtensionFolderName,
};
