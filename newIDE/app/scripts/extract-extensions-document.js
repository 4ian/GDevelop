// @ts-check
/**
 * Launch this script to generate a list (in markdown format) of all custom extensions.
 */

const fs = require('fs').promises;
const { default: axios } = require('axios');
const path = require('path');
const {
  gdevelopWikiUrlRoot,
  getHelpLink,
  getExtensionFolderName,
  improperlyFormattedHelpPaths,
} = require('./lib/WikiHelpLink');
const { convertMarkdownToDokuWikiMarkdown } = require('./lib/DokuwikiHelpers');
const shell = require('shelljs');

const extensionShortHeadersUrl =
  'https://api.gdevelop-app.com/asset/extension-short-header';
const gdRootPath = path.join(__dirname, '..', '..', '..');
const outputRootPath = path.join(gdRootPath, 'docs-wiki');
const extensionsRootPath = path.join(outputRootPath, 'extensions');
const extensionsFilePath = path.join(outputRootPath, 'extensions.txt');

const generateSvgImageIcon = iconUrl => {
  // Use the `&.png?` syntax to force Dokuwiki to display the image.
  // See https://www.dokuwiki.org/images.
  return `{{${iconUrl}?&.png?nolink&48x48 |}}`;
};

/** @returns {string} */
const generateExtensionFooterText = fullName => {
  return (
    `
---
*This page is an auto-generated reference page about the **${fullName}** extension, made by the community of [[https://gdevelop.io/|GDevelop, the open-source, cross-platform game engine designed for everyone]].*` +
    ' ' +
    'Learn more about [[gdevelop5:extensions|all GDevelop community-made extensions here]].'
  );
};

/**
 * @param {{id: string, username: string}[]} authors
 */
const generateAuthorNamesWithLinks = authors => {
  const authorAndLinks = authors
    .map(author => {
      if (!author.username) return null;

      return `[${author.username}](https://liluo.io/${author.username})`;
    })
    .filter(Boolean)
    .join(', ');

  return authorAndLinks ? authorAndLinks : '(not specified)';
};

/**
 * Return the list of all extensions and their associated short headers
 * (useful as containing author public profiles information).
 * @returns {Promise<Array<{ tier: 'community' | 'reviewed', shortDescription: string, authorIds: Array<string>, authors?: Array<{id: string, username: string}>, extensionNamespace: string, fullName: string, name: string, version: string, gdevelopVersion?: string, url: string, headerUrl: string, tags: Array<string>, category: string, previewIconUrl: string, eventsBasedBehaviorsCount: number, eventsFunctionsCount: number, helpPath: string, description: string, iconUrl: string}>>} A promise to all extension headers
 */
const getAllExtensionHeaders = async () => {
  const response = await axios.get(extensionShortHeadersUrl);
  const extensionShortHeaders = response.data;
  if (!extensionShortHeaders.length) {
    throw new Error('Unexpected response from the extension endpoint.');
  }

  const extensionHeaders = await Promise.all(
    extensionShortHeaders.map(async extensionShortHeader => {
      const response = await axios.get(extensionShortHeader.headerUrl);
      const extensionHeader = response.data;
      if (!extensionHeader) {
        throw new Error(
          `Unexpected response when fetching an extension header (${
            extensionShortHeader.headerUrl
          }).`
        );
      }

      return extensionHeader;
    })
  );

  return extensionHeaders;
};

const groupBy = (array, getKey) => {
  const table = {};
  for (const element of array) {
    const key = getKey(element);
    let group = table[key];
    if (!group) {
      group = [];
      table[key] = group;
    }
    group.push(element);
  }
  return table;
};

const sortKeys = table => {
  const sortedTable = {};
  for (const key of Object.keys(table).sort()) {
    sortedTable[key] = table[key];
  }
  return sortedTable;
};

/**
 * Create a page for an extension.
 * @param {{ tier: 'community' | 'reviewed', shortDescription: string, authorIds: Array<string>, authors?: Array<{id: string, username: string}>, extensionNamespace: string, fullName: string, name: string, version: string, gdevelopVersion?: string, url: string, headerUrl: string, tags: Array<string>, category: string, previewIconUrl: string, eventsBasedBehaviorsCount: number, eventsFunctionsCount: number, helpPath: string, description: string, iconUrl: string}} extensionHeader 
 * @param {boolean} isCommunity 
 */
