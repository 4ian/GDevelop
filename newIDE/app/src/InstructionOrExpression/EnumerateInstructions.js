// @flow
import { type I18n as I18nType } from '@lingui/core';
import {
  type EnumeratedInstructionMetadata,
  type InstructionOrExpressionScope,
} from './EnumeratedInstructionOrExpressionMetadata';
import { translateExtensionCategory } from '../Utils/Extension/ExtensionCategories.js';

const gd: libGDevelop = global.gd;

const GROUP_DELIMITER = '/';

const freeInstructionsToKeep = {
  BuiltinObject: [
    // Note: even if "Create" was added to the object actions for convenience,
    // we also keep it in the list of free actions.
    'Create',
    'CreateByName',
  ],
  BuiltinCamera: ['CentreCamera'],
  Scene3D: ['Scene3D::TurnCameraTowardObject'],
};

const isObjectInstruction = (
  instructionMetadata: gdInstructionMetadata,
  objectType?: string
): boolean => {
  let firstParameterIndex = -1;
  for (
    let index = 0;
    index < instructionMetadata.getParametersCount();
    index++
  ) {
    const parameter = instructionMetadata.getParameter(index);
    if (!parameter.isCodeOnly()) {
      firstParameterIndex = index;
      break;
    }
  }
  if (firstParameterIndex === -1) {
    return false;
  }
  const firstParameter = instructionMetadata.getParameter(firstParameterIndex);
  if (!gd.ParameterMetadata.isObject(firstParameter.getType())) {
    return false;
  }
  if (
    objectType &&
    firstParameter.getExtraInfo() !== '' &&
    firstParameter.getExtraInfo() !== objectType
  ) {
    return false;
  }
  if (firstParameterIndex === instructionMetadata.getParametersCount() - 1) {
    return true;
  }
  const secondParameter = instructionMetadata.getParameter(
    firstParameterIndex + 1
  );
  return !gd.ParameterMetadata.isBehavior(secondParameter.getType());
};

const isBehaviorInstruction = (
  instructionMetadata: gdInstructionMetadata,
  behaviorType: string
): boolean => {
  let firstParameterIndex = -1;
  for (
    let index = 0;
    index < instructionMetadata.getParametersCount();
    index++
  ) {
    const parameter = instructionMetadata.getParameter(index);
    if (!parameter.isCodeOnly()) {
      firstParameterIndex = index;
      break;
    }
  }
  if (firstParameterIndex === -1) {
    return false;
  }
  const firstParameter = instructionMetadata.getParameter(firstParameterIndex);
  if (!gd.ParameterMetadata.isObject(firstParameter.getType())) {
    return false;
  }
  if (firstParameterIndex === instructionMetadata.getParametersCount() - 1) {
    return false;
  }
  const secondParameter = instructionMetadata.getParameter(
    firstParameterIndex + 1
  );
  return (
    gd.ParameterMetadata.isBehavior(secondParameter.getType()) &&
    (!behaviorType || secondParameter.getExtraInfo() === behaviorType)
  );
};

export const getExtensionPrefix = (extension: gdPlatformExtension): string => {
  return extension.getCategory() + GROUP_DELIMITER + extension.getFullName();
};

const getExtensionTranslatedPrefix = (
  extension: gdPlatformExtension,
  i18n: I18nType
): string => {
  return (
    translateExtensionCategory(extension.getCategory(), i18n) +
    GROUP_DELIMITER +
    extension.getFullName()
  );
};

const enumerateExtraBehaviorInstructions = (
  isCondition: boolean,
  extension: gdPlatformExtension,
  behaviorType: string,
  prefix: string,
  scope: InstructionOrExpressionScope
): Array<EnumeratedInstructionMetadata> => {
  const instructions = isCondition
    ? extension.getAllConditions()
    : extension.getAllActions();

  // Get the map containing the metadata of the instructions provided by the extension...
  const instructionsTypes = instructions.keys();
  const allInstructions = [];

  //... and add each instruction
  for (let j = 0; j < instructionsTypes.size(); ++j) {
    const type = instructionsTypes.at(j);
    const instrMetadata = instructions.get(type);
    if (
      !instrMetadata.isHidden() &&
      isBehaviorInstruction(instrMetadata, behaviorType)
    ) {
      allInstructions.push(
        enumerateInstruction(prefix, type, instrMetadata, scope)
      );
    }
  }
  return allInstructions;
};

