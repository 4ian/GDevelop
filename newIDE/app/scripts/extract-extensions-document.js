// @ts-check
/**
 * Launch this script to generate a list (in markdown format) of all custom extensions.
 */

const initializeGDevelopJs = require('../public/libGD.js');
const fs = require('fs').promises;
const { default: axios } = require('axios');
const path = require('path');
const {
  gdevelopWikiUrlRoot,
  getHelpLink,
  getExtensionFolderName,
  improperlyFormattedHelpPaths,
  generateSvgImageIcon,
} = require('./lib/WikiHelpLink');
const {
  convertCommonMarkdownToPythonMarkdown,
} = require('./lib/PythonMarkdownHelper');
const shell = require('shelljs');
const {
  generateExtensionReference,
  generateExtensionRawText,
  rawTextsToString,
} = require('./lib/ExtensionReferenceGenerator');
const { mapVector, mapFor } = require('./lib/MapFor');
const { groupBy, sortKeys } = require('./lib/ArrayHelpers');
const { generateAllExtensionsSections } = require('./lib/WikiExtensionTable');

/** @typedef {import("./lib/ExtensionReferenceGenerator.js").RawText} RawText */

/** @typedef {{ tier: 'community' | 'experimental' | 'reviewed', shortDescription: string, authorIds: Array<string>, authors?: Array<{id: string, username: string}>, extensionNamespace: string, fullName: string, name: string, version: string, gdevelopVersion?: string, url: string, headerUrl: string, tags: Array<string>, category: string, previewIconUrl: string, eventsBasedBehaviorsCount: number, eventsFunctionsCount: number}} ExtensionShortHeader */

const extensionShortHeadersUrl =
  'https://api.gdevelop-app.com/asset/extension-short-header';
const gdRootPath = path.join(__dirname, '..', '..', '..');
const outputRootPath = path.join(gdRootPath, 'docs-wiki');
const extensionsRootPath = path.join(outputRootPath, 'extensions');
const extensionsMainFilePath = path.join(extensionsRootPath, 'index.md');

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
 * Add a serialized (JS object) events function extension to the project.
 *
 * (useful as containing author public profiles information).
 *
 * @param {any} gd
 * @param {any} project (gdProject)
 *
 * @returns {Promise<any>} A promise to all extensions (gdEventsFunctionsExtension)
 */
const addAllExtensionsToProject = async (gd, project) => {
  const response = await axios.get(extensionShortHeadersUrl);
  const extensionShortHeaders = response.data;
  if (!extensionShortHeaders.length) {
    throw new Error('Unexpected response from the extension endpoint.');
  }

  return await Promise.all(
    extensionShortHeaders.map(async extensionShortHeader => {
      const response = await axios.get(extensionShortHeader.url);
      const serializedExtension = response.data;
      if (!serializedExtension) {
        throw new Error(
          `Unexpected response when fetching an extension (${
            extensionShortHeader.url
          }).`
        );
      }

      const { name } = serializedExtension;
      if (!name)
        return Promise.reject(new Error('Malformed extension (missing name).'));

      const newEventsFunctionsExtension = project.insertNewEventsFunctionsExtension(
        name,
        0
      );
      unserializeFromJSObject(
        gd,
        newEventsFunctionsExtension,
        serializedExtension,
        'unserializeFrom',
        project
      );

      return newEventsFunctionsExtension;
    })
  );
};

/**
 * Tool function to restore a serializable object from a JS object.
 * Most gd.* objects are "serializable", meaning they have a serializeTo
 * and unserializeFrom method.
 * @param {any} serializable A gd.* object to restore (gdSerializable)
 * @param {Object} object The JS object to be used to restore the serializable.
 * @param {string} methodName The name of the unserialization method. "unserializeFrom" by default
 * @param {?any} optionalProject The project to pass as argument for unserialization (gdProject)
 */
function unserializeFromJSObject(
  gd,
  serializable,
  object,
  methodName = 'unserializeFrom',
  optionalProject = undefined
) {
  const serializedElement = gd.Serializer.fromJSObject(object);
  if (!optionalProject) {
    serializable[methodName](serializedElement);
  } else {
    // It's not uncommon for unserializeFrom methods of gd.* classes
    // to require the project to be passed as first argument.
    serializable[methodName](optionalProject, serializedElement);
  }
  serializedElement.delete();
}

/**
 * Return the list of all extensions and their associated short headers
 * (useful as containing author public profiles information).
 * @returns {Promise<Array<ExtensionShortHeader>>} A promise to all extension headers
 */
const getAllExtensionShortHeaders = async () => {
  const response = await axios.get(extensionShortHeadersUrl);
  const extensionShortHeaders = response.data;
  if (!extensionShortHeaders.length) {
    throw new Error('Unexpected response from the extension endpoint.');
  }
  return extensionShortHeaders;
};

/**
 * Create a page for an extension.
 * @param {any} gd
 * @param {any} project (gdProject)
 * @param {any} extension The extension (gdEventsFunctionsExtension)
 * @param {ExtensionShortHeader} extensionShortHeader
 * @param {boolean} isExperimental The tier
 */
