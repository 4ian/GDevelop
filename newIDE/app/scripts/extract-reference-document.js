/**
 * Launch this script to generate a reference of all expressions supported by GDevelop.
 */
const gd = require('../public/libGD.js')();
const { mapVector } = require('./lib/MapFor');
const makeExtensionsLoader = require('./lib/LocalJsExtensionsLoader');
const fs = require('fs');
const _ = require('lodash');
const shell = require('shelljs');

shell.exec('node import-GDJS-Runtime.js');
gd.initializePlatforms();

const outputFile = 'reference.md';

// Types definitions used in this script:

/**
 * @typedef {Object} DocumentationText
 * @prop {string} text The text to render (in Markdown/Dokuwiki syntax)
 */

/**
 * @typedef {Object} ReferenceText
 * @prop {string} expressionType The type of the expression
 * @prop {string} text The text to render (in Markdown/Dokuwiki syntax)
 */

/** @returns {DocumentationText} */
const generateExtensionHeaderText = ({ extension }) => {
  return {
    text: `## ${extension.getFullName()}

${extension.getDescription()}
`,
  };
};

/** @returns {DocumentationText} */
const generateExtensionSeparatorText = () => {
  return {
    text: '\n---\n\n',
  };
};

/** @returns {DocumentationText} */
const generateObjectHeaderText = ({ extension, objectMetadata }) => {
  const additionalText =
    extension.getFullName() !== objectMetadata.getFullName()
      ? `(from extension ${extension.getFullName()})`
      : '';
  return {
    text: `## ${objectMetadata.getFullName()} ${additionalText}

${objectMetadata.getDescription()}
`,
  };
};

/** @returns {DocumentationText} */
const generateBehaviorHeaderText = ({ extension, behaviorMetadata }) => {
  const additionalText =
    extension.getFullName() !== behaviorMetadata.getFullName()
      ? `(from extension ${extension.getFullName()})`
      : '';

  return {
    text: `## ${behaviorMetadata.getFullName()} ${additionalText}

${behaviorMetadata.getDescription()}
`,
  };
};

/** @returns {DocumentationText} */
const generateObjectNoExpressionsText = () => {
  return {
    text: `_No expressions for this object._\n`,
  };
};

/** @returns {DocumentationText} */
const generateBehaviorNoExpressionsText = () => {
  return {
    text: `_No expressions for this behavior._\n`,
  };
};

/** @returns {ReferenceText} */
const generateExpressionReferenceText = ({
  expressionType,
  expressionMetadata,
  objectMetadata,
  behaviorMetadata,
}) => {
  // TODO: Add parameters and put this as a table row?
  // Find the methods available on expressionMetadata in GDevelop.js/Bindings/Bindings.idl
  let expressionUsage = '';
  if (objectMetadata) {
    expressionUsage = 'Object.' + expressionType;
  } else if (behaviorMetadata) {
    expressionUsage =
      'Object.' + behaviorMetadata.getDefaultName() + '::' + expressionType;
  } else {
    expressionUsage = expressionType;
  }

  const text = `* \`${expressionUsage}\`: **${expressionMetadata.getFullName()}**

  ${expressionMetadata.getDescription()}`;

  return {
    expressionType,
    text,
  };
};

/** @returns {Array<ReferenceText>} */
const generateExpressionsReferenceTexts = ({
  expressionsMetadata,
  objectMetadata,
  behaviorMetadata,
}) => {
  /** @type {Array<string>} */
  const expressionTypes = expressionsMetadata.keys().toJSArray();
  return expressionTypes
    .map(expressionType => {
      const expressionMetadata = expressionsMetadata.get(expressionType);

      if (!expressionMetadata.isShown()) return null;

      return generateExpressionReferenceText({
        expressionType,
        expressionMetadata,
        objectMetadata,
        behaviorMetadata,
      });
    })
    .filter(Boolean);
};

const sortExpressionReferenceTexts = (expressionText1, expressionText2) => {
  if (expressionText1.expressionType > expressionText2.expressionType) {
    return 1;
  } else if (expressionText1.expressionType < expressionText2.expressionType) {
    return -1;
  }
  return 0;
};

