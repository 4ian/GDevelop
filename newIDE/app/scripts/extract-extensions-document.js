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
const shell = require('shelljs');

/** @typedef {{ tier: 'community' | 'reviewed', shortDescription: string, authorIds: Array<string>, authors?: Array<{id: string, username: string}>, extensionNamespace: string, fullName: string, name: string, version: string, gdevelopVersion?: string, url: string, headerUrl: string, tags: Array<string>, category: string, previewIconUrl: string, eventsBasedBehaviorsCount: number, eventsFunctionsCount: number, helpPath: string, description: string, iconUrl: string}} ExtensionHeader */

const extensionShortHeadersUrl =
  'https://api.gdevelop-app.com/asset/extension-short-header';
const gdRootPath = path.join(__dirname, '..', '..', '..');
const outputRootPath = path.join(gdRootPath, 'docs-wiki');
const extensionsRootPath = path.join(outputRootPath, 'extensions');
const extensionsIndexFilePath = path.join(
  extensionsRootPath,
  'existing-extensions'
);
const extensionsMainFilePath = path.join(extensionsRootPath, 'index.md');

const generateSvgImageIcon = iconUrl => {
  return `<img src="${iconUrl}" class="extension-icon"></img>`;
};

/** @returns {string} */
const generateExtensionFooterText = fullName => {
  return (
    `
---

!!! tip

    Learn [how to install new extensions](/gdevelop5/extensions/search) by following a step-by-step guide.

*This page is an auto-generated reference page about the **${fullName}** extension, made by the community of [GDevelop, the open-source, cross-platform game engine designed for everyone](https://gdevelop.io/).*` +
    ' ' +
    'Learn more about [all GDevelop community-made extensions here](/gdevelop5/extensions).'
  );
};

/**
 * @param {{id: string, username: string}[]} authors
 */
const generateAuthorNamesWithLinks = authors => {
  const authorAndLinks = authors
    .map(author => {
      if (!author.username) return null;

      return `[${author.username}](https://gd.games/${author.username})`;
    })
    .filter(Boolean)
    .join(', ');

  return authorAndLinks ? authorAndLinks : '(not specified)';
};

/**
 * Return the list of all extensions and their associated short headers
 * (useful as containing author public profiles information).
 * @returns {Promise<Array<ExtensionHeader>>} A promise to all extension headers
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
      return { ...extensionHeader, ...extensionShortHeader };
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
 * @param {ExtensionHeader} extensionHeader The extension header
 * @param {boolean} isCommunity The tier
 */
const createExtensionReferencePage = async (extensionHeader, isCommunity) => {
  const folderName = getExtensionFolderName(extensionHeader.name);
  const referencePageUrl = `${gdevelopWikiUrlRoot}/extensions/existing-extensions/${folderName}`;
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
      ? `!!! warning
    This is an extension made by a community member — but not reviewed
    by the GDevelop extension team. As such, we can't guarantee it
    meets all the quality standards of official extensions. In case of
    doubt, contact the author to know more about what the extension
    does or inspect its content before using it.
\n\n`
      : '') +
    '---\n' +
    '\n' +
    extensionHeader.description +
    '\n' +
    (extensionHeader.helpPath ? `\n[Read more...](${helpPageUrl})\n` : ``) +
    generateExtensionFooterText(extensionHeader.fullName);

  const extensionReferenceFilePath = path.join(
    extensionsIndexFilePath,
    folderName,
    'index.md'
  );
  await fs.mkdir(path.dirname(extensionReferenceFilePath), {
    recursive: true,
  });
  await fs.writeFile(extensionReferenceFilePath, referencePageContent);
  console.info(`ℹ️ File generated: ${extensionReferenceFilePath}`);
};

/**
 * Generate a section for an extension.
 * @param {ExtensionHeader} extensionHeader The extension header
 */
