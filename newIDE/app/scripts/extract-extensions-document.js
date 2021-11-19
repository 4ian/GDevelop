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
  generateReadMoreLink,
  getExtensionFolderName,
  improperlyFormattedHelpPaths,
} = require('./lib/WikiHelpLink');
const { convertMarkdownToDokuWikiMarkdown } = require('./lib/DokuwikiHelpers');

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
*This page is an auto-generated reference page about the **${fullName}** extension, made by the community of [[https://gdevelop-app.com/|GDevelop, the open-source, cross-platform game engine designed for everyone]].*` +
    ' ' +
    'Learn more about [[gdevelop5:extensions|all GDevelop community-made extensions here]].'
  );
};

/**
 * Return the list of all extensions and their associated short headers
 * (useful as containing author public profiles information).
 */
const getAllExtensionAndExtensionShortHeaders = async () => {
  const response = await axios.get(extensionShortHeadersUrl);
  const extensionShortHeaders = response.data;
  if (!extensionShortHeaders.length) {
    throw new Error('Unexpected response from the extension endpoint.');
  }

  const extensions = await Promise.all(
    extensionShortHeaders.map(async extensionShortHeader => {
      const response = await axios.get(extensionShortHeader.url);
      const extension = response.data;
      if (!extension) {
        throw new Error(
          `Unexpected response when fetching an extension (${
            extensionShortHeader.url
          }).`
        );
      }

      return { extensionShortHeader, extension };
    })
  );

  return extensions;
};

(async () => {
  try {
    console.info(`ℹ️ Loading all community extensions...`);
    const extensionsAndExtensionShortHeaders = await getAllExtensionAndExtensionShortHeaders();

    let indexPageContent = `# Extensions

GDevelop is built in a flexible way. In addition to [[gdevelop5:all-features|core features]], new capabilities are provided by extensions. Extensions can contain objects, behaviors, actions, conditions, expressions or events.

[[gdevelop5:extensions:search|Directly from GDevelop]], you have access to a collection of community created extensions, listed here. You can also [[gdevelop5:extensions:create|create]], directly in your project, new behaviors, actions, conditions or expressions for your game.

`;

    for (const {
      extension,
      extensionShortHeader,
    } of extensionsAndExtensionShortHeaders) {
      const folderName = getExtensionFolderName(extension.name);
      const referencePageUrl = `${gdevelopWikiUrlRoot}/extensions/${folderName}/reference`;
      const helpPageUrl = getHelpLink(extension.helpPath) || referencePageUrl;
      const authorUsernames = (extensionShortHeader.authors || [])
        .map(author => author.username || null)
        .filter(Boolean);

      const referencePageContent =
        `# ${extension.fullName}` +
        '\n\n' +
        generateSvgImageIcon(extension.previewIconUrl) +
        '\n' +
        `${extension.shortDescription}\n` +
        '\n' +
        `**Authors and contributors** to this community extension: ${
          authorUsernames.length ? authorUsernames.join(', ') : 'not specified'
        }.\n` +
        '\n' +
        '---\n' +
        '\n' +
        convertMarkdownToDokuWikiMarkdown(extension.description) +
        '\n' +
        generateExtensionFooterText(extension.fullName);

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

      indexPageContent +=
        '## ' +
        extension.fullName +
        '\n' +
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
        '\n\n';
    }

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
  }
})();
