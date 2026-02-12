// @flow
import { type I18n as I18nType } from '@lingui/core';
import {
  type EnumeratedExpressionMetadata,
  type InstructionOrExpressionScope,
} from './EnumeratedInstructionOrExpressionMetadata';
import { mapVector } from '../Utils/MapFor';
import flatten from 'lodash/flatten';
import { getExtensionPrefix } from './EnumerateInstructions';
const gd: libGDevelop = global.gd;

const GROUP_DELIMITER = ' ❯ ';

const shouldOnlyBeNumberType = (type: string) => type === 'number';

const enumerateExpressionMetadataMap = (
  prefix: string,
  expressions: gdMapStringExpressionMetadata,
  scope: InstructionOrExpressionScope
): Array<EnumeratedExpressionMetadata> => {
  // $FlowFixMe[incompatible-type]
  // $FlowFixMe[incompatible-exact]
  return mapVector(expressions.keys(), expressionType => {
    // $FlowFixMe[incompatible-type]
    const exprMetadata = expressions.get(expressionType);
    if (!exprMetadata.isShown()) {
      return null; // Skip hidden expressions
    }

    let parameters = [];
    for (let i = 0; i < exprMetadata.getParametersCount(); i++) {
      if (scope.objectMetadata && i === 0) continue;
      if (scope.behaviorMetadata && i <= 1) continue; //Skip object and behavior parameters
      if (exprMetadata.getParameter(i).isCodeOnly()) continue;

      parameters.push(exprMetadata.getParameter(i));
    }

    const groupName = exprMetadata.getGroup();

    return {
      type: expressionType,
      name: expressionType,
      displayedName: exprMetadata.getFullName(),
      fullGroupName: [prefix, groupName].filter(Boolean).join(GROUP_DELIMITER),
      iconFilename: exprMetadata.getSmallIconFilename(),
      metadata: exprMetadata,
      parameters: parameters,
      scope,
      isPrivate: exprMetadata.isPrivate(),
      isRelevantForLayoutEvents: exprMetadata.isRelevantForLayoutEvents(),
      isRelevantForFunctionEvents: exprMetadata.isRelevantForFunctionEvents(),
      isRelevantForAsynchronousFunctionEvents: exprMetadata.isRelevantForAsynchronousFunctionEvents(),
      isRelevantForCustomObjectEvents: exprMetadata.isRelevantForCustomObjectEvents(),
    };
  }).filter(Boolean);
};