const generateExtensionSection = extensionHeader => {
  const folderName = getExtensionFolderName(extensionHeader.name);
  const referencePageUrl = `${gdevelopWikiUrlRoot}/extensions/existing-extensions/${folderName}`;
  const helpPageUrl = getHelpLink(extensionHeader.helpPath) || referencePageUrl;

  return `|${generateSvgImageIcon(extensionHeader.previewIconUrl)}|**${
    extensionHeader.fullName
  }**|${extensionHeader.shortDescription}|${`[Read more...](${helpPageUrl})` +
    (helpPageUrl !== referencePageUrl
      ? ` ([reference](${referencePageUrl}))`
      : '')}|\n`;
};

const generateAllExtensionsSections = extensionShortHeaders => {
  let extensionSectionsContent = '';
  const extensionsByCategory = sortKeys(
    groupBy(extensionShortHeaders, pair => pair.category || 'General')
  );
  for (const category in extensionsByCategory) {
    const extensions = extensionsByCategory[category];

    extensionSectionsContent += `### ${category}\n\n`;
    extensionSectionsContent += '||Name|Description||\n';
    extensionSectionsContent += '|---|---|---|---|\n';

    for (const extensionHeader of extensions) {
      extensionSectionsContent += generateExtensionSection(extensionHeader);
    }
    extensionSectionsContent += '\n';
  }
  return extensionSectionsContent;
};

const generateExtensionsListPage = async extensionShortHeaders => {
  let indexPageContent = `---
title: Existing extensions
---

This pages lists all extensions that you can [install directly from GDevelop](/gdevelop5/extensions/search).

The list is divided in [two tiers](/gdevelop5/extensions/tiers/):
- [Reviewed extensions](#reviewed-extensions)
- [Community extensions](#community-extensions)
`;
  const extensionHeaders = await getAllExtensionHeaders();
  const reviewedExtensionHeaders = extensionHeaders.filter(
    pair => pair.tier !== 'community'
  );
  const communityExtensionHeaders = extensionHeaders.filter(
    pair => pair.tier === 'community'
  );

  indexPageContent += '## Reviewed extensions\n\n';
  for (const extensionHeader of reviewedExtensionHeaders) {
    await createExtensionReferencePage(extensionHeader, false);
  }
  indexPageContent += generateAllExtensionsSections(reviewedExtensionHeaders);

  indexPageContent += `## Community extensions

The following extensions are made by community members — but not reviewed
by the GDevelop extension team. As such, we can't guarantee it
meets all the quality standards of official extensions. In case of
doubt, contact the author to know more about what the extension
does or inspect its content before using it.

`;
  for (const extensionHeader of communityExtensionHeaders) {
    await createExtensionReferencePage(extensionHeader, true);
  }
  indexPageContent += generateAllExtensionsSections(communityExtensionHeaders);

  try {
    await fs.mkdir(extensionsIndexFilePath, { recursive: true });
    await fs.writeFile(
      path.join(extensionsIndexFilePath, 'index.md'),
      indexPageContent
    );
    console.info(`✅ Done. File generated: ${extensionsIndexFilePath}`);
  } catch (err) {
    console.error('❌ Error while writing output', err);
    shell.exit(1);
  }
};

(async () => {
  try {
    console.info(`ℹ️ Loading all community extensions...`);

    let indexPageContent = `# Extensions

GDevelop is built in a flexible way. In addition to [core features](/gdevelop5/all-features), new capabilities are provided by extensions. Extensions can contain objects, behaviors, actions, conditions, expressions or events.

[Directly from GDevelop](/gdevelop5/extensions/search), you have access to a collection of community created extensions, [listed here](/gdevelop5/extensions/existing-extensions/).
You can also [create](/gdevelop5/extensions/create) directly in your project new behaviors, actions, conditions or expressions for your game.

Read more about this:

* [Create your own extensions](/gdevelop5/extensions/create)
* [Share extensions with the community](/gdevelop5/extensions/share)
* [Extend GDevelop with JavaScript or C++](/gdevelop5/extensions/extend-gdevelop)`;

    await generateExtensionsListPage();

    try {
      await fs.mkdir(path.dirname(extensionsMainFilePath), { recursive: true });
      await fs.writeFile(extensionsMainFilePath, indexPageContent);
      console.info(`✅ Done. File generated: ${extensionsMainFilePath}`);
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
