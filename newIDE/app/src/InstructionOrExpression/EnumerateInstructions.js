// @flow
import {
  type EnumeratedInstructionMetadata,
  type InstructionOrExpressionScope,
  type EnumeratedInstructionOrExpressionMetadata,
} from './EnumeratedInstructionOrExpressionMetadata.js';
import { fuzzyOrEmptyFilter } from '../Utils/FuzzyOrEmptyFilter';

const gd: libGDevelop = global.gd;

const GROUP_DELIMITER = '/';

type ExtensionsExtraInstructions = {
  BuiltinObject?: {
    '': Array<string>,
  },
  Physics2?: {
    'Physics2::Physics2Behavior': Array<string>,
  },
};

const freeActionsToAddToObject: ExtensionsExtraInstructions = {
  BuiltinObject: {
    '': ['AjoutHasard', 'Create', 'AjoutObjConcern'],
  },
};

const freeConditionsToAddToObject: ExtensionsExtraInstructions = {
  BuiltinObject: {
    '': [
      'AjoutHasard',
      'AjoutObjConcern',
      'CollisionNP',
      'NbObjet',
      'PickNearest',
      'Distance',
      'SeDirige',
      'EstTourne',
      'SourisSurObjet',
    ],
  },
};

const freeActionsToAddToBehavior: ExtensionsExtraInstructions = {};

const freeConditionsToAddToBehavior: ExtensionsExtraInstructions = {
  Physics2: {
    'Physics2::Physics2Behavior': ['Physics2::Collision'],
  },
};

const freeInstructionsToRemove = {
  BuiltinObject: [
    // Note: even if "Create" was added to the object actions for convenience,
    // we also keep it in the list of free actions.

    // $FlowFixMe
    ...freeConditionsToAddToObject.BuiltinObject[''],
  ],
  Physics2: [
    // $FlowFixMe
    ...freeConditionsToAddToBehavior.Physics2['Physics2::Physics2Behavior'],
  ],
};

const getExtensionPrefix = (extension: gdPlatformExtension): string => {
  return (
    extension.getCategory() +
    GROUP_DELIMITER +
    extension.getFullName() +
    GROUP_DELIMITER
  );
};

/**
 * When all instructions are searched, some can be duplicated
 * (on purpose, so that it's easier to find them for users)
 * in both the object instructions and in the free instructions.
 *
 * This removes the duplication, useful for showing results in a list.
 */
export const deduplicateInstructionsList = (
  list: Array<EnumeratedInstructionMetadata>
): Array<EnumeratedInstructionMetadata> => {
  let createFound = false;
  return list.filter(enumerateInstruction => {
    if (enumerateInstruction.type === 'Create') {
      if (createFound) return false;

      createFound = true;
    }

    return true;
  });
};

const filterInstructionsToRemove = (
  list: Array<EnumeratedInstructionMetadata>,
  typesToRemove: ?$ReadOnlyArray<string>
) => {
  const types = typesToRemove; // Make Flow happy
  if (!types) return list;

  return list.filter(metadata => types.indexOf(metadata.type) === -1);
};

const enumerateExtraBehaviorInstructions = (
  isCondition: boolean,
  extension: gdPlatformExtension,
  behaviorType: string,
  prefix: string,
  scope: InstructionOrExpressionScope
) => {
  const extensionName = extension.getName();

  const extensionsExtraInstructions = isCondition
    ? freeConditionsToAddToBehavior[extensionName]
    : freeActionsToAddToBehavior[extensionName];
  if (!extensionsExtraInstructions) {
    return [];
  }

  const objectExtraInstructions = extensionsExtraInstructions[behaviorType];
  if (!objectExtraInstructions) {
    return [];
  }

  const instructionMetadataMap = isCondition
    ? extension.getAllConditions()
    : extension.getAllActions();

  return objectExtraInstructions.map(type =>
    enumerateInstruction(prefix, type, instructionMetadataMap.get(type), scope)
  );
};

