// @ts-check
const { mapFor } = require('./MapFor');
const { generateReadMoreLink } = require('./WikiHelpLink');
const { isNullPtr } = require('./IsNullPtr');
const { mapVector } = require('./MapFor');

// Types definitions used in this script:

/** @typedef {import('../../../../GDevelop.js/types').Platform} Platform */
/** @typedef {import('../../../../GDevelop.js/types').PlatformExtension} PlatformExtension */
/** @typedef {import('../../../../GDevelop.js/types').EventsFunctionsExtension} EventsFunctionsExtension */
/** @typedef {import('../../../../GDevelop.js/types').MapStringExpressionMetadata} MapStringExpressionMetadata */
/** @typedef {import('../../../../GDevelop.js/types').ExpressionMetadata} ExpressionMetadata */
/** @typedef {import('../../../../GDevelop.js/types').ObjectMetadata} ObjectMetadata */
/** @typedef {import('../../../../GDevelop.js/types').BehaviorMetadata} BehaviorMetadata */
/** @typedef {import('../../../../GDevelop.js/types').ParameterMetadata} ParameterMetadata */
/** @typedef {import('../../../../GDevelop.js/types').MapStringPropertyDescriptor} MapStringPropertyDescriptor */
/** @typedef {import('../../../../GDevelop.js/types').NamedPropertyDescriptor} NamedPropertyDescriptor */
/** @typedef {import('../../../../GDevelop.js/types').PropertiesContainer} PropertiesContainer */
/** @typedef {import('../../../../GDevelop.js/types').PropertyDescriptor} PropertyDescriptor */

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
 * @prop {ObjectMetadata} objectMetadata The object.
 * @prop {Array<ReferenceText>} propertiesReferenceTexts Reference texts for the object properties.
 * @prop {Array<ReferenceText>} actionsReferenceTexts Reference texts for the object actions.
 * @prop {Array<ReferenceText>} conditionsReferenceTexts Reference texts for the object conditions.
 * @prop {Array<ReferenceText>} expressionsReferenceTexts Reference texts for the object expressions.
 */

/**
 * @typedef {Object} BehaviorReference
 * @prop {BehaviorMetadata} behaviorMetadata The behavior.
 * @prop {Array<ReferenceText>} propertiesReferenceTexts Reference texts for the behavior properties.
 * @prop {Array<ReferenceText>} sharedPropertiesReferenceTexts Reference texts for the behavior shared properties.
 * @prop {Array<ReferenceText>} actionsReferenceTexts Reference texts for the behavior actions.
 * @prop {Array<ReferenceText>} conditionsReferenceTexts Reference texts for the behavior conditions.
 * @prop {Array<ReferenceText>} expressionsReferenceTexts Reference texts for the behavior expressions.
 */

/**
 * @typedef {Object} ExtensionReference
 * @prop {PlatformExtension} extension The extension.
 * @prop {EventsFunctionsExtension | null} eventsFunctionsExtension The "source" events-based extension.
 * @prop {Array<ReferenceText>} freeExpressionsReferenceTexts Reference texts for free expressions.
 * @prop {Array<ReferenceText>} freeActionsReferenceTexts Reference texts for free actions.
 * @prop {Array<ReferenceText>} freeConditionsReferenceTexts Reference texts for free conditions.
 * @prop {Array<ObjectReference>} objectReferences Reference of all extension objects.
 * @prop {Array<BehaviorReference>} behaviorReferences Reference of all extension behaviors.
 */

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

/**
 * @param {?{ headerName: string, depth: number }} headerOptions
 * @returns {RawText}
 */
