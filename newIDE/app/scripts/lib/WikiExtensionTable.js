// @ts-check
const { sortKeys, groupBy } = require('./ArrayHelpers');
const {
  gdevelopWikiUrlRoot,
  generateSvgImageIcon,
  getExtensionFolderName,
  getHelpLink,
} = require('./WikiHelpLink');

/** @typedef {import('../../../../GDevelop.js/types').EventsFunctionsExtension} EventsFunctionsExtension */
/** @typedef {import('../../../../GDevelop.js/types').PlatformExtension} PlatformExtension */

/**
 * Generate a section for an extension.
 * @param {EventsFunctionsExtension | PlatformExtension} extension The extension
 * @param {string} baseFolder The base folder for the extension pages.
 */
const generateExtensionSection = (extension, baseFolder) => {
  const folderName = getExtensionFolderName(extension.getName());
  const referencePageUrl = `${gdevelopWikiUrlRoot}/${baseFolder}/${folderName}`;
  const helpPageUrl = getHelpLink(extension.getHelpPath()) || referencePageUrl;

  // @ts-ignore
  const icon = extension.getPreviewIconUrl
    ? // @ts-ignore
      extension.getPreviewIconUrl()
    : extension.getIconUrl();
  // @ts-ignore
  const shortDescription = extension.getShortDescription
    ? // @ts-ignore
      extension.getShortDescription()
    : extension.getDescription().slice(0, 100) + '...';

  return `|${generateSvgImageIcon(
    icon
  )}|**${extension.getFullName()}**|${shortDescription}|${`[Read more...](${helpPageUrl})` +
    (helpPageUrl !== referencePageUrl
      ? ` ([reference](${referencePageUrl}))`
      : '')}|\n`;
};

/**
 * @param {{extensions: Array<EventsFunctionsExtension | PlatformExtension>, baseFolder: string}} options
 */
const generateAllExtensionsSections = ({ extensions, baseFolder }) => {
  let extensionSectionsContent = '';

  /** @type {Record<string, Array<EventsFunctionsExtension | PlatformExtension>>} */
  const extensionsByCategory = sortKeys(
    groupBy(extensions, pair => pair.getCategory() || 'General')
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
