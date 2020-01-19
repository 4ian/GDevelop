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

const gdevelopWikiUrlRoot = 'http://wiki.compilgames.net/doku.php/gdevelop5';
const outputFile = 'expressions-reference.dokuwiki.md';

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

const sanitize = str => {
  return (
    str
      // Disallow new lines in descriptions:
      .replace(/\n/g, '')
      // Replace a few description parts that can conflict with DokuWiki/Markdown:
      .replace(/\)\*x/, ') * x')
      .replace(/x\^n/, '"x to the power n"')
  );
};

const translateTypeToHumanReadableType = type => {
  if (type === 'expression') return 'number';
  if (type === 'objectList') return 'object';
  if (type === 'objectPtr') return 'object';
  if (type === 'stringWithSelector') return 'string';

  return type;
};

const generateFileHeaderText = () => {
  return {
    text: `# Expressions reference

Expressions can be entered when you see a field with one of these buttons:

{{ :gdevelop5:field_expressions.png?nolink |}}

  * The left button indicates a "string expression" (a text)
  * The right button indicates a "numerical expression" (a number)

This page is a reference of all expressions that can be used in GDevelop, grouped by the extension,
object or behavior they belong too. When \`Object\` is written, you should enter an object name. **[[gdevelop5:all-features:expressions|Learn more here about how to write expressions.]]**

<note>Expressions are sometime also called functions, like in mathematics.</note>
`,
  };
};

/** @returns {DocumentationText} */
const generateExtensionHeaderText = ({ extension }) => {
  return {
    text: `## ${extension.getFullName()}

${extension.getDescription()} ${generateReadMoreLink(extension.getHelpPath())}
`,
  };
};

/** @returns {DocumentationText} */
const generateExtensionSeparatorText = () => {
  return {
    text: '\n---\n\n',
  };
};

/** @returns {string} */
const generateReadMoreLink = helpPagePath => {
  if (!helpPagePath) return '';

  return `[[${gdevelopWikiUrlRoot}${helpPagePath}|Learn more...]]`;
};

/** @returns {DocumentationText} */
const generateObjectHeaderText = ({ extension, objectMetadata }) => {
  // Skip the header for the base object. The "Base object" extension
  // will already have an header and explanation.
  if (objectMetadata.getName() === '') {
    return { text: '' };
  }

  const additionalText =
    extension.getFullName() !== objectMetadata.getFullName()
      ? `(from extension ${extension.getFullName()})`
      : '';

  const helpPath = objectMetadata.getHelpPath() || extension.getHelpPath();

  return {
    text: `
## ${objectMetadata.getFullName()} ${additionalText}

${objectMetadata.getDescription()} ${generateReadMoreLink(helpPath)}
`,
  };
};

