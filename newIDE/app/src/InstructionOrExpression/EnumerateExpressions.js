// @flow
import {
  type EnumeratedExpressionMetadata,
  type InstructionOrExpressionScope,
} from './EnumeratedInstructionOrExpressionMetadata.js';
import { mapVector } from '../Utils/MapFor';
import flatten from 'lodash/flatten';
const gd: libGDevelop = global.gd;

const GROUP_DELIMITER = '/';

// Support enumerate expressions that can be string, number or both ("number|string").
// "number|string" has limited support in the codebase, enough to be used in expressions but not
// in parameters and this is not a generic feature (you can't do "string|variable" or this kind of things).
// This may be improved in the future if really necessary.
const isPotentiallyStringType = (type: string) =>
  type === 'string' || type === 'number|string';
const isPotentiallyNumberType = (type: string) =>
  type === 'number' || type === 'number|string';

const getExtensionPrefix = (extension: gdPlatformExtension): string => {
  const allObjectsTypes = extension.getExtensionObjectsTypes();
  const allBehaviorsTypes = extension.getBehaviorsTypes();

  if (allObjectsTypes.size() > 0 || allBehaviorsTypes.size() > 0) {
    return (
      (extension.getName() === 'BuiltinObject'
        ? 'Common expressions for all objects'
        : extension.getFullName()) + GROUP_DELIMITER
    );
  }

  return '';
};

const enumerateExpressionMetadataMap = (
  prefix: string,
  expressions: gdMapStringExpressionMetadata,
  scope: InstructionOrExpressionScope
): Array<EnumeratedExpressionMetadata> => {
  return mapVector(expressions.keys(), expressionType => {
    const exprMetadata = expressions.get(expressionType);
    if (!exprMetadata.isShown()) {
      return null; // Skip hidden expressions
    }

    if (
      scope.objectMetadata &&
      scope.objectMetadata.isUnsupportedBaseObjectCapability(
        exprMetadata.getRequiredBaseObjectCapability()
      )
    )
      return null; // Skip expressions not supported by the object.

    var parameters = [];
    for (var i = 0; i < exprMetadata.getParametersCount(); i++) {
      if (scope.objectMetadata && i === 0) continue;
      if (scope.behaviorMetadata && i <= 1) continue; //Skip object and behavior parameters
      if (exprMetadata.getParameter(i).isCodeOnly()) continue;

      parameters.push(exprMetadata.getParameter(i));
    }

    return {
      type: expressionType,
      name: expressionType,
      displayedName: exprMetadata.getFullName(),
      fullGroupName: prefix + exprMetadata.getGroup(),
      iconFilename: exprMetadata.getSmallIconFilename(),
      metadata: exprMetadata,
      parameters: parameters,
      scope,
      isPrivate: exprMetadata.isPrivate(),
    };
  }).filter(Boolean);
};

/** Enumerate all the free expressions available. */
export const enumerateFreeExpressions = (
  type: string
): Array<EnumeratedExpressionMetadata> => {
  const allExtensions = gd
    .asPlatform(gd.JsPlatform.get())
    .getAllPlatformExtensions();
  const returnNumber = isPotentiallyNumberType(type);
  const returnString = isPotentiallyStringType(type);

  return flatten(
    mapVector(allExtensions, extension => {
      const prefix = getExtensionPrefix(extension);
      const scope = {
        extension,
        objectMetadata: undefined,
        behaviorMetadata: undefined,
      };

      return [
        ...(returnString
          ? enumerateExpressionMetadataMap(
              prefix,
              extension.getAllStrExpressions(),
              scope
            )
          : []),
        ...(returnNumber
          ? enumerateExpressionMetadataMap(
              prefix,
              extension.getAllExpressions(),
              scope
            )
          : []),
      ];
    })
  );
};

/** Enumerate the expressions available for the given object type. */
export const enumerateObjectExpressions = (
  type: string,
  objectType: string
): Array<EnumeratedExpressionMetadata> => {
  const extensionAndObjectMetadata = gd.MetadataProvider.getExtensionAndObjectMetadata(
    gd.JsPlatform.get(),
    objectType
  );
  const extension = extensionAndObjectMetadata.getExtension();
  const objectMetadata = extensionAndObjectMetadata.getMetadata();
  const scope = { extension, objectMetadata };

  let objectsExpressions = [
    ...(isPotentiallyStringType(type)
      ? enumerateExpressionMetadataMap(
          '',
          extension.getAllStrExpressionsForObject(objectType),
          scope
        )
      : []),
    ...(isPotentiallyNumberType(type)
      ? enumerateExpressionMetadataMap(
          '',
          extension.getAllExpressionsForObject(objectType),
          scope
        )
      : []),
  ];

  const baseObjectType = ''; /* An empty string means the base object */
  if (objectType !== baseObjectType) {
    const extensionAndObjectMetadata = gd.MetadataProvider.getExtensionAndObjectMetadata(
      gd.JsPlatform.get(),
      baseObjectType
    );
    const extension = extensionAndObjectMetadata.getExtension();

    objectsExpressions = [
      ...objectsExpressions,
      ...(isPotentiallyStringType(type)
        ? enumerateExpressionMetadataMap(
            '',
            extension.getAllStrExpressionsForObject(baseObjectType),
            scope
          )
        : []),
      ...(isPotentiallyNumberType(type)
        ? enumerateExpressionMetadataMap(
            '',
            extension.getAllExpressionsForObject(baseObjectType),
            scope
          )
        : []),
    ];
  }

  return objectsExpressions;
};

