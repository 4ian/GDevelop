// @ts-check
/**
 * Launch this script to generate a reference of all expressions supported by GDevelop.
 */
const initializeGDevelopJs = require('../public/libGD.js');
const { mapVector } = require('./lib/MapFor');
const makeExtensionsLoader = require('./lib/LocalJsExtensionsLoader');
const fs = require('fs').promises;
const path = require('path');
const shell = require('shelljs');
const {
  gdevelopWikiUrlRoot,
  getHelpLink,
  generateReadMoreLink,
  improperlyFormattedHelpPaths,
  getExtensionFolderName,
} = require('./lib/WikiHelpLink');

shell.exec('node import-GDJS-Runtime.js');

const ignoredExtensionNames = ['BuiltinJoystick'];
const gdRootPath = path.join(__dirname, '..', '..', '..');
const outputRootPath = path.join(gdRootPath, 'docs-wiki');
const allFeaturesRootPath = path.join(outputRootPath, 'all-features');
const allFeaturesFilePath = path.join(allFeaturesRootPath, 'index.md');
const expressionsFilePath = path.join(
  allFeaturesRootPath,
  'expressions-reference.md'
);
const {
  generateExtensionReference,
  generateExtensionRawText,
  rawTextsToString,
  generateExpressionsTableHeader,
  generateObjectHeaderText,
  generateObjectNoExpressionsText,
  generateBehaviorHeaderText,
  generateBehaviorNoExpressionsText,
  generateHeader,
} = require('./lib/ExtensionReferenceGenerator');

/** @typedef {import("./lib/ExtensionReferenceGenerator.js").RawText} RawText */
/** @typedef {import("./lib/ExtensionReferenceGenerator.js").ExtensionReference} ExtensionReference */

/** @returns {RawText} */
const generateFileHeaderText = () => {
  return {
    text: `# Expressions reference

Expressions can be entered when you see a field with one of these buttons:

![](/gdevelop5/field_expressions.png)

* The left button indicates a "string expression" (a text)
* The right button indicates a "numerical expression" (a number)

This page is a reference of all expressions that can be used in GDevelop, grouped by the extension,
object or behavior they belong too. When \`Object\` is written, you should enter an object name. **[Learn more here about how to write expressions](/gdevelop5/all-features/expressions)**

!!! tip

    Expressions are sometime also called functions, like in mathematics.
`,
  };
};

/** @returns {RawText} */
const generateExtensionSeparatorText = () => {
  return {
    text: '\n---\n\n',
  };
};

/**
 * @type {any} gd
 * @returns {Array<ExtensionReference>}
 */
const generateAllExtensionReferences = gd => {
  const platformExtensions = gd.JsPlatform.get().getAllPlatformExtensions();

  /** @type {Array<ExtensionReference>} */
  const extensionReferences = mapVector(
    platformExtensions,
    generateExtensionReference
  );

  return extensionReferences;
};

/**
 * @param {Array<ExtensionReference>} extensionReferences
 * @returns {Array<RawText>}
 */
const generateAllFeaturesStartPageRawTexts = extensionReferences => {
  const headerText = {
    text: `# All features

This page lists **all the features** that are provided in GDevelop. These can be objects, behaviors but also features that can be used directly using actions, conditions or expressions (without requiring an object to be existing on the scene).

Note that GDevelop can also be extended with extensions: take a look at [the list of community extensions](/gdevelop5/extensions) or learn how to create your [own set of features (behaviors, actions, conditions or expressions)](/gdevelop5/extensions/create).

`,
  };
  const footerText = {
    text: `
You can also find a **reference sheet of all expressions**:

* [Expressions reference](/gdevelop5/all-features/expressions-reference)

## More features as extensions

Remember that you can also [search for new features in the community extensions](/gdevelop5/extensions), or create your [own set of features (behaviors, actions, conditions or expressions)](/gdevelop5/extensions/create).`,
  };

  return [
    headerText,
    ...extensionReferences
      .filter(extensionReference => {
        return !ignoredExtensionNames.includes(
          extensionReference.extension.getName()
        );
      })
      .flatMap(extensionReferences => {
        const folderName = getExtensionFolderName(
          extensionReferences.extension.getName()
        );
        const helpPagePath = extensionReferences.extension.getHelpPath();
        const referencePageUrl = `${gdevelopWikiUrlRoot}/all-features/${folderName}/reference`;
        const helpPageUrl = getHelpLink(helpPagePath) || referencePageUrl;

        return [
          {
            text:
              '* ' +
              // Link to help page or to reference if none.
              `[${extensionReferences.extension.getFullName()}](${helpPageUrl})` +
              (helpPageUrl !== referencePageUrl
                ? ` ([reference](${referencePageUrl}))`
                : ''),
          },
        ];
      }),
    footerText,
  ];
};

/** @returns {RawText} */
const generateExtensionHeaderText = ({ extension, depth }) => {
  return {
    text:
      generateHeader({ headerName: extension.getFullName(), depth }).text +
      `
${extension.getDescription()} ${generateReadMoreLink(extension.getHelpPath())}
`,
  };
};

/** @returns {RawText} */
const generateExtensionFooterText = ({ extension }) => {
  return {
    text:
      `
---
*This page is an auto-generated reference page about the **${extension.getFullName()}** feature of [GDevelop, the open-source, cross-platform game engine designed for everyone](https://gdevelop.io/).*` +
      ' ' +
      'Learn more about [all GDevelop features here](/gdevelop5/all-features).',
  };
};

