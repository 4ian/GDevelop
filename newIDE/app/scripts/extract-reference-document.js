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
const allFeaturesFilePath = path.join(outputRootPath, 'all-features.txt');
const expressionsFilePath = path.join(
  allFeaturesRootPath,
  'expressions-reference.txt'
);

// Types definitions used in this script:

/**
 * @typedef {Object} RawText A text to be shown on a page
 * @prop {string} text The text to render (in Markdown/Dokuwiki syntax)
 */

/**
 * @typedef {Object} ReferenceText A text with metadata to format/manipulate/order it.
 * @prop {string} orderKey The type of the expression, instruction, or anything that help to uniquely order this text.
 * @prop {string} text The text to render (in Markdown/Dokuwiki syntax)
 */

/**
 * @typedef {Object} ObjectReference
 * @prop {any} objectMetadata The object.
 * @prop {Array<ReferenceText>} actionsReferenceTexts Reference texts for the object actions.
 * @prop {Array<ReferenceText>} conditionsReferenceTexts Reference texts for the object conditions.
 * @prop {Array<ReferenceText>} expressionsReferenceTexts Reference texts for the object expressions.
 */

/**
 * @typedef {Object} BehaviorReference
 * @prop {any} behaviorMetadata The behavior.
 * @prop {Array<ReferenceText>} actionsReferenceTexts Reference texts for the behavior actions.
 * @prop {Array<ReferenceText>} conditionsReferenceTexts Reference texts for the behavior conditions.
 * @prop {Array<ReferenceText>} expressionsReferenceTexts Reference texts for the behavior expressions.
 */

/**
 * @typedef {Object} ExtensionReference
 * @prop {any} extension The extension.
 * @prop {Array<ReferenceText>} freeExpressionsReferenceTexts Reference texts for free expressions.
 * @prop {Array<ReferenceText>} freeActionsReferenceTexts Reference texts for free actions.
 * @prop {Array<ReferenceText>} freeConditionsReferenceTexts Reference texts for free conditions.
 * @prop {Array<ObjectReference>} objectReferences Reference of all extension objects.
 * @prop {Array<BehaviorReference>} behaviorReferences Reference of all extension behaviors.
 */