const enumerateExtraObjectInstructions = (
  isCondition: boolean,
  extension: gdPlatformExtension,
  objectType: string,
  prefix: string,
  scope: InstructionOrExpressionScope
) => {
  const extensionName = extension.getName();

  const extensionsExtraInstructions = isCondition
    ? freeConditionsToAddToObject[extensionName]
    : freeActionsToAddToObject[extensionName];
  if (!extensionsExtraInstructions) {
    return [];
  }

  const objectExtraInstructions = extensionsExtraInstructions[objectType];
  if (!objectExtraInstructions) {
    return [];
  }

  const instructionMetadataMap = isCondition
    ? extension.getAllConditions()
    : extension.getAllActions();

  return objectExtraInstructions.map(type =>
    enumerateInstruction(prefix, type, instructionMetadataMap.get(type), scope)
  );
};

const enumerateInstruction = (
  prefix: string,
  type: string,
  instrMetadata: gdInstructionMetadata,
  scope: InstructionOrExpressionScope
): EnumeratedInstructionMetadata => {
  const displayedName = instrMetadata.getFullName();
  const groupName = instrMetadata.getGroup();
  const iconFilename = instrMetadata.getIconFilename();
  const fullGroupName = prefix + groupName;

  return {
    type,
    metadata: instrMetadata,
    iconFilename,
    displayedName,
    fullGroupName,
    scope,
    isPrivate: instrMetadata.isPrivate(),
  };
};

const enumerateExtensionInstructions = (
  prefix: string,
  instructions: gdMapStringInstructionMetadata,
  scope: InstructionOrExpressionScope
): Array<EnumeratedInstructionMetadata> => {
  //Get the map containing the metadata of the instructions provided by the extension...
  const instructionsTypes = instructions.keys();
  const allInstructions = [];

  //... and add each instruction
  for (let j = 0; j < instructionsTypes.size(); ++j) {
    const type = instructionsTypes.at(j);
    const instrMetadata = instructions.get(type);
    if (instrMetadata.isHidden()) continue;

    allInstructions.push(
      enumerateInstruction(prefix, type, instrMetadata, scope)
    );
  }

  return allInstructions;
};

/**
 * List all the instructions available.
 */
export const enumerateAllInstructions = (
  isCondition: boolean
): Array<EnumeratedInstructionMetadata> => {
  let allInstructions = [];

  const allExtensions = gd
    .asPlatform(gd.JsPlatform.get())
    .getAllPlatformExtensions();
  for (let i = 0; i < allExtensions.size(); ++i) {
    const extension = allExtensions.at(i);
    const extensionName = extension.getName();
    const allObjectsTypes = extension.getExtensionObjectsTypes();
    const allBehaviorsTypes = extension.getBehaviorsTypes();
    const prefix = getExtensionPrefix(extension);

    //Free instructions
    const extensionFreeInstructions = enumerateExtensionInstructions(
      prefix,
      isCondition ? extension.getAllConditions() : extension.getAllActions(),
      {
        extension,
        objectMetadata: undefined,
        behaviorMetadata: undefined,
      }
    );
    allInstructions = [
      ...allInstructions,
      ...filterInstructionsToRemove(
        extensionFreeInstructions,
        freeInstructionsToRemove[extensionName]
      ),
    ];

    //Objects instructions:
    for (let j = 0; j < allObjectsTypes.size(); ++j) {
      const objectType = allObjectsTypes.at(j);
      const objectMetadata = extension.getObjectMetadata(objectType);
      const scope = { extension, objectMetadata };
      allInstructions = [
        ...allInstructions,
        ...enumerateExtensionInstructions(
          prefix,
          isCondition
            ? extension.getAllConditionsForObject(objectType)
            : extension.getAllActionsForObject(objectType),
          scope
        ),
        ...enumerateExtraObjectInstructions(
          isCondition,
          extension,
          objectType,
          prefix,
          scope
        ),
      ];
    }

    //Behaviors instructions:
    for (let j = 0; j < allBehaviorsTypes.size(); ++j) {
      const behaviorType = allBehaviorsTypes.at(j);
      const behaviorMetadata = extension.getBehaviorMetadata(behaviorType);
      const scope = { extension, behaviorMetadata };

      allInstructions = [
        ...allInstructions,
        ...enumerateExtensionInstructions(
          prefix,
          isCondition
            ? extension.getAllConditionsForBehavior(behaviorType)
            : extension.getAllActionsForBehavior(behaviorType),
          scope
        ),
        ...enumerateExtraBehaviorInstructions(
          isCondition,
          extension,
          behaviorType,
          prefix,
          scope
        ),
      ];
    }
  }

  return allInstructions;
};