/** Enumerate the expressions available for the given behavior type. */
export const enumerateBehaviorExpressions = (
  type: string,
  behaviorType: string
): Array<EnumeratedExpressionMetadata> => {
  const extensionAndBehaviorMetadata = gd.MetadataProvider.getExtensionAndBehaviorMetadata(
    gd.JsPlatform.get(),
    behaviorType
  );
  const extension = extensionAndBehaviorMetadata.getExtension();
  const behaviorMetadata = extensionAndBehaviorMetadata.getMetadata();
  const scope = { extension, behaviorMetadata };

  return [
    ...(isPotentiallyStringType(type)
      ? enumerateExpressionMetadataMap(
          '',
          extension.getAllStrExpressionsForBehavior(behaviorType),
          scope
        )
      : []),
    ...(isPotentiallyNumberType(type)
      ? enumerateExpressionMetadataMap(
          '',
          extension.getAllExpressionsForBehavior(behaviorType),
          scope
        )
      : []),
  ];
};

/** Enumerate all the expressions available. */
export const enumerateAllExpressions = (
  type: string
): Array<EnumeratedExpressionMetadata> => {
  const returnNumber = isPotentiallyNumberType(type);
  const returnString = isPotentiallyStringType(type);

  const objectsExpressions = [];
  const behaviorsExpressions = [];
  const freeExpressions = enumerateFreeExpressions(type);

  const allExtensions = gd
    .asPlatform(gd.JsPlatform.get())
    .getAllPlatformExtensions();
  mapVector(allExtensions, extension => {
    const prefix = getExtensionPrefix(extension);

    //Objects expressions:
    mapVector(extension.getExtensionObjectsTypes(), objectType => {
      const objectMetadata = extension.getObjectMetadata(objectType);
      const scope = { extension, objectMetadata };

      if (returnString)
        objectsExpressions.push.apply(
          objectsExpressions,
          enumerateExpressionMetadataMap(
            prefix,
            extension.getAllStrExpressionsForObject(objectType),
            scope
          )
        );
      if (returnNumber)
        objectsExpressions.push.apply(
          objectsExpressions,
          enumerateExpressionMetadataMap(
            prefix,
            extension.getAllExpressionsForObject(objectType),
            scope
          )
        );
    });

    //Behaviors expressions:
    mapVector(extension.getBehaviorsTypes(), behaviorType => {
      const behaviorMetadata = extension.getBehaviorMetadata(behaviorType);
      const scope = { extension, behaviorMetadata };

      if (returnString)
        behaviorsExpressions.push.apply(
          behaviorsExpressions,
          enumerateExpressionMetadataMap(
            prefix,
            extension.getAllStrExpressionsForBehavior(behaviorType),
            scope
          )
        );
      if (returnNumber)
        behaviorsExpressions.push.apply(
          behaviorsExpressions,
          enumerateExpressionMetadataMap(
            prefix,
            extension.getAllExpressionsForBehavior(behaviorType),
            scope
          )
        );
    });
  });

  return [...freeExpressions, ...objectsExpressions, ...behaviorsExpressions];
};

export const filterExpressions = (
  list: Array<EnumeratedExpressionMetadata>,
  searchText: string
): Array<EnumeratedExpressionMetadata> => {
  if (!searchText) return list;

  const lowercaseSearchText = searchText.toLowerCase();

  const matchCritera = (enumeratedExpression: EnumeratedExpressionMetadata) => {
    return (
      enumeratedExpression.type.toLowerCase().indexOf(lowercaseSearchText) !==
      -1
    );
  };

  const favorExactMatch = (
    list: Array<EnumeratedExpressionMetadata>
  ): Array<EnumeratedExpressionMetadata> => {
    if (!searchText) {
      return list;
    }

    for (var i = 0; i < list.length; ++i) {
      if (list[i].type.toLowerCase() === lowercaseSearchText) {
        const exactMatch = list[i];
        list.splice(i, 1);
        list.unshift(exactMatch);
      }
    }

    return list;
  };

  // See EnumerateInstructions for a similar logic for instructions
  return favorExactMatch(list.filter(matchCritera));
};