const enumerateExtraObjectInstructions = (
  isCondition: boolean,
  extension: gdPlatformExtension,
  objectType: string,
  scope: InstructionOrExpressionScope
): Array<EnumeratedInstructionMetadata> => {
  const instructions = isCondition
    ? extension.getAllConditions()
    : extension.getAllActions();

  // Get the map containing the metadata of the instructions provided by the extension...
  const instructionsTypes = instructions.keys();
  const allInstructions = [];

  //... and add each instruction
  for (let j = 0; j < instructionsTypes.size(); ++j) {
    const type = instructionsTypes.at(j);
    const instrMetadata = instructions.get(type);
    if (
      !instrMetadata.isHidden() &&
      isObjectInstruction(instrMetadata, objectType)
    ) {
      allInstructions.push(
        enumerateInstruction('', type, instrMetadata, scope)
      );
    }
  }
  return allInstructions;
};

const enumerateFreeInstructionsWithoutExtra = (
  isCondition: boolean,
  extension: gdPlatformExtension,
  prefix: string,
  scope: InstructionOrExpressionScope
): Array<EnumeratedInstructionMetadata> => {
  const instructions = isCondition
    ? extension.getAllConditions()
    : extension.getAllActions();

  const extensionInstructionsToKeep =
    freeInstructionsToKeep[extension.getName()];

  // Get the map containing the metadata of the instructions provided by the extension...
  const instructionsTypes = instructions.keys();
  const allInstructions = [];

  //... and add each instruction
  for (let j = 0; j < instructionsTypes.size(); ++j) {
    const type = instructionsTypes.at(j);
    const instrMetadata = instructions.get(type);

    if (
      !instrMetadata.isHidden() &&
      ((extensionInstructionsToKeep &&
        extensionInstructionsToKeep.indexOf(type) !== -1) ||
        // Exclude instructions that are moved to the object instructions list.
        (!isObjectInstruction(instrMetadata) &&
          !isBehaviorInstruction(instrMetadata)))
    ) {
      const shortenPrefix = prefix.endsWith(instrMetadata.getGroup())
        ? prefix.substring(0, prefix.length - instrMetadata.getGroup().length)
        : prefix;
      allInstructions.push(
        enumerateInstruction(shortenPrefix, type, instrMetadata, scope)
      );
    }
  }
  return allInstructions;
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
  const fullGroupName = [prefix, groupName]
    .filter(Boolean)
    .join(GROUP_DELIMITER);

  return {
    type,
    metadata: instrMetadata,
    iconFilename,
    displayedName,
    fullGroupName,
    scope,
    isPrivate: instrMetadata.isPrivate(),
    isRelevantForLayoutEvents: instrMetadata.isRelevantForLayoutEvents(),
    isRelevantForFunctionEvents: instrMetadata.isRelevantForFunctionEvents(),
    isRelevantForAsynchronousFunctionEvents: instrMetadata.isRelevantForAsynchronousFunctionEvents(),
    isRelevantForCustomObjectEvents: instrMetadata.isRelevantForCustomObjectEvents(),
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
    allInstructions = [...allInstructions, ...extensionFreeInstructions];

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
  let allInstructions: Array<EnumeratedInstructionMetadata> = [];

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

  // Enumerate instructions of the object.
  const extensionAndObjectMetadata = gd.MetadataProvider.getExtensionAndObjectMetadata(
    gd.JsPlatform.get(),
    objectType
  );
  const extension = extensionAndObjectMetadata.getExtension();
  const objectMetadata = extensionAndObjectMetadata.getMetadata();
  const scope = { extension, objectMetadata };
  const prefix = '';

  allInstructions = [
    ...allInstructions,
    ...enumerateExtensionInstructions(
      prefix,
      isCondition
        ? extension.getAllConditionsForObject(objectType)
        : extension.getAllActionsForObject(objectType),
      scope
    ),
  ];

  // Free object instructions:
  const allExtensions = gd
    .asPlatform(gd.JsPlatform.get())
    .getAllPlatformExtensions();
  for (let i = 0; i < allExtensions.size(); ++i) {
    const extension = allExtensions.at(i);

    allInstructions = [
      ...allInstructions,
      ...enumerateExtraObjectInstructions(
        isCondition,
        extension,
        objectType,
        scope
      ),
    ];
  }

  // Enumerate instructions of the base object that the object "inherits" from.
  const baseObjectType = ''; /* An empty string means the base object */
  if (objectType !== baseObjectType) {
    const baseExtensionAndObjectMetadata = gd.MetadataProvider.getExtensionAndObjectMetadata(
      gd.JsPlatform.get(),
      baseObjectType
    );
    const baseObjectExtension = baseExtensionAndObjectMetadata.getExtension();

    allInstructions = [
      ...allInstructions,
      ...enumerateExtensionInstructions(
        prefix,
        isCondition
          ? baseObjectExtension.getAllConditionsForObject(baseObjectType)
          : baseObjectExtension.getAllActionsForObject(baseObjectType),
        scope
      ),
      ...enumerateExtraObjectInstructions(
        isCondition,
        baseObjectExtension,
        baseObjectType,
        scope
      ),
    ];
  }

  // Enumerate behaviors instructions.
  for (let i = 0; i < allExtensions.size(); ++i) {
    const extension = allExtensions.at(i);
    const behaviorTypes = extension
      .getBehaviorsTypes()
      .toJSArray()
      .filter(behaviorType => objectBehaviorTypes.has(behaviorType));

    // eslint-disable-next-line
    behaviorTypes.forEach(behaviorType => {
      const behaviorMetadata = extension.getBehaviorMetadata(behaviorType);
      const scope = { extension, behaviorMetadata };

      // Free functions can require a behavior even if this behavior is from
      // another extension.
      const freeBehaviorInstructions: Array<EnumeratedInstructionMetadata> = [];
      for (let i = 0; i < allExtensions.size(); ++i) {
        const extension = allExtensions.at(i);
        freeBehaviorInstructions.push.apply(
          freeBehaviorInstructions,
          enumerateExtraBehaviorInstructions(
            isCondition,
            extension,
            behaviorType,
            prefix,
            scope
          )
        );
      }

      // Show them at the top of the list.
      allInstructions = [
        ...enumerateExtensionInstructions(
          prefix,
          isCondition
            ? extension.getAllConditionsForBehavior(behaviorType)
            : extension.getAllActionsForBehavior(behaviorType),
          scope
        ),
        ...freeBehaviorInstructions,
        ...allInstructions,
      ];
    });
  }

  // 'CreateByName' action only makes sense for groups.
  if (
    !globalObjectsContainer.getObjectGroups().has(objectName) &&
    !objectsContainer.getObjectGroups().has(objectName)
  ) {
    allInstructions = allInstructions.filter(
      instruction => instruction.type !== 'CreateByName'
    );
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
  return doEnumerateFreeInstructions(isCondition, getExtensionPrefix);
};

/**
 * Enumerate all the instructions that are not directly tied
 * to an object.
 */
export const enumerateFreeInstructionsWithTranslatedCategories = (
  isCondition: boolean,
  i18n: I18nType
): Array<EnumeratedInstructionMetadata> => {
  return doEnumerateFreeInstructions(isCondition, extension =>
    getExtensionTranslatedPrefix(extension, i18n)
  );
};

/**
 * Enumerate all the instructions that are not directly tied
 * to an object.
 */
const doEnumerateFreeInstructions = (
  isCondition: boolean,
  getExtensionPrefix: (extension: gdPlatformExtension) => string
): Array<EnumeratedInstructionMetadata> => {
  let allFreeInstructions = [];

  const allExtensions = gd
    .asPlatform(gd.JsPlatform.get())
    .getAllPlatformExtensions();
  for (let i = 0; i < allExtensions.size(); ++i) {
    const extension = allExtensions.at(i);
    const prefix = getExtensionPrefix(extension);

    allFreeInstructions.push.apply(
      allFreeInstructions,
      enumerateFreeInstructionsWithoutExtra(isCondition, extension, prefix, {
        extension,
        objectMetadata: undefined,
        behaviorMetadata: undefined,
      })
    );
  }
  return allFreeInstructions;
};

export type InstructionFilteringOptions = {|
  searchText: string,
|};

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