const orderFirstInstructionsWithoutGroup = (
  allInstructions: Array<EnumeratedInstructionMetadata>
) => {
  const noGroupInstructions = allInstructions.filter(
    instructionMetadata => instructionMetadata.fullGroupName.length === 0
  );
  const instructionsWithGroups = allInstructions.filter(
    instructionMetadata => instructionMetadata.fullGroupName.length !== 0
  );

  return [...noGroupInstructions, ...instructionsWithGroups];
};

/**
 * List all the instructions that can be used for the given object,
 * in the given context. This includes instructions for the behaviors
 * attached to the object.
 */
export const enumerateObjectAndBehaviorsInstructions = (
  isCondition: boolean,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  objectName: string
): Array<EnumeratedInstructionMetadata> => {
  let allInstructions = [];

  const objectType: string = gd.getTypeOfObject(
    globalObjectsContainer,
    objectsContainer,
    objectName,
    true
  );
  const objectBehaviorNames: Array<string> = gd
    .getBehaviorsOfObject(
      globalObjectsContainer,
      objectsContainer,
      objectName,
      true
    )
    .toJSArray();
  const objectBehaviorTypes = new Set(
    objectBehaviorNames.map(behaviorName =>
      gd.getTypeOfBehavior(
        globalObjectsContainer,
        objectsContainer,
        behaviorName,
        false
      )
    )
  );
  const baseObjectType = ''; /* An empty string means the base object */

  const allExtensions = gd
    .asPlatform(gd.JsPlatform.get())
    .getAllPlatformExtensions();
  for (let i = 0; i < allExtensions.size(); ++i) {
    const extension = allExtensions.at(i);
    const hasObjectType =
      extension
        .getExtensionObjectsTypes()
        .toJSArray()
        .indexOf(objectType) !== -1;
    const hasBaseObjectType =
      extension
        .getExtensionObjectsTypes()
        .toJSArray()
        .indexOf(baseObjectType) !== -1;
    const behaviorTypes = extension
      .getBehaviorsTypes()
      .toJSArray()
      .filter(behaviorType => objectBehaviorTypes.has(behaviorType));

    if (!hasObjectType && !hasBaseObjectType && behaviorTypes.length === 0) {
      continue;
    }

    const prefix = '';

    //Objects instructions:
    if (objectType !== baseObjectType && hasObjectType) {
      const objectMetadata = extension.getObjectMetadata(objectType);
      const scope = { extension, objectMetadata };

      allInstructions = [
        ...allInstructions,
        ...enumerateExtensionInstructions(
          prefix,
          isCondition
            ? extension.getAllConditionsForObject(objectType)
            : extension.getAllActionsForObject(objectType),
          scope
        ),
        ...enumerateExtraObjectInstructions(
          isCondition,
          extension,
          baseObjectType,
          prefix,
          scope
        ),
      ];
    }

    if (hasBaseObjectType) {
      const objectMetadata = extension.getObjectMetadata(baseObjectType);
      const scope = { extension, objectMetadata };

      allInstructions = [
        ...allInstructions,
        ...enumerateExtensionInstructions(
          prefix,
          isCondition
            ? extension.getAllConditionsForObject(baseObjectType)
            : extension.getAllActionsForObject(baseObjectType),
          scope
        ),
        ...enumerateExtraObjectInstructions(
          isCondition,
          extension,
          baseObjectType,
          prefix,
          scope
        ),
      ];
    }

    //Behaviors instructions (show them at the top of the list):
    // eslint-disable-next-line
    behaviorTypes.forEach(behaviorType => {
      const behaviorMetadata = extension.getBehaviorMetadata(behaviorType);
      const scope = { extension, behaviorMetadata };

      allInstructions = [
        ...enumerateExtensionInstructions(
          prefix,
          isCondition
            ? extension.getAllConditionsForBehavior(behaviorType)
            : extension.getAllActionsForBehavior(behaviorType),
          scope
        ),
        ...enumerateExtraBehaviorInstructions(
          isCondition,
          extension,
          behaviorType,
          prefix,
          scope
        ),
        ...allInstructions,
      ];
    });
  }

  return orderFirstInstructionsWithoutGroup(allInstructions);
};