/** @returns {Array<DocumentationText>} */
const generateAllDocumentationTexts = () => {
  const platformExtensions = gd.JsPlatform.get().getAllPlatformExtensions();
  const platformExtensionsCount = platformExtensions.size();

  /** @type {Array<DocumentationText>} */
  let allExpressionsReferenceTexts = [];
  mapVector(platformExtensions, (extension, extensionIndex) => {
    const extensionExpressions = extension.getAllExpressions();
    const extensionStrExpressions = extension.getAllStrExpressions();

    /** @type {Array<string>} */
    const objectTypes = extension.getExtensionObjectsTypes().toJSArray();
    /** @type {Array<string>} */
    const behaviorTypes = extension.getBehaviorsTypes().toJSArray();

    // Object expressions
    let allExtensionObjectsReferenceTexts = [];
    objectTypes.forEach(objectType => {
      const objectMetadata = extension.getObjectMetadata(objectType);
      const objectReferenceTexts = [
        ...generateExpressionsReferenceTexts({
          expressionsMetadata: extension.getAllExpressionsForObject(objectType),
          objectMetadata,
        }),
        ...generateExpressionsReferenceTexts({
          expressionsMetadata: extension.getAllStrExpressionsForObject(
            objectType
          ),
          objectMetadata,
        }),
      ];
      objectReferenceTexts.sort(sortExpressionReferenceTexts);

      allExtensionObjectsReferenceTexts = [
        generateObjectHeaderText({ extension, objectMetadata }),
        ...allExtensionObjectsReferenceTexts,
        ...(objectReferenceTexts.length
          ? objectReferenceTexts
          : [generateObjectNoExpressionsText()]),
      ];
    });
    let allExtensionBehaviorsReferenceTexts = [];

    // Behavior expressions
    behaviorTypes.forEach(behaviorType => {
      const behaviorMetadata = extension.getBehaviorMetadata(behaviorType);
      const behaviorReferenceTexts = [
        ...generateExpressionsReferenceTexts({
          expressionsMetadata: extension.getAllExpressionsForBehavior(
            behaviorType
          ),
          behaviorMetadata,
        }),
        ...generateExpressionsReferenceTexts({
          expressionsMetadata: extension.getAllStrExpressionsForBehavior(
            behaviorType
          ),
          behaviorMetadata,
        }),
      ];
      behaviorReferenceTexts.sort(sortExpressionReferenceTexts);

      allExtensionBehaviorsReferenceTexts = [
        generateBehaviorHeaderText({ extension, behaviorMetadata }),
        ...allExtensionBehaviorsReferenceTexts,
        ...(behaviorReferenceTexts.length
          ? behaviorReferenceTexts
          : [generateBehaviorNoExpressionsText()]),
      ];
    });

    // Free (non objects/non behaviors) expressions
    const allExtensionFreeExpressionsReferenceTexts = [
      ...generateExpressionsReferenceTexts({
        expressionsMetadata: extensionStrExpressions,
      }),
      ...generateExpressionsReferenceTexts({
        expressionsMetadata: extensionExpressions,
      }),
    ];
    allExtensionFreeExpressionsReferenceTexts.sort(
      sortExpressionReferenceTexts
    );
    const hasFreeExpressionsReferenceTexts =
      allExtensionFreeExpressionsReferenceTexts.length > 0;

    // Merge all the extension expression texts
    let allExtensionReferenceTexts = [
      hasFreeExpressionsReferenceTexts
        ? generateExtensionHeaderText({ extension })
        : null,
      ...allExtensionFreeExpressionsReferenceTexts,
      ...allExtensionObjectsReferenceTexts,
      ...allExtensionBehaviorsReferenceTexts,
    ].filter(Boolean);

    // Add a separator if needed
    const isLastExtension = extensionIndex === platformExtensionsCount - 1;
    if (!isLastExtension && allExtensionReferenceTexts.length > 0) {
      allExtensionReferenceTexts = [
        ...allExtensionReferenceTexts,
        generateExtensionSeparatorText(),
      ];
    }

    allExpressionsReferenceTexts = [
      ...allExpressionsReferenceTexts,
      ...allExtensionReferenceTexts,
    ];
  });

  return allExpressionsReferenceTexts;
};

const writeFile = content => {
  return new Promise((resolve, reject) => {
    fs.writeFile(outputFile, content, err => {
      if (err) return reject(err);

      resolve();
    });
  });
};

const noopTranslationFunction = str => str;
const extensionsLoader = makeExtensionsLoader({ gd, filterExamples: true });
extensionsLoader
  .loadAllExtensions(noopTranslationFunction)
  .then(loadingResults => {
    console.info('Loaded extensions', loadingResults);

    return generateAllDocumentationTexts();
  })
  .then(allDocumentationTexts => {
    const texts = allDocumentationTexts
      .map(({ text }) => {
        return text;
      })
      .join('\n\n');
    return writeFile(texts);
  })
  .then(
    () => console.info('Done.'),
    err => console.error('Error while writing output', err)
  );