const createExtensionReferencePage = async (
  extensionHeader,
  isCommunity
) => {
  const folderName = getExtensionFolderName(extensionHeader.name);
  const referencePageUrl = `${gdevelopWikiUrlRoot}/extensions/${folderName}/reference`;
  const helpPageUrl = getHelpLink(extensionHeader.helpPath) || referencePageUrl;
  const authorNamesWithLinks = generateAuthorNamesWithLinks(
    extensionHeader.authors || []
  );

  const referencePageContent =
    `# ${extensionHeader.fullName}` +
    '\n\n' +
    generateSvgImageIcon(extensionHeader.previewIconUrl) +
    '\n' +
    `${extensionHeader.shortDescription}\n` +
    '\n' +
    `**Authors and contributors** to this community extension: ${authorNamesWithLinks}.\n` +
    '\n' +
    (isCommunity
      ? `<note important>
This is an extension made by a community member — but not reviewed
by the GDevelop extension team. As such, we can't guarantee it
meets all the quality standards of official extensions. In case of
doubt, contact the author to know more about what the extension
does or inspect its content before using it.
</note>\n\n`
      : '') +
    '---\n' +
    '\n' +
    convertMarkdownToDokuWikiMarkdown(extensionHeader.description) +
    '\n' +
    (extensionHeader.helpPath ? `\n[[${helpPageUrl}|Read more...]]\n` : ``) +
    generateExtensionFooterText(extensionHeader.fullName);

  const extensionReferenceFilePath = path.join(
    extensionsRootPath,
    folderName,
    'reference.txt'
  );
  await fs.mkdir(path.dirname(extensionReferenceFilePath), {
    recursive: true,
  });
  await fs.writeFile(extensionReferenceFilePath, referencePageContent);
  console.info(`ℹ️ File generated: ${extensionReferenceFilePath}`);
};

const generateExtensionSection = (extension, extensionShortHeader) => {
  const folderName = getExtensionFolderName(extension.name);
  const referencePageUrl = `${gdevelopWikiUrlRoot}/extensions/${folderName}/reference`;
  const helpPageUrl = getHelpLink(extension.helpPath) || referencePageUrl;

  return (
    `#### ${extension.fullName}\n` +
    // Use the `&.png?` syntax to force Dokuwiki to display the image.
    // See https://www.dokuwiki.org/images.
    generateSvgImageIcon(extension.previewIconUrl) +
    '\n' +
    extension.shortDescription +
    '\n\n' +
    // Link to help page or to reference if none.
    `[[${helpPageUrl}|Read more...]]` +
    (helpPageUrl !== referencePageUrl
      ? ` ([[${referencePageUrl}|reference]])`
      : '') +
    '\n\n'
  );
};

const generateAllExtensionsSections = extensionsAndExtensionShortHeaders => {
  let extensionSectionsContent = '';
  const extensionsByCategory = sortKeys(
    groupBy(
      extensionsAndExtensionShortHeaders,
      pair => pair.extension.category || 'General'
    )
  );
  for (const category in extensionsByCategory) {
    const extensions = extensionsByCategory[category];

    extensionSectionsContent += `### ${category}\n\n`;
    for (const { extension, extensionShortHeader } of extensions) {
      extensionSectionsContent += generateExtensionSection(
        extension,
        extensionShortHeader
      );
    }
  }
  return extensionSectionsContent;
};

(async () => {
  try {
    console.info(`ℹ️ Loading all community extensions...`);
    const extensionHeaders = await getAllExtensionHeaders();

    let indexPageContent = `# Extensions

GDevelop is built in a flexible way. In addition to [[gdevelop5:all-features|core features]], new capabilities are provided by extensions. Extensions can contain objects, behaviors, actions, conditions, expressions or events.

[[gdevelop5:extensions:search|Directly from GDevelop]], you have access to a collection of community created extensions, listed here. You can also [[gdevelop5:extensions:create|create]], directly in your project, new behaviors, actions, conditions or expressions for your game.

`;

    const reviewedExtensionHeaders = extensionHeaders.filter(
      pair => pair.tier !== 'community'
    );
    const communityExtensionHeaders = extensionHeaders.filter(
      pair => pair.tier === 'community'
    );

    indexPageContent += '## Reviewed extensions\n\n';
    for (const extensionHeader of reviewedExtensionHeaders) {
      await createExtensionReferencePage(
        extensionHeader,
        false
      );
    }
    indexPageContent += generateAllExtensionsSections(
      reviewedExtensionHeaders
    );

    indexPageContent += `## Community extensions

The following extensions are made by community members — but not reviewed
by the GDevelop extension team. As such, we can't guarantee it
meets all the quality standards of official extensions. In case of
doubt, contact the author to know more about what the extension
does or inspect its content before using it.

`;
    for (const extensiontHeader of communityExtensionHeaders) {
      await createExtensionReferencePage(extensiontHeader, true);
    }
    indexPageContent += generateAllExtensionsSections(
      communityExtensionHeaders
    );

    indexPageContent += `
## Make your own extension

It's easy to create, directly in your project, new behaviors, actions, conditions or expressions for your game.

Read more about this:

* [[gdevelop5:extensions:create|Create your own extensions]]
* [[gdevelop5:extensions:share|Share extensions with the community]]
* [[gdevelop5:extensions:extend-gdevelop|Extend GDevelop with JavaScript or C++]]`;

    try {
      await fs.mkdir(path.dirname(extensionsFilePath), { recursive: true });
      await fs.writeFile(extensionsFilePath, indexPageContent);
      console.info(`✅ Done. File generated: ${extensionsFilePath}`);
    } catch (err) {
      console.error('❌ Error while writing output', err);
      shell.exit(1);
    }

    if (improperlyFormattedHelpPaths.size > 0) {
      console.info(
        `⚠️ Extensions documents generated, but some help paths are invalid:`,
        improperlyFormattedHelpPaths.keys()
      );
    } else {
      console.info(`✅ Extensions documents generated.`);
    }
  } catch (err) {
    console.error('❌ Error while fetching data', err);
    shell.exit(1);
  }
})();