/** @returns {DocumentationText} */
const generateBehaviorHeaderText = ({ extension, behaviorMetadata }) => {
  const additionalText =
    extension.getFullName() !== behaviorMetadata.getFullName()
      ? `(from extension ${extension.getFullName()})`
      : '';

  const helpPath = behaviorMetadata.getHelpPath() || extension.getHelpPath();

  return {
    text: `
## ${behaviorMetadata.getFullName()} ${additionalText}

${behaviorMetadata.getDescription()} ${generateReadMoreLink(helpPath)}
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

/** @returns {DocumentationText} */
const generateExpressionsTableHeader = () => {
  // We don't put a header for the last column
  return {
    text: `^ Expression ^ Description ^  ^`,
  };
};

/** @returns {ReferenceText} */
const generateExpressionReferenceRowsText = ({
  expressionType,
  expressionMetadata,
  objectMetadata,
  behaviorMetadata,
}) => {
  let parameterRows = [];
  let parameterStrings = [];
  mapVector(expressionMetadata.getParameters(), (parameterMetadata, index) => {
    if ((!!objectMetadata && index < 1) || (!!behaviorMetadata && index < 2)) {
      return; // Skip the first (or first twos) parameters by convention.
    }
    if (parameterMetadata.isCodeOnly()) return;

    const sanitizedDescription = sanitize(
      [
        parameterMetadata.getDescription(),
        parameterMetadata.getLongDescription(),
        parameterMetadata.isOptional() ? '_Optional_.' : '',
      ]
        .filter(Boolean)
        .join(' ')
    );

    const humanReadableType = translateTypeToHumanReadableType(
      parameterMetadata.getType()
    );

    parameterRows.push(
      `|:::| _${humanReadableType}_ | ${sanitizedDescription} |`
    );
    parameterStrings.push(humanReadableType);
  });

  let expressionUsage = '';
  if (objectMetadata) {
    expressionUsage = 'Object.' + expressionType;
  } else if (behaviorMetadata) {
    expressionUsage =
      'Object.' + behaviorMetadata.getDefaultName() + '::' + expressionType;
  } else {
    expressionUsage = expressionType;
  }
  expressionUsage += '(' + parameterStrings.join(', ') + ')';

  const sanitizedExpression = sanitize(expressionMetadata.getDescription());

  let text = `| \`${expressionUsage}\` | ${sanitizedExpression} ||`;
  if (parameterRows.length) {
    text += '\n' + parameterRows.join('\n');
  }

  return {
    expressionType,
    text,
  };
};

/** @returns {Array<ReferenceText>} */
const generateExpressionsReferenceRowsTexts = ({
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

      return generateExpressionReferenceRowsText({
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
  let allExpressionsReferenceTexts = [generateFileHeaderText()];
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
      const objectReferenceRowsTexts = [
        ...generateExpressionsReferenceRowsTexts({
          expressionsMetadata: extension.getAllExpressionsForObject(objectType),
          objectMetadata,
        }),
        ...generateExpressionsReferenceRowsTexts({
          expressionsMetadata: extension.getAllStrExpressionsForObject(
            objectType
          ),
          objectMetadata,
        }),
      ];
      objectReferenceRowsTexts.sort(sortExpressionReferenceTexts);

      allExtensionObjectsReferenceTexts = [
        ...allExtensionObjectsReferenceTexts,
        generateObjectHeaderText({ extension, objectMetadata }),
        objectReferenceRowsTexts.length
          ? generateExpressionsTableHeader()
          : generateObjectNoExpressionsText(),
        ...objectReferenceRowsTexts,
      ];
    });
    let allExtensionBehaviorsReferenceTexts = [];

    // Behavior expressions
    behaviorTypes.forEach(behaviorType => {
      const behaviorMetadata = extension.getBehaviorMetadata(behaviorType);
      const behaviorReferenceRowsTexts = [
        ...generateExpressionsReferenceRowsTexts({
          expressionsMetadata: extension.getAllExpressionsForBehavior(
            behaviorType
          ),
          behaviorMetadata,
        }),
        ...generateExpressionsReferenceRowsTexts({
          expressionsMetadata: extension.getAllStrExpressionsForBehavior(
            behaviorType
          ),
          behaviorMetadata,
        }),
      ];
      behaviorReferenceRowsTexts.sort(sortExpressionReferenceTexts);

      allExtensionBehaviorsReferenceTexts = [
        ...allExtensionBehaviorsReferenceTexts,
        generateBehaviorHeaderText({ extension, behaviorMetadata }),
        behaviorReferenceRowsTexts.length
          ? generateExpressionsTableHeader()
          : generateBehaviorNoExpressionsText(),
        ...behaviorReferenceRowsTexts,
      ];
    });

    // Free (non objects/non behaviors) expressions
    const allExtensionFreeExpressionsReferenceRowsTexts = [
      ...generateExpressionsReferenceRowsTexts({
        expressionsMetadata: extensionStrExpressions,
      }),
      ...generateExpressionsReferenceRowsTexts({
        expressionsMetadata: extensionExpressions,
      }),
    ];
    allExtensionFreeExpressionsReferenceRowsTexts.sort(
      sortExpressionReferenceTexts
    );
    const hasFreeExpressionsReferenceTexts =
      allExtensionFreeExpressionsReferenceRowsTexts.length > 0;

    // Merge all the extension expression texts
    let allExtensionReferenceTexts = [
      ...(hasFreeExpressionsReferenceTexts
        ? [
            generateExtensionHeaderText({ extension }),
            generateExpressionsTableHeader(),
          ]
        : []),
      ...allExtensionFreeExpressionsReferenceRowsTexts,
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
      .join('\n');
    return writeFile(texts);
  })
  .then(
    () => console.info(`✅ Done. File generated: ${outputFile}`),
    err => console.error('❌ Error while writing output', err)
  );