/** Enumerate all the free expressions available. */
export const enumerateFreeExpressions = (
  type: string,
  i18n: I18nType
): Array<EnumeratedExpressionMetadata> => {
  const allExtensions = gd
    .asPlatform(gd.JsPlatform.get())
    .getAllPlatformExtensions();

  return flatten(
    // $FlowFixMe[incompatible-exact]
    mapVector(allExtensions, extension => {
      // $FlowFixMe[incompatible-type]
      const prefix = getExtensionPrefix(extension, i18n);
      const scope = {
        // $FlowFixMe[incompatible-use]
        extension: { name: extension.getName() },
        objectMetadata: undefined,
        behaviorMetadata: undefined,
      };

      return [
        ...(!shouldOnlyBeNumberType(type)
          ? enumerateExpressionMetadataMap(
              prefix,
              // $FlowFixMe[incompatible-use]
              extension.getAllStrExpressions(),
              // $FlowFixMe[incompatible-type]
              scope
            )
          : []),
        ...enumerateExpressionMetadataMap(
          prefix,
          // $FlowFixMe[incompatible-use]
          extension.getAllExpressions(),
          // $FlowFixMe[incompatible-type]
          scope
        ),
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
  const scope = {
    extension: { name: extension.getName() },
    objectMetadata: {
      name: objectMetadata.getName(),
      isPrivate: objectMetadata.isPrivate(),
    },
  };

  let objectsExpressions = [
    ...(shouldOnlyBeNumberType(type)
      ? []
      : enumerateExpressionMetadataMap(
          '',
          extension.getAllStrExpressionsForObject(objectType),
          // $FlowFixMe[incompatible-type]
          scope
        )),
    ...enumerateExpressionMetadataMap(
      '',
      extension.getAllExpressionsForObject(objectType),
      // $FlowFixMe[incompatible-type]
      scope
    ),
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
      ...(shouldOnlyBeNumberType(type)
        ? []
        : enumerateExpressionMetadataMap(
            '',
            extension.getAllStrExpressionsForObject(baseObjectType),
            // $FlowFixMe[incompatible-type]
            scope
          )),
      ...enumerateExpressionMetadataMap(
        '',
        extension.getAllExpressionsForObject(baseObjectType),
        // $FlowFixMe[incompatible-type]
        scope
      ),
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
  const scope = {
    extension: { name: extension.getName() },
    behaviorMetadata: {
      name: behaviorMetadata.getName(),
      isPrivate: behaviorMetadata.isPrivate(),
    },
  };

  return [
    ...(shouldOnlyBeNumberType(type)
      ? []
      : enumerateExpressionMetadataMap(
          '',
          extension.getAllStrExpressionsForBehavior(behaviorType),
          // $FlowFixMe[incompatible-type]
          scope
        )),
    ...enumerateExpressionMetadataMap(
      '',
      extension.getAllExpressionsForBehavior(behaviorType),
      // $FlowFixMe[incompatible-type]
      scope
    ),
  ];
};

/** Enumerate all the expressions available. */
export const enumerateAllExpressions = (
  type: string,
  i18n: I18nType
): Array<EnumeratedExpressionMetadata> => {
  // $FlowFixMe[missing-empty-array-annot]
  const objectsExpressions = [];
  // $FlowFixMe[missing-empty-array-annot]
  const behaviorsExpressions = [];
  const freeExpressions = enumerateFreeExpressions(type, i18n);

  const allExtensions = gd
    .asPlatform(gd.JsPlatform.get())
    .getAllPlatformExtensions();
  // $FlowFixMe[incompatible-exact]
  mapVector(allExtensions, extension => {
    // $FlowFixMe[incompatible-type]
    const prefix = getExtensionPrefix(extension, i18n);

    //Objects expressions:
    // $FlowFixMe[incompatible-use]
    mapVector(extension.getExtensionObjectsTypes(), objectType => {
      // $FlowFixMe[incompatible-use]
      const objectMetadata = extension.getObjectMetadata(objectType);
      const scope = {
        // $FlowFixMe[incompatible-use]
        extension: { name: extension.getName() },
        objectMetadata: {
          name: objectMetadata.getName(),
          isPrivate: objectMetadata.isPrivate(),
        },
      };

      if (!shouldOnlyBeNumberType(type))
        // $FlowFixMe[incompatible-type]
        objectsExpressions.push(
          ...enumerateExpressionMetadataMap(
            prefix,
            // $FlowFixMe[incompatible-use]
            extension.getAllStrExpressionsForObject(objectType),
            // $FlowFixMe[incompatible-type]
            scope
          )
        );
      // $FlowFixMe[incompatible-type]
      objectsExpressions.push(
        ...enumerateExpressionMetadataMap(
          prefix,
          // $FlowFixMe[incompatible-use]
          extension.getAllExpressionsForObject(objectType),
          // $FlowFixMe[incompatible-type]
          scope
        )
      );
    });

    //Behaviors expressions:
    // $FlowFixMe[incompatible-use]
    mapVector(extension.getBehaviorsTypes(), behaviorType => {
      // $FlowFixMe[incompatible-use]
      const behaviorMetadata = extension.getBehaviorMetadata(behaviorType);
      const scope = {
        // $FlowFixMe[incompatible-use]
        extension: { name: extension.getName() },
        behaviorMetadata: {
          name: behaviorMetadata.getName(),
          isPrivate: behaviorMetadata.isPrivate(),
        },
      };

      if (!shouldOnlyBeNumberType(type))
        // $FlowFixMe[incompatible-type]
        behaviorsExpressions.push(
          ...enumerateExpressionMetadataMap(
            prefix,
            // $FlowFixMe[incompatible-use]
            extension.getAllStrExpressionsForBehavior(behaviorType),
            // $FlowFixMe[incompatible-type]
            scope
          )
        );
      // $FlowFixMe[incompatible-type]
      behaviorsExpressions.push(
        ...enumerateExpressionMetadataMap(
          prefix,
          // $FlowFixMe[incompatible-use]
          extension.getAllExpressionsForBehavior(behaviorType),
          // $FlowFixMe[incompatible-type]
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
    // $FlowFixMe[constant-condition]
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