const generateExpressionsTableHeader = headerOptions => {
  // We don't put a header for the last column
  const text =
    (headerOptions ? generateHeader(headerOptions).text + '\n' : '') +
    `| Expression | Description |  |
|-----|-----|-----|`;
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

const rawTextsToString = rawTexts =>
  rawTexts
    .map(({ text }) => {
      return text;
    })
    .join('\n');

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

const caseInsensitiveCheck = (type, check) => {
  return type.toLowerCase() === check.toLowerCase();
};

const translateTypeToHumanReadableDescription = type => {
  if (caseInsensitiveCheck(type, 'number')) return '🔢 Number';
  if (caseInsensitiveCheck(type, 'expression')) return '🔢 Number';
  if (caseInsensitiveCheck(type, 'camera')) return '🔢 Camera index (Number)';

  if (caseInsensitiveCheck(type, 'object')) return '👾 Object';
  if (caseInsensitiveCheck(type, 'objectList')) return '👾 Object';
  if (caseInsensitiveCheck(type, 'objectPtr')) return '👾 Object';
  if (caseInsensitiveCheck(type, 'objectListOrEmptyIfJustDeclared'))
    return '👾 Object';
  if (caseInsensitiveCheck(type, 'objectListOrEmptyWithoutPicking'))
    return '👾 Object';

  if (caseInsensitiveCheck(type, 'variable')) return '🗄️ Any variable';
  if (caseInsensitiveCheck(type, 'objectvar')) return '🗄️ Object variable';
  if (caseInsensitiveCheck(type, 'scenevar')) return '🗄️ Scene variable';
  if (caseInsensitiveCheck(type, 'globalvar')) return '🗄️ Global variable';

  if (caseInsensitiveCheck(type, 'behavior')) return '🧩 Behavior';

  if (caseInsensitiveCheck(type, 'layer')) return '🔤 Layer name (String)';
  if (caseInsensitiveCheck(type, 'string')) return '🔤 String';
  if (caseInsensitiveCheck(type, 'stringWithSelector')) return '🔤 String';
  if (caseInsensitiveCheck(type, 'identifier')) return '🔤 Name (String)';
  if (caseInsensitiveCheck(type, 'sceneName'))
    return '🔤 Name of a scene (String)';
  if (caseInsensitiveCheck(type, 'layerEffectName'))
    return '🔤 Layer Effect Name (String)';
  if (caseInsensitiveCheck(type, 'layerEffectParameterName'))
    return '🔤 Layer Effect Property Name (String)';
  if (caseInsensitiveCheck(type, 'objectEffectName'))
    return '🔤 Object Effect Name (String)';
  if (caseInsensitiveCheck(type, 'objectEffectParameterName'))
    return '🔤 Object Effect Property Name (String)';
  if (caseInsensitiveCheck(type, 'objectPointName'))
    return '🔤 Object Point Name (String)';
  if (caseInsensitiveCheck(type, 'objectAnimationName'))
    return '🔤 Object Animation Name (String)';
  if (caseInsensitiveCheck(type, 'functionParameterName'))
    return '🔤 Function Parameter Name (String)';
  if (caseInsensitiveCheck(type, 'externalLayoutName'))
    return '🔤 External Layout Name (String)';
  if (caseInsensitiveCheck(type, 'leaderboardId'))
    return '🔤 Leaderboard Identifier (String)';

  if (caseInsensitiveCheck(type, 'operator')) return '🟰 Operator';
  if (caseInsensitiveCheck(type, 'relationalOperator'))
    return '🟰 Relational operator';

  if (caseInsensitiveCheck(type, 'yesorno')) return '❓ Yes or No';
  if (caseInsensitiveCheck(type, 'trueorfalse')) return '❓ True or False';

  if (caseInsensitiveCheck(type, 'multilinestring'))
    return '🔤 Multiline text (String)';
  if (caseInsensitiveCheck(type, 'boolean')) return '🔘 Boolean';
  if (caseInsensitiveCheck(type, 'color')) return '🎨 Color';
  if (caseInsensitiveCheck(type, 'resource')) return '🗂️ Resource';

  return type;
};

const translateTypeToHumanReadableType = type => {
  if (caseInsensitiveCheck(type, 'number')) return 'number';
  if (caseInsensitiveCheck(type, 'expression')) return 'number';
  if (caseInsensitiveCheck(type, 'camera')) return 'number';

  if (caseInsensitiveCheck(type, 'objectList')) return 'object';
  if (caseInsensitiveCheck(type, 'objectPtr')) return 'object';
  if (caseInsensitiveCheck(type, 'objectListOrEmptyIfJustDeclared'))
    return 'object';
  if (caseInsensitiveCheck(type, 'objectListOrEmptyWithoutPicking'))
    return 'object';

  if (caseInsensitiveCheck(type, 'variable')) return 'variable';
  if (caseInsensitiveCheck(type, 'objectvar')) return 'object variable';
  if (caseInsensitiveCheck(type, 'scenevar')) return 'scene variable';
  if (caseInsensitiveCheck(type, 'globalvar')) return 'global variable';

  if (caseInsensitiveCheck(type, 'behavior')) return 'behavior';

  if (caseInsensitiveCheck(type, 'layer')) return 'layer name';
  if (caseInsensitiveCheck(type, 'stringWithSelector')) return 'string';
  if (caseInsensitiveCheck(type, 'identifier')) return 'string';
  if (caseInsensitiveCheck(type, 'sceneName')) return 'scene name';
  if (caseInsensitiveCheck(type, 'layerEffectName')) return 'layer effect name';
  if (caseInsensitiveCheck(type, 'layerEffectParameterName'))
    return 'layer effect property name';
  if (caseInsensitiveCheck(type, 'objectEffectName'))
    return 'object effect name';
  if (caseInsensitiveCheck(type, 'objectEffectParameterName'))
    return 'object effect property name';
  if (caseInsensitiveCheck(type, 'objectPointName')) return 'object point name';
  if (caseInsensitiveCheck(type, 'objectAnimationName'))
    return 'object animation name';
  if (caseInsensitiveCheck(type, 'functionParameterName'))
    return 'function parameter name';
  if (caseInsensitiveCheck(type, 'externalLayoutName'))
    return 'external layout name';
  if (caseInsensitiveCheck(type, 'leaderboardId'))
    return 'leaderboard identifier';

  if (caseInsensitiveCheck(type, 'yesorno')) return 'yes or no';
  if (caseInsensitiveCheck(type, 'trueorfalse')) return 'true or false';

  return type;
};

/**
 * @param {string} type
 * @param {string} sanitizedDescription
 */
const isDescriptionObvious = (type, sanitizedDescription) => {
  const isDescriptionSameAsType =
    sanitizedDescription.toLowerCase().replace(/\s+/g, '') ===
    type.toLowerCase();
  if (isDescriptionSameAsType) return true;

  if (
    type === 'number' &&
    (sanitizedDescription === 'Expression' ||
      sanitizedDescription === 'Expression (number)' ||
      sanitizedDescription === 'Expression.')
  )
    return true;

  if (type === 'operator' || type === 'relationalOperator') {
    return true;
  }
  if (
    type === 'layerEffectName' ||
    type === 'layerEffectParameterName' ||
    type === 'objectEffectName' ||
    type === 'objectEffectParameterName' ||
    type === 'objectPointName' ||
    type === 'objectAnimationName' ||
    type === 'externalLayoutName'
  ) {
    return true;
  }

  return false;
};

const normalizeType = (/** @type {string} */ parameterType) => {
  if (parameterType === 'expression') return 'number';

  if (
    parameterType === 'object' ||
    parameterType === 'objectPtr' ||
    parameterType === 'objectList' ||
    parameterType === 'objectListOrEmptyIfJustDeclared' ||
    parameterType === 'objectListOrEmptyWithoutPicking'
  ) {
    return 'object';
  }

  return parameterType;
};

/**
 * @param {string} type
 * @param {string} sanitizedDescription
 */
const getSimplifiedParameterDescription = (type, sanitizedDescription) => {
  if (
    type === 'number' &&
    sanitizedDescription.toLowerCase().includes('camera number')
  ) {
    return 'Camera number';
  }

  return null;
};

/**
 * @param {ParameterMetadata} parameterMetadata
 * @returns {string}
 */
const getParameterExtraInfoDescription = parameterMetadata => {
  if (parameterMetadata.getType() === 'stringWithSelector') {
    const rawExtraInfo = parameterMetadata.getExtraInfo();
    try {
      const parsedExtraInfo = JSON.parse(rawExtraInfo);
      if (Array.isArray(parsedExtraInfo)) {
        return `(one of: ${parsedExtraInfo
          .map(value => `"${value}"`)
          .join(', ')})`;
      }
    } catch (err) {
      return `(value must be: ${rawExtraInfo})`;
    }
  }

  return '';
};

/** @returns {ReferenceText} */
const generateInstructionReferenceRowsText = ({
  instructionType,
  instructionMetadata,
  isCondition,
  objectMetadata,
  behaviorMetadata,
}) => {
  const paramPadding = '    ';
  const codeOnlyParametersIndexes = [];
  let parametersList = mapFor(
    0,
    instructionMetadata.getParameters().getParametersCount(),
    index => {
      const parameterMetadata = instructionMetadata
        .getParameters()
        .getParameterAt(index);

      const longDescription = parameterMetadata.getLongDescription();
      const sanitizedDescription = [
        parameterMetadata.getDescription(),
        longDescription,
      ]
        .filter(Boolean)
        .join('\n')
        .replace(/\n/g, `\n${paramPadding}  `);

      const type = normalizeType(parameterMetadata.getType());
      const humanReadableTypeDesc = translateTypeToHumanReadableDescription(
        type
      );

      if (parameterMetadata.isCodeOnly()) {
        codeOnlyParametersIndexes.push(index);
        return null;
      }

      const simplifiedParameterDescription = getSimplifiedParameterDescription(
        type,
        sanitizedDescription
      );

      const extraInfoDescription = getParameterExtraInfoDescription(
        parameterMetadata
      );

      return [
        simplifiedParameterDescription
          ? `${paramPadding}- Parameter ${index} (${humanReadableTypeDesc}): ${simplifiedParameterDescription}`
          : isDescriptionObvious(type, sanitizedDescription)
          ? `${paramPadding}- Parameter ${index}: ${humanReadableTypeDesc}`
          : `${paramPadding}- Parameter ${index} (${humanReadableTypeDesc}): ${sanitizedDescription}`,
        extraInfoDescription,
      ]
        .filter(Boolean)
        .join(' ');
    }
  )
    .filter(Boolean)
    .join('\n');

  if (!parametersList) {
    parametersList = `${paramPadding}There are no parameters to set for this ${
      isCondition ? 'condition' : 'action'
    }.`;
  }

  if (codeOnlyParametersIndexes.length) {
    parametersList +=
      '\n\n' +
      `${paramPadding}> Technical note: ${
        codeOnlyParametersIndexes.length === 1 ? 'parameter' : 'parameters'
      } ${codeOnlyParametersIndexes.join(', ')} ${
        codeOnlyParametersIndexes.length === 1
          ? 'is an internal parameter'
          : 'are internal parameters'
      } handled by GDevelop.`;
  }
  parametersList +=
    '\n\n' +
    `${paramPadding}> Technical note: this ${
      isCondition ? 'condition' : 'action'
    } internal type (in GDevelop JSON) is \`${instructionType}\`.`;

  return {
    orderKey: instructionType,
    text: [
      '**' + instructionMetadata.getFullName() + '**  ',
      instructionMetadata.getDescription().replace(/\n/, `  \n`),
      '',
      ...(parametersList
        ? ['??? quote "See parameters & details"', '', parametersList, '']
        : []),
    ].join('\n'),
  };
};

/**
 * @param {{ expressionType: string, expressionMetadata: ExpressionMetadata, objectMetadata?: ObjectMetadata, behaviorMetadata?: BehaviorMetadata }} options
 * @returns {ReferenceText}
 */
const generateExpressionReferenceRowsText = ({
  expressionType,
  expressionMetadata,
  objectMetadata,
  behaviorMetadata,
}) => {
  let parameterRows = [];
  let parameterStrings = [];
  mapFor(0, expressionMetadata.getParameters().getParametersCount(), index => {
    if ((!!objectMetadata && index < 1) || (!!behaviorMetadata && index < 2)) {
      return; // Skip the first (or first twos) parameters by convention.
    }
    const parameterMetadata = expressionMetadata
      .getParameters()
      .getParameterAt(index);
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

    const type = parameterMetadata.getType();
    const humanReadableTypeDesc = translateTypeToHumanReadableDescription(type);

    parameterRows.push(
      `| | _${humanReadableTypeDesc}_ | ${sanitizedDescription} |`
    );
    parameterStrings.push(translateTypeToHumanReadableType(type));
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

      if (instructionMetadata.isHidden() || instructionMetadata.isPrivate())
        return null;

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
 * @param {{ expressionsMetadata: MapStringExpressionMetadata, objectMetadata?: ObjectMetadata, behaviorMetadata?: BehaviorMetadata }} options
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

      if (!expressionMetadata.isShown() || expressionMetadata.isPrivate())
        return null;

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
 * @param {string} text
 * @returns {string}
 */
const sanitizePropertyDescription = text => {
  const sanitizedText = text.replace(/\n/g, ' ').trim();
  if (sanitizedText.endsWith('.')) return sanitizedText;
  return sanitizedText + '.';
};

/**
 * @param {{ propertiesMetadata?: MapStringPropertyDescriptor, propertiesContainer?: PropertiesContainer }} options
 * @returns {Array<ReferenceText>}
 */
const generatePropertiesReferenceTexts = ({
  propertiesMetadata,
  propertiesContainer,
}) => {
  /**
   * @param {string} name
   * @param {PropertyDescriptor | NamedPropertyDescriptor} property
   * @returns {ReferenceText | null}
   */
  const generatePropertyReferenceText = (name, property) => {
    if (name.startsWith('_')) return null;
    if (property.isHidden()) return null;

    if (property.getType() === 'Behavior') {
      return null;
    }

    const type = property.getType();
    const measurementUnit = property.getMeasurementUnit();
    const measurementUnitText = measurementUnit.isUndefined()
      ? null
      : measurementUnit.getLabel();

    const choices =
      type.toLowerCase() === 'choice'
        ? [
            ...mapVector(property.getChoices(), choice => choice.getValue()),
            // TODO Remove this once we made sure no built-in extension still use `addExtraInfo` instead of `addChoice`.
            ...property.getExtraInfo().toJSArray(),
          ]
        : null;
    const information = [
      translateTypeToHumanReadableDescription(type),
      choices
        ? `one of: ${choices.map(choice => `"${choice}"`).join(', ')}`
        : null,
      measurementUnitText,
    ].filter(Boolean);

    return {
      orderKey: name,
      text: [
        `- **${property.getLabel() || name}** (${information.join(', ')}).`,
        property.getDescription()
          ? `${sanitizePropertyDescription(property.getDescription())}`
          : null,
        property.getValue()
          ? `Default value is \`${property.getValue()}\`.`
          : null,
      ]
        .filter(Boolean)
        .join(' '),
    };
  };

  /**
   * @param {string} name
   * @param {PropertyDescriptor | NamedPropertyDescriptor} property
   * @returns {ReferenceText | null}
   */
  const generatePropertyInternalReferenceText = (name, property) => {
    if (name.startsWith('_')) return null;
    if (property.isHidden()) return null;

    const padding = '    ';

    if (property.getType() === 'Behavior') {
      return {
        orderKey: name,
        text: `${padding}> This behavior must be used on an object also having a behavior with type "${property
          .getExtraInfo()
          .toJSArray()
          .join(', ')}". This is stored on property \`${name}\`.\n`,
      };
    }

    const type = property.getType();
    const measurementUnit = property.getMeasurementUnit();
    const measurementUnitText = measurementUnit.isUndefined()
      ? null
      : measurementUnit.getName();

    return {
      orderKey: name,
      text: [
        `${padding}- **${property.getLabel() ||
          name}** is stored as \`${name}\` (${type}).`,
        measurementUnitText ? `Unit is ${measurementUnitText}.` : null,
        `Default value is \`${property.getValue().replace(/\n/g, ' ')}\`.`,
      ]
        .filter(Boolean)
        .join(' '),
    };
  };

  const propertiesReferenceTexts = [
    ...(propertiesMetadata
      ? propertiesMetadata
          .keys()
          .toJSArray()
          .map(propertyName => {
            const propertyDescriptor = propertiesMetadata.get(propertyName);
            return generatePropertyReferenceText(
              propertyName,
              propertyDescriptor
            );
          })
      : []),
    ...(propertiesContainer
      ? mapVector(propertiesContainer, namedPropertyDescriptor => {
          const propertyName = namedPropertyDescriptor.getName();

          return generatePropertyReferenceText(
            propertyName,
            namedPropertyDescriptor
          );
        })
      : []),
  ].filter(Boolean);

  if (!propertiesReferenceTexts.length) return [];

  const internalPropertiesReferenceTexts = [
    ...(propertiesMetadata
      ? propertiesMetadata
          .keys()
          .toJSArray()
          .map(propertyName => {
            const propertyDescriptor = propertiesMetadata.get(propertyName);
            return generatePropertyInternalReferenceText(
              propertyName,
              propertyDescriptor
            );
          })
      : []),
    ...(propertiesContainer
      ? mapVector(propertiesContainer, namedPropertyDescriptor => {
          const propertyName = namedPropertyDescriptor.getName();
          return generatePropertyInternalReferenceText(
            propertyName,
            namedPropertyDescriptor
          );
        })
      : []),
  ].filter(Boolean);

  return [
    ...propertiesReferenceTexts,
    {
      orderKey: '',
      text: '\n??? quote "See internal technical details"\n\n',
    },
    ...internalPropertiesReferenceTexts,
  ];
};

/**
 * @param {{
 * platform: Platform,
 * extension: PlatformExtension,
 * eventsFunctionsExtension: EventsFunctionsExtension | null
 * }} options
 * @returns {ExtensionReference}
 */
const generateExtensionReference = ({
  platform,
  extension,
  eventsFunctionsExtension,
}) => {
  const extensionExpressions = extension.getAllExpressions();
  const extensionStrExpressions = extension.getAllStrExpressions();

  /** @type {Array<string>} */
  const objectTypes = extension.getExtensionObjectsTypes().toJSArray();
  /** @type {Array<string>} */
  const behaviorTypes = extension.getBehaviorsTypes().toJSArray();

  // Object expressions
  /** @type {Array<ObjectReference>} */
  let objectReferences = objectTypes
    .map(objectType => {
      const objectMetadata = extension.getObjectMetadata(objectType);
      if (objectMetadata.isPrivate()) {
        return null;
      }

      const propertiesReferenceTexts = [];

      if (eventsFunctionsExtension) {
        // Objects from "events-based" extensions:
        const eventsBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();
        const objectName =
          objectType.split('::').pop() || 'Unrecognized object type format';

        if (eventsBasedObjects.has(objectName)) {
          const eventsBasedObject = eventsBasedObjects.get(objectName);
          propertiesReferenceTexts.push(
            ...generatePropertiesReferenceTexts({
              propertiesContainer: eventsBasedObject.getPropertyDescriptors(),
            })
          );
        } else {
          throw new Error(
            `Object "${objectType}" not found in events-based extension "${eventsFunctionsExtension.getFullName()}".`
          );
        }
      } else {
        // "Built-in" objects:
        const objectConfiguration = platform
          .createObjectConfiguration(objectType)
          .release();
        if (isNullPtr(objectConfiguration)) {
          throw new Error(
            `Failed to create object configuration for object type "${objectType}".`
          );
        }

        propertiesReferenceTexts.push(
          ...generatePropertiesReferenceTexts({
            propertiesMetadata: objectConfiguration.getProperties(),
          })
        );
      }

      const actionsReferenceTexts = generateInstructionsReferenceRowsTexts({
        areConditions: false,
        instructionsMetadata: extension.getAllActionsForObject(objectType),
        objectMetadata,
      });
      const conditionsReferenceTexts = generateInstructionsReferenceRowsTexts({
        areConditions: true,
        instructionsMetadata: extension.getAllConditionsForObject(objectType),
        objectMetadata,
      });
      const expressionsReferenceTexts = [
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
      expressionsReferenceTexts.sort(sortReferenceTexts);

      return {
        objectMetadata,
        propertiesReferenceTexts,
        actionsReferenceTexts,
        conditionsReferenceTexts,
        expressionsReferenceTexts,
      };
    })
    .filter(Boolean);

  // Behavior expressions
  /** @type {Array<BehaviorReference>} */
  let behaviorReferences = behaviorTypes
    .map(behaviorType => {
      const behaviorMetadata = extension.getBehaviorMetadata(behaviorType);

      if (behaviorMetadata.isPrivate()) {
        return null;
      }

      const propertiesReferenceTexts = generatePropertiesReferenceTexts({
        propertiesMetadata: behaviorMetadata.getProperties(),
      });
      const sharedPropertiesReferenceTexts = generatePropertiesReferenceTexts({
        propertiesMetadata: behaviorMetadata.getSharedProperties(),
      });

      const actionsReferenceTexts = generateInstructionsReferenceRowsTexts({
        areConditions: false,
        instructionsMetadata: extension.getAllActionsForBehavior(behaviorType),
        behaviorMetadata,
      });
      const conditionsReferenceTexts = generateInstructionsReferenceRowsTexts({
        areConditions: true,
        instructionsMetadata: extension.getAllConditionsForBehavior(
          behaviorType
        ),
        behaviorMetadata,
      });
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
        propertiesReferenceTexts,
        sharedPropertiesReferenceTexts,
        actionsReferenceTexts,
        conditionsReferenceTexts,
        expressionsReferenceTexts,
      };
    })
    .filter(Boolean);

  // Free (non objects/non behaviors) actions/conditions/expressions
  const freeActionsReferenceTexts = generateInstructionsReferenceRowsTexts({
    areConditions: false,
    instructionsMetadata: extension.getAllActions(),
  });
  const freeConditionsReferenceTexts = generateInstructionsReferenceRowsTexts({
    areConditions: true,
    instructionsMetadata: extension.getAllConditions(),
  });
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
    eventsFunctionsExtension,
    freeActionsReferenceTexts,
    freeConditionsReferenceTexts,
    freeExpressionsReferenceTexts,
    objectReferences,
    behaviorReferences,
  };
};

/**
 * @param {ExtensionReference} extensionReference
 * @param {({extension, depth}) => RawText} generateExtensionHeaderText
 * @param {({extension}) => RawText} generateExtensionFooterText
 * @returns {Array<RawText>}
 */
const generateExtensionRawText = (
  extensionReference,
  generateExtensionHeaderText,
  generateExtensionFooterText
) => {
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

    return [generateHeader({ headerName, depth }), ...texts, { text: '' }];
  };

  return [
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
        propertiesReferenceTexts,
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
        ...withHeaderIfNotEmpty(propertiesReferenceTexts, {
          headerName: 'Object properties',
          depth: 3,
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
        propertiesReferenceTexts,
        sharedPropertiesReferenceTexts,
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
        ...withHeaderIfNotEmpty(propertiesReferenceTexts, {
          headerName: 'Behavior properties',
          depth: 3,
        }),
        ...withHeaderIfNotEmpty(sharedPropertiesReferenceTexts, {
          headerName: 'Behavior shared properties',
          depth: 3,
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
    { text: '' },
    ...extension
      .getExtensionEffectTypes()
      .toJSArray()
      .map(
        /**
         * @param {string} effectType
         * @returns {RawText}
         */
        effectType => {
          const effectMetadata = extension.getEffectMetadata(effectType);
          const properties = effectMetadata.getProperties();
          const propertyNames = properties.keys().toJSArray();

          return {
            text: [
              `### Effect "${effectMetadata.getFullName()}"`,
              '',
              `${effectMetadata.getDescription().replace(/\n/g, '  ')}`,
              '',
              ...[
                effectMetadata.isMarkedAsUnique()
                  ? 'This effect can be added only once on a layer.'
                  : null,
                effectMetadata.isMarkedAsOnlyWorkingFor2D()
                  ? effectMetadata.isMarkedAsNotWorkingForObjects()
                    ? 'This effect is for 2D layers only.'
                    : 'This effect is for 2D layers or objects only.'
                  : null,
                effectMetadata.isMarkedAsOnlyWorkingFor3D()
                  ? 'This effect is for 3D layers only.'
                  : null,
              ].filter(Boolean),
              '',
              `Properties of this effect are:`,
              '',
              ...propertyNames.map(propertyName => {
                const propertyMetadata = properties.get(propertyName);
                return [
                  propertyMetadata.getDescription()
                    ? `- **${propertyMetadata.getLabel()}**: ${propertyMetadata.getDescription()}.`
                    : `- **${propertyMetadata.getLabel()}**.`,
                  propertyMetadata.getValue()
                    ? `Default value is \`${propertyMetadata.getValue()}\`. For events, write: \`"${propertyName}"\`.`
                    : `For events, write: \`"${propertyName}"\`.`,
                ].join(' ');
              }),
              '',
            ].join(`\n`),
          };
        }
      ),
    generateExtensionFooterText({ extension }),
  ].filter(Boolean);
};

module.exports = {
  rawTextsToString,
  generateExtensionReference,
  generateExtensionRawText,
  generateExpressionsTableHeader,
  generateObjectHeaderText,
  generateObjectNoExpressionsText,
  generateBehaviorHeaderText,
  generateBehaviorNoExpressionsText,
  generateHeader,
};