const createExtensionReferencePage = async (
  gd,
  project,
  extension,
  extensionShortHeader,
  isExperimental
) => {
  const extensionMetadata = generateEventsFunctionExtensionMetadata(
    gd,
    project,
    extension
  );
  const extensionReference = generateExtensionReference(extensionMetadata);
  const referencePageContent = rawTextsToString(
    generateExtensionRawText(
      extensionReference,
      reference =>
        generateExtensionHeaderText(
          reference,
          extensionShortHeader,
          isExperimental
        ),
      generateExtensionFooterText
    )
  );

  const folderName = getExtensionFolderName(extension.getName());
  const extensionReferenceFilePath = path.join(
    extensionsRootPath,
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
 *
 * @param {{ extension: any }} extension (gdPlatformExtension)
 * @param {ExtensionShortHeader} extensionShortHeader
 * @param {boolean} isExperimental
 * @returns {RawText}
 */
const generateExtensionHeaderText = (
  { extension },
  extensionShortHeader,
  isExperimental
) => {
  const folderName = getExtensionFolderName(extension.getName());
  const referencePageUrl = `${gdevelopWikiUrlRoot}/extensions/${folderName}`;
  const helpPageUrl = getHelpLink(extension.getHelpPath()) || referencePageUrl;
  const authorNamesWithLinks = generateAuthorNamesWithLinks(
    extensionShortHeader.authors || []
  );

  return {
    text:
      `# ${extension.getFullName()}` +
      '\n\n' +
      generateSvgImageIcon(extensionShortHeader.previewIconUrl) +
      '\n' +
      `${extensionShortHeader.shortDescription}\n` +
      '\n' +
      `**Authors and contributors** to this experimental extension: ${authorNamesWithLinks}.\n` +
      '\n' +
      (isExperimental
        ? `!!! warning
    This is an extension made by a community member and it only got through a
    light review by the GDevelop extension team. As such, we can't guarantee it
    meets all the quality standards of fully reviewed extensions.\n\n`
        : '') +
      '---\n' +
      '\n' +
      convertCommonMarkdownToPythonMarkdown(extension.getDescription()) +
      '\n' +
      (extension.getHelpPath() ? `\n[Read more...](${helpPageUrl})\n` : ``) +
      '\n' +
      `!!! tip
    Learn [how to install new extensions](/gdevelop5/extensions/search) by following a step-by-step guide.` +
      '\n',
  };
};

/** @returns {RawText} */
const generateExtensionFooterText = ({ extension }) => {
  return {
    text:
      `
---

*This page is an auto-generated reference page about the **${extension.getFullName()}** extension, made by the community of [GDevelop, the open-source, cross-platform game engine designed for everyone](https://gdevelop.io/).*` +
      ' ' +
      'Learn more about [all GDevelop community-made extensions here](/gdevelop5/extensions).',
  };
};

/**
 * Generate the metadata for the events based extension
 * @param {any} project A project containing of the extensions (gdProject)
 * @param {any} eventsFunctionsExtension An extension (gdEventsFunctionsExtension)
 * @returns {any} the extension metadata (gdPlatformExtension)
 */
const generateEventsFunctionExtensionMetadata = (
  gd,
  project,
  eventsFunctionsExtension
) => {
  const extension = new gd.PlatformExtension();
  gd.MetadataDeclarationHelper.declareExtension(
    extension,
    eventsFunctionsExtension
  );

  // Generate all behaviors and their functions
  mapVector(
    eventsFunctionsExtension.getEventsBasedBehaviors(),
    eventsBasedBehavior => {
      const behaviorMethodMangledNames = new gd.MapStringString();
      gd.MetadataDeclarationHelper.generateBehaviorMetadata(
        project,
        extension,
        eventsFunctionsExtension,
        eventsBasedBehavior,
        behaviorMethodMangledNames
      );
      behaviorMethodMangledNames.delete();
    }
  );
  // Generate all objects and their functions
  mapVector(
    eventsFunctionsExtension.getEventsBasedObjects(),
    eventsBasedObject => {
      const objectMethodMangledNames = new gd.MapStringString();
      gd.MetadataDeclarationHelper.generateObjectMetadata(
        project,
        extension,
        eventsFunctionsExtension,
        eventsBasedObject,
        objectMethodMangledNames
      );
      objectMethodMangledNames.delete();
    }
  );
  // Generate all free functions
  const metadataDeclarationHelper = new gd.MetadataDeclarationHelper();
  const freeEventsFunctions = eventsFunctionsExtension.getEventsFunctions();
  mapFor(0, freeEventsFunctions.getEventsFunctionsCount(), i => {
    const eventsFunction = freeEventsFunctions.getEventsFunctionAt(i);
    metadataDeclarationHelper.generateFreeFunctionMetadata(
      project,
      extension,
      eventsFunctionsExtension,
      eventsFunction
    );
  });
  metadataDeclarationHelper.delete();

  return extension;
};

/**
 * @param {Array<any>} extensions The extension (gdEventsFunctionsExtension)
 */
const generateExtensionsPageList = (extensions, indentationLevel) => {
  const extensionsByCategory = sortKeys(
    groupBy(extensions, pair => pair.getCategory() || 'General')
  );

  const baseIndentation = ' '.repeat(4 * indentationLevel);

  let pagesList = '';
  for (const category in extensionsByCategory) {
    pagesList += `${baseIndentation}- ${category}:\n`;

    const extensions = extensionsByCategory[category];
    for (const extension of extensions) {
      const folderName = getExtensionFolderName(extension.getName());
      pagesList += `${baseIndentation}    - ${extension.getFullName()}: ${folderName}\n`;
    }
  }

  return pagesList.length === 0
    ? pagesList
    : pagesList.substring(0, pagesList.length - 1);
};

/**
 * @param {Array<any>} reviewedExtensions The extension (gdEventsFunctionsExtension)
 * @param {Array<any>} experimentalExtensions The extension (gdEventsFunctionsExtension)
 */
const generateExtensionsMkDocsDotPagesFile = async (
  reviewedExtensions,
  experimentalExtensions
) => {
  const dotPagesContent = `nav:
    - index.md
    - search.md
    - tiers.md
${generateExtensionsPageList(reviewedExtensions, 1)}
    - Experimental extensions:
${generateExtensionsPageList(experimentalExtensions, 2)}
    - ...
    - Create your own extensions:
        - Create a new extension : create.md
        - best-practices.md
        - share-extension.md
`;

  const extensionsDotPagesFilePath = path.join(extensionsRootPath, '.pages');
  await fs.writeFile(extensionsDotPagesFilePath, dotPagesContent);
  console.info(`ℹ️ File generated: ${extensionsDotPagesFilePath}`);
};

const generateExtensionsList = async gd => {
  let content = '';
  const project = new gd.ProjectHelper.createNewGDJSProject();
  await addAllExtensionsToProject(gd, project);
  const extensionShortHeaders = await getAllExtensionShortHeaders();

  const reviewedExtensionShortHeaders = extensionShortHeaders.filter(
    header => header.tier !== 'community' && header.tier !== 'experimental'
  );
  const experimentalExtensionShortHeaders = extensionShortHeaders.filter(
    header => header.tier === 'community' || header.tier === 'experimental'
  );

  const reviewedExtensions = reviewedExtensionShortHeaders.map(header =>
    project.getEventsFunctionsExtension(header.name)
  );
  const experimentalExtensions = experimentalExtensionShortHeaders.map(header =>
    project.getEventsFunctionsExtension(header.name)
  );

  content += '## Reviewed extensions\n\n';
  for (const extension of reviewedExtensions) {
    const extensionShortHeader = extensionShortHeaders.find(
      header => header.name === extension.getName()
    );
    if (!extensionShortHeader) {
      throw new Error(
        `Could not find header for extension: ${extension.getName()}`
      );
    }
    await createExtensionReferencePage(
      gd,
      project,
      extension,
      extensionShortHeader,
      false
    );
  }
  content += generateAllExtensionsSections({
    extensions: reviewedExtensions,
    baseFolder: 'extensions',
  });

  content += `## Experimental extensions

The following extensions are made by a community members and they only got
though a light review by the GDevelop extension team. As such, we can't
guarantee they meet all the quality standards of fully reviewed extensions.

`;
  for (const extension of experimentalExtensions) {
    const extensionShortHeader = extensionShortHeaders.find(
      header => header.name === extension.getName()
    );
    if (!extensionShortHeader) {
      throw new Error(
        `Could not find header for extension: ${extension.getName()}`
      );
    }
    await createExtensionReferencePage(
      gd,
      project,
      extension,
      extensionShortHeader,
      true
    );
  }
  content += generateAllExtensionsSections({
    extensions: experimentalExtensions,
    baseFolder: 'extensions',
  });

  await generateExtensionsMkDocsDotPagesFile(
    reviewedExtensions,
    experimentalExtensions
  );

  project.delete();
  return content;
};

initializeGDevelopJs().then(async gd => {
  try {
    console.info(`ℹ️ Loading all community extensions...`);

    let indexPageContent = `---
icon: material/star-plus
---
# Extensions

In addition to [core features](/gdevelop5/all-features), new capabilities are provided by extensions. Extensions can contain objects, behaviors, actions, conditions, expressions, effects or events.

Official as well as experimental extensions are accessible [directly from GDevelop](/gdevelop5/extensions/search).
A list of [community-made extensions is available on GitHub](https://github.com/GDevelopApp/GDevelop-community-list).

New extensions can also be [created](/gdevelop5/extensions/create) from scratch using events or JavaScript.

Read more about this:

* [Create your own extensions](/gdevelop5/extensions/create)
* [Share extensions with the community](/gdevelop5/extensions/share-extension)
* [Use JavaScript in events](/gdevelop5/events/js-code)

`;

    indexPageContent += await generateExtensionsList(gd);

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
});