/**
 * @param {Array<ExtensionReference>} extensionReferences
 * @returns {{allExtensionRawTexts: Array<{folderName: string, texts: Array<RawText>}>}}
 */
const generateExtensionRawTexts = extensionReferences => {
  const allExtensionRawTexts = extensionReferences
    .filter(extensionReference => {
      return !ignoredExtensionNames.includes(
        extensionReference.extension.getName()
      );
    })
    .map(extensionReference => {
      return {
        folderName: getExtensionFolderName(
          extensionReference.extension.getName()
        ),
        texts: generateExtensionRawText(
          extensionReference,
          generateExtensionHeaderText,
          generateExtensionFooterText
        ),
      };
    });

  return { allExtensionRawTexts };
};

/**
 * @param {Array<ExtensionReference>} extensionReferences
 * @returns {Array<RawText>}
 */
const generateAllExpressionsRawTexts = extensionReferences => {
  /** @type {Array<RawText>} */
  let allExpressionsRawTexts = [generateFileHeaderText()];
  extensionReferences.forEach((extensionReference, extensionIndex) => {
    const {
      extension,
      freeExpressionsReferenceTexts,
      objectReferences,
      behaviorReferences,
    } = extensionReference;

    const hasFreeExpressionsReferenceTexts =
      freeExpressionsReferenceTexts.length > 0;

    // Merge all the extension expression texts
    let allExtensionExpressionsRawTexts = [
      ...(hasFreeExpressionsReferenceTexts
        ? [
            generateExtensionHeaderText({ extension, depth: 2 }),
            generateExpressionsTableHeader(null),
          ]
        : []),
      ...freeExpressionsReferenceTexts,
      ...objectReferences.flatMap(objectReference => {
        const { objectMetadata, expressionsReferenceTexts } = objectReference;
        return [
          generateObjectHeaderText({
            extension,
            objectMetadata,
            showExtensionName: true,
            showHelpLink: true,
          }),
          expressionsReferenceTexts.length
            ? generateExpressionsTableHeader(null)
            : generateObjectNoExpressionsText(),
          ...expressionsReferenceTexts,
        ];
      }),
      ...behaviorReferences.flatMap(behaviorReference => {
        const {
          behaviorMetadata,
          expressionsReferenceTexts,
        } = behaviorReference;
        return [
          generateBehaviorHeaderText({
            extension,
            behaviorMetadata,
            showExtensionName: true,
            showHelpLink: true,
          }),
          expressionsReferenceTexts.length
            ? generateExpressionsTableHeader(null)
            : generateBehaviorNoExpressionsText(),
          ...expressionsReferenceTexts,
        ];
      }),
    ].filter(Boolean);

    // Add a separator if needed
    const isLastExtension = extensionIndex === extensionReferences.length - 1;
    if (!isLastExtension && allExtensionExpressionsRawTexts.length > 0) {
      allExtensionExpressionsRawTexts = [
        ...allExtensionExpressionsRawTexts,
        generateExtensionSeparatorText(),
      ];
    }

    allExpressionsRawTexts = [
      ...allExpressionsRawTexts,
      ...allExtensionExpressionsRawTexts,
    ];
  });

  return allExpressionsRawTexts;
};

const noopTranslationFunction = str => str;

initializeGDevelopJs().then(async gd => {
  try {
    // @ts-ignore - not passing onFindGDJS - is it still useful?
    const loadingResults = await makeExtensionsLoader({
      gd,
      objectsEditorService: null,
      objectsRenderingService: null,
      filterExamples: true,
    }).loadAllExtensions(noopTranslationFunction);

    console.info('Loaded extensions', loadingResults);

    console.info('ℹ️ Generating extension references...');
    const extensionReferences = generateAllExtensionReferences(gd);
    console.info('✅ Generated extension references.');

    // Expressions reference
    const allExpressionsRawTexts = generateAllExpressionsRawTexts(
      extensionReferences
    );
    await fs.mkdir(path.dirname(expressionsFilePath), { recursive: true });
    await fs.writeFile(
      expressionsFilePath,
      rawTextsToString(allExpressionsRawTexts)
    );
    console.info(`ℹ️ File generated: ${expressionsFilePath}`);

    // Each extension reference
    const { allExtensionRawTexts } = generateExtensionRawTexts(
      extensionReferences
    );
    for (const { folderName, texts } of allExtensionRawTexts) {
      const extensionReferenceFilePath = path.join(
        allFeaturesRootPath,
        folderName,
        'reference.md'
      );
      await fs.mkdir(path.dirname(extensionReferenceFilePath), {
        recursive: true,
      });
      await fs.writeFile(extensionReferenceFilePath, rawTextsToString(texts));
      console.info(`ℹ️ File generated: ${extensionReferenceFilePath}`);
    }

    const allFeaturesStartPageRawTexts = generateAllFeaturesStartPageRawTexts(
      extensionReferences
    );
    await fs.writeFile(
      allFeaturesFilePath,
      rawTextsToString(allFeaturesStartPageRawTexts)
    );
    console.info(`ℹ️ File generated: ${allFeaturesFilePath}`);

    if (improperlyFormattedHelpPaths.size > 0) {
      console.info(
        `⚠️ Reference documents generated, but some help paths are invalid:`,
        improperlyFormattedHelpPaths.keys()
      );
    } else {
      console.info(`✅ Reference documents generated.`);
    }
  } catch (err) {
    console.error('❌ Error while writing output', err);
  }
});