/**
 * Enumerate all the instructions that are not directly tied
 * to an object.
 */
export const enumerateFreeInstructions = (
  isCondition: boolean
): Array<EnumeratedInstructionMetadata> => {
  let allFreeInstructions = [];

  const allExtensions = gd
    .asPlatform(gd.JsPlatform.get())
    .getAllPlatformExtensions();
  for (let i = 0; i < allExtensions.size(); ++i) {
    const extension = allExtensions.at(i);
    const extensionName: string = extension.getName();
    const prefix = getExtensionPrefix(extension);

    //Free instructions
    const extensionFreeInstructions = enumerateExtensionInstructions(
      prefix,
      isCondition ? extension.getAllConditions() : extension.getAllActions(),
      {
        extension,
        objectMetadata: undefined,
        behaviorMetadata: undefined,
      }
    );
    allFreeInstructions = [
      ...allFreeInstructions,
      ...filterInstructionsToRemove(
        extensionFreeInstructions,
        freeInstructionsToRemove[extensionName]
      ),
    ];
  }

  return allFreeInstructions;
};

export type InstructionFilteringOptions = {|
  searchText: string,
|};

export const filterInstructionsList = <
  T: EnumeratedInstructionOrExpressionMetadata
>(
  list: Array<T>,
  { searchText }: InstructionFilteringOptions
): Array<T> => {
  if (!searchText) {
    return list;
  }

  const directMatches = [];
  const fuzzyMatches = [];
  const lowercaseSearch = searchText.toLowerCase();

  list.forEach(option => {
    const lowerCaseDisplayedName = option.displayedName.toLowerCase();
    const lowerCaseFullGroupName = option.fullGroupName.toLowerCase();
    // favor direct matches first
    if (lowerCaseDisplayedName.includes(lowercaseSearch)) {
      return directMatches.push(option);
    }
    // then add fuzzy matches
    if (
      fuzzyOrEmptyFilter(lowercaseSearch, lowerCaseDisplayedName) ||
      fuzzyOrEmptyFilter(lowercaseSearch, lowerCaseFullGroupName)
    ) {
      return fuzzyMatches.push(option);
    }
  });

  return [...directMatches, ...fuzzyMatches];
};

export const getObjectParameterIndex = (
  instructionMetadata: gdInstructionMetadata
) => {
  const parametersCount = instructionMetadata.getParametersCount();
  if (parametersCount >= 1) {
    const firstParameterType = instructionMetadata.getParameter(0).getType();
    if (firstParameterType === 'object') {
      // By convention, all object conditions/actions have the object as first parameter
      return 0;
    }
    if (gd.ParameterMetadata.isObject(firstParameterType)) {
      // Some "free condition/actions" might be considered as "object" instructions, in which
      // case they are taking an object list as fist parameter - which will be identified
      // by gd.ParameterMetadata.isObject
      return 0;
    }

    if (
      firstParameterType === 'objectsContext' ||
      firstParameterType === 'currentScene'
    ) {
      if (parametersCount >= 2) {
        const secondParameterType = instructionMetadata
          .getParameter(1)
          .getType();
        if (gd.ParameterMetadata.isObject(secondParameterType)) {
          // Some special action/conditions like "Create", "AjoutHasard" (pick random object) or
          // "AjoutObjConcern" (pick all objects) are "free condition/actions", but are manipulating
          // objects list, so their first parameter is an "objectsContext" or "currentScene",
          // followed by an object parameter.
          return 1;
        }
      }
    }
  }

  return -1;
};
