// @ts-check
const { sortKeys, groupBy } = require('./ArrayHelpers');
const {
  gdevelopWikiUrlRoot,
  generateSvgImageIcon,
  getExtensionFolderName,
  getHelpLink,
} = require('./WikiHelpLink');

/** @typedef {import('../../../../GDevelop.js/types').EventsFunctionsExtension} EventsFunctionsExtension */
/** @typedef {import('../../../../GDevelop.js/types').AbstractEventsBasedEntity} AbstractEventsBasedEntity */
/** @typedef {import('../../../../GDevelop.js/types').PlatformExtension} PlatformExtension */
/** @typedef {import('../../../../GDevelop.js/types').ObjectMetadata} ObjectMetadata */
/** @typedef {import('../../../../GDevelop.js/types').BehaviorMetadata} BehaviorMetadata */

/**
 * @typedef {Object} ExtensionItem
 * @prop {string} extensionName
 * @prop {string} fullName
 * @prop {string} description
 * @prop {string} iconUrl
 * @prop {string} helpPath
 * @prop {string} category
 */

/**
 * Generate a section for an extension.
 * @param {ExtensionItem} extension The extension
 * @param {string} baseFolder The base folder for the extension pages.
 */
const generateExtensionSection = (extension, baseFolder) => {
  const folderName = getExtensionFolderName(extension.extensionName);
  // TODO Remove the extra `/reference` folder once pages are moved.
  const referencePageUrl =
    baseFolder === 'all-features'
      ? `${gdevelopWikiUrlRoot}/${baseFolder}/${folderName}/reference`
      : `${gdevelopWikiUrlRoot}/${baseFolder}/${folderName}`;
  const helpPageUrl = getHelpLink(extension.helpPath) || referencePageUrl;

  // @ts-ignore
  const shortDescription =
    extension.description.length > 150
      ? extension.description.slice(0, 100) + '...'
      : extension.description;

  return `|${generateSvgImageIcon(extension.iconUrl)}|**${
    extension.fullName
  }**|${shortDescription}|${`[Read more...](${helpPageUrl})` +
    (helpPageUrl !== referencePageUrl
      ? ` ([reference](${referencePageUrl}))`
      : '')}|\n`;
};

/**
 * @param {{extensionItems: Array<ExtensionItem>, baseFolder: string}} options
 */
const generateAllExtensionsSections = ({ extensionItems, baseFolder }) => {
  let extensionSectionsContent = '';

  /** @type {Record<string, Array<ExtensionItem>>} */
  const extensionsByCategory = sortKeys(
    groupBy(extensionItems, pair => pair.category || 'General')
  );
  for (const category in extensionsByCategory) {
    const extensions = extensionsByCategory[category];

    extensionSectionsContent += `### ${category}\n\n`;
    extensionSectionsContent += '||Name|Description||\n';
    extensionSectionsContent += '|---|---|---|---|\n';

    for (const extension of extensions) {
      extensionSectionsContent += generateExtensionSection(
        extension,
        baseFolder
      );
    }
    extensionSectionsContent += '\n';
  }
  return extensionSectionsContent;
};

module.exports = {
  generateAllExtensionsSections,
};