const sanitizeExpressionDescription = str => {
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
*This page is an auto-generated reference page about the **${extension.getFullName()}** feature of [[https://gdevelop.io/|GDevelop, the open-source, cross-platform game engine designed for everyone]].*` +
      ' ' +
      'Learn more about [[gdevelop5:all-features|all GDevelop features here]].',
  };
};

/** @returns {RawText} */
const generateExtensionSeparatorText = () => {
  return {
    text: '\n---\n\n',
  };
};

/** @returns {RawText} */
const generateObjectHeaderText = ({
  extension,
  objectMetadata,
  showExtensionName,
  showHelpLink,
}) => {
  // Skip the header for the base object. The "Base object" extension
  // will already have an header and explanation.
  if (objectMetadata.getName() === '') {
    return { text: '' };
  }

  const additionalText =
    showExtensionName &&
    extension.getFullName() !== objectMetadata.getFullName()
      ? `(from extension ${extension.getFullName()})`
      : '';

  const helpPath = showHelpLink
    ? objectMetadata.getHelpPath() || extension.getHelpPath()
    : '';

  return {
    text: `
## ${objectMetadata.getFullName()} ${additionalText}

${objectMetadata.getDescription()} ${generateReadMoreLink(helpPath)}
`,
  };
};

/** @returns {RawText} */
const generateBehaviorHeaderText = ({
  extension,
  behaviorMetadata,
  showExtensionName,
  showHelpLink,
}) => {
  const additionalText =
    showExtensionName &&
    extension.getFullName() !== behaviorMetadata.getFullName()
      ? `(from extension ${extension.getFullName()})`
      : '';

  const helpPath = showHelpLink
    ? behaviorMetadata.getHelpPath() || extension.getHelpPath()
    : '';

  return {
    text: `
## ${behaviorMetadata.getFullName()} ${additionalText}

${behaviorMetadata.getDescription()} ${generateReadMoreLink(helpPath)}
`,
  };
};

/** @returns {RawText} */
const generateObjectNoExpressionsText = () => {
  return {
    text: `_No expressions for this object._\n`,
  };
};

/** @returns {RawText} */
const generateBehaviorNoExpressionsText = () => {
  return {
    text: `_No expressions for this behavior._\n`,
  };
};

/**
 * @param {?{ headerName: string, depth: number }} headerOptions
 * @returns {RawText}
 */
const generateExpressionsTableHeader = headerOptions => {
  // We don't put a header for the last column
  const text =
    (headerOptions ? generateHeader(headerOptions).text + '\n' : '') +
    `^ Expression ^ Description ^  ^`;
  return {
    text,
  };
};

/**
 * @param {{ headerName: string, depth: number }} headerOptions
 * @returns {RawText}
 */
const generateHeader = ({ headerName, depth }) => {
  const markdownHeaderMark = Array(depth)
    .fill('#')
    .join('');
  return {
    text: `${markdownHeaderMark} ${headerName}\n`,
  };
};

/** @returns {ReferenceText} */
const generateInstructionReferenceRowsText = ({
  instructionType,
  instructionMetadata,
  isCondition,
  objectMetadata,
  behaviorMetadata,
}) => {
  return {
    orderKey: instructionType,
    text:
      '**' +
      instructionMetadata.getFullName() +
      '**\\\\' +
      '\n' +
      instructionMetadata.getDescription().replace(/\n/, '\\\\\n') +
      '\n',
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

    const sanitizedDescription = sanitizeExpressionDescription(
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

  const sanitizedExpression = sanitizeExpressionDescription(
    expressionMetadata.getDescription()
  );

  let text = `| \`${expressionUsage}\` | ${sanitizedExpression} ||`;
  if (parameterRows.length) {
    text += '\n' + parameterRows.join('\n');
  }

  return {
    orderKey: expressionType,
    text,
  };
};

/**
 * @param {{ instructionsMetadata?: any, areConditions: boolean, objectMetadata?: any, behaviorMetadata?: any }} metadata
 * @returns {Array<ReferenceText>}
 */
const generateInstructionsReferenceRowsTexts = ({
  instructionsMetadata,
  areConditions,
  objectMetadata,
  behaviorMetadata,
}) => {
  /** @type {Array<string>} */
  const instructionTypes = instructionsMetadata.keys().toJSArray();
  // @ts-ignore
  return instructionTypes
    .map(instructionType => {
      const instructionMetadata = instructionsMetadata.get(instructionType);

      if (instructionMetadata.isHidden()) return null;

      return generateInstructionReferenceRowsText({
        instructionType,
        instructionMetadata,
        isCondition: areConditions,
        objectMetadata,
        behaviorMetadata,
      });
    })
    .filter(Boolean);
};

/**
 * @param {{ expressionsMetadata?: any, objectMetadata?: any, behaviorMetadata?: any }} metadata
 * @returns {Array<ReferenceText>}
 */
const generateExpressionsReferenceRowsTexts = ({
  expressionsMetadata,
  objectMetadata,
  behaviorMetadata,
}) => {
  /** @type {Array<string>} */
  const expressionTypes = expressionsMetadata.keys().toJSArray();
  // @ts-ignore
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

/**
 * @param {ReferenceText} referenceText1
 * @param {ReferenceText} referenceText2
 */
const sortReferenceTexts = (referenceText1, referenceText2) => {
  if (referenceText1.orderKey > referenceText2.orderKey) {
    return 1;
  } else if (referenceText1.orderKey < referenceText2.orderKey) {
    return -1;
  }
  return 0;
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
    /** @returns {ExtensionReference} */
    extension => {
      const extensionExpressions = extension.getAllExpressions();
      const extensionStrExpressions = extension.getAllStrExpressions();

      /** @type {Array<string>} */
      const objectTypes = extension.getExtensionObjectsTypes().toJSArray();
      /** @type {Array<string>} */
      const behaviorTypes = extension.getBehaviorsTypes().toJSArray();

      // Object expressions
      /** @type {Array<ObjectReference>} */
      let objectReferences = objectTypes.map(objectType => {
        const objectMetadata = extension.getObjectMetadata(objectType);
        const actionsReferenceTexts = generateInstructionsReferenceRowsTexts({
          areConditions: false,
          instructionsMetadata: extension.getAllActionsForObject(objectType),
          objectMetadata,
        });
        const conditionsReferenceTexts = generateInstructionsReferenceRowsTexts(
          {
            areConditions: true,
            instructionsMetadata: extension.getAllConditionsForObject(
              objectType
            ),
            objectMetadata,
          }
        );
        const expressionsReferenceTexts = [
          ...generateExpressionsReferenceRowsTexts({
            expressionsMetadata: extension.getAllExpressionsForObject(
              objectType
            ),
            objectMetadata,
          }),
          ...generateExpressionsReferenceRowsTexts({
            expressionsMetadata: extension.getAllStrExpressionsForObject(
              objectType
            ),
            objectMetadata,
          }),
        ];
        expressionsReferenceTexts.sort(sortReferenceTexts);

        return {
          objectMetadata,
          actionsReferenceTexts,
          conditionsReferenceTexts,
          expressionsReferenceTexts,
        };
      });

      // Behavior expressions
      /** @type {Array<BehaviorReference>} */
      let behaviorReferences = behaviorTypes.map(behaviorType => {
        const behaviorMetadata = extension.getBehaviorMetadata(behaviorType);
        const actionsReferenceTexts = generateInstructionsReferenceRowsTexts({
          areConditions: false,
          instructionsMetadata: extension.getAllActionsForBehavior(
            behaviorType
          ),
          behaviorMetadata,
        });
        const conditionsReferenceTexts = generateInstructionsReferenceRowsTexts(
          {
            areConditions: true,
            instructionsMetadata: extension.getAllConditionsForBehavior(
              behaviorType
            ),
            behaviorMetadata,
          }
        );
        const expressionsReferenceTexts = [
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
        expressionsReferenceTexts.sort(sortReferenceTexts);

        return {
          behaviorMetadata,
          actionsReferenceTexts,
          conditionsReferenceTexts,
          expressionsReferenceTexts,
        };
      });

      // Free (non objects/non behaviors) actions/conditions/expressions
      const freeActionsReferenceTexts = generateInstructionsReferenceRowsTexts({
        areConditions: false,
        instructionsMetadata: extension.getAllActions(),
      });
      const freeConditionsReferenceTexts = generateInstructionsReferenceRowsTexts(
        {
          areConditions: true,
          instructionsMetadata: extension.getAllConditions(),
        }
      );
      const freeExpressionsReferenceTexts = [
        ...generateExpressionsReferenceRowsTexts({
          expressionsMetadata: extensionStrExpressions,
        }),
        ...generateExpressionsReferenceRowsTexts({
          expressionsMetadata: extensionExpressions,
        }),
      ];
      freeExpressionsReferenceTexts.sort(sortReferenceTexts);

      return {
        extension,
        freeActionsReferenceTexts,
        freeConditionsReferenceTexts,
        freeExpressionsReferenceTexts,
        objectReferences,
        behaviorReferences,
      };
    }
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

Note that GDevelop can also be extended with extensions: take a look at [[gdevelop5:extensions|the list of community extensions]] or learn how to create your [[gdevelop5:extensions:create|own set of features (behaviors, actions, conditions or expressions)]].

`,
  };
  const footerText = {
    text: `
You can also find a **reference sheet of all expressions**:

* [[gdevelop5:all-features:expressions-reference|Expressions reference]]

## More features as extensions

Remember that you can also [[gdevelop5:extensions|search for new features in the community extensions]], or create your [[gdevelop5:extensions:create|own set of features (behaviors, actions, conditions or expressions)]].`,
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
              `[[${helpPageUrl}|${extensionReferences.extension.getFullName()}]]` +
              (helpPageUrl !== referencePageUrl
                ? ` ([[${referencePageUrl}|reference]])`
                : ''),
          },
        ];
      }),
    footerText,
  ];
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
      const {
        extension,
        freeActionsReferenceTexts,
        freeConditionsReferenceTexts,
        freeExpressionsReferenceTexts,
        objectReferences,
        behaviorReferences,
      } = extensionReference;

      const withHeaderIfNotEmpty = (texts, { headerName, depth }) => {
        if (!texts.length) return [];

        return [generateHeader({ headerName, depth }), ...texts];
      };

      return {
        folderName: getExtensionFolderName(
          extensionReference.extension.getName()
        ),
        texts: [
          generateExtensionHeaderText({ extension, depth: 1 }),
          ...withHeaderIfNotEmpty(freeActionsReferenceTexts, {
            headerName: 'Actions',
            depth: 2,
          }),
          ...withHeaderIfNotEmpty(freeConditionsReferenceTexts, {
            headerName: 'Conditions',
            depth: 2,
          }),
          freeExpressionsReferenceTexts.length
            ? generateExpressionsTableHeader({
                headerName: 'Expressions',
                depth: 2,
              })
            : { text: '' },
          ...freeExpressionsReferenceTexts,
          ...objectReferences.flatMap(objectReference => {
            const {
              objectMetadata,
              actionsReferenceTexts,
              conditionsReferenceTexts,
              expressionsReferenceTexts,
            } = objectReference;
            return [
              generateObjectHeaderText({
                extension,
                objectMetadata,
                showExtensionName: false,
                showHelpLink: false,
              }),
              ...withHeaderIfNotEmpty(actionsReferenceTexts, {
                headerName: 'Object actions',
                depth: 3,
              }),
              ...withHeaderIfNotEmpty(conditionsReferenceTexts, {
                headerName: 'Object conditions',
                depth: 3,
              }),
              expressionsReferenceTexts.length
                ? generateExpressionsTableHeader({
                    headerName: 'Object expressions',
                    depth: 3,
                  })
                : generateObjectNoExpressionsText(),
              ...expressionsReferenceTexts,
            ];
          }),
          ...behaviorReferences.flatMap(behaviorReference => {
            const {
              behaviorMetadata,
              actionsReferenceTexts,
              conditionsReferenceTexts,
              expressionsReferenceTexts,
            } = behaviorReference;
            return [
              generateBehaviorHeaderText({
                extension,
                behaviorMetadata,
                showExtensionName: false,
                showHelpLink: false,
              }),
              ...withHeaderIfNotEmpty(actionsReferenceTexts, {
                headerName: 'Behavior actions',
                depth: 3,
              }),
              ...withHeaderIfNotEmpty(conditionsReferenceTexts, {
                headerName: 'Behavior conditions',
                depth: 3,
              }),
              expressionsReferenceTexts.length
                ? generateExpressionsTableHeader({
                    headerName: 'Behavior expressions',
                    depth: 3,
                  })
                : generateBehaviorNoExpressionsText(),
              ...expressionsReferenceTexts,
            ];
          }),
          generateExtensionFooterText({ extension }),
        ].filter(Boolean),
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

const rawTextsToString = rawTexts =>
  rawTexts
    .map(({ text }) => {
      return text;
    })
    .join('\n');

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
        'reference.txt'
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
