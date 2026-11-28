// @flow
import { type I18n as I18nType } from '@lingui/core';
import {
  type EnumeratedInstructionMetadata,
  type InstructionOrExpressionScope,
} from './EnumeratedInstructionOrExpressionMetadata';
import { translateExtensionCategory } from '../Utils/Extension/ExtensionCategories';
import { shouldHideExtension } from '../Version';

const gd: libGDevelop = global.gd;

const GROUP_DELIMITER = ' ❯ ';

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

/**
 * Check if the instruction can be use according to an object and its behaviors.
 * @param instructionMetadata The instruction being checked
 * @param objectType The object type
 * @param objectBehaviorTypes The object behaviors
 */
const isObjectInstruction = (
  instructionMetadata: gdInstructionMetadata,
  objectType?: string,
  objectBehaviorTypes?: Set<string>
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

  if (!objectBehaviorTypes) {
    // The object is matching and behaviors are not checked.
    return true;
  }
  for (
    let parameterIndex = firstParameterIndex + 1;
    parameterIndex < instructionMetadata.getParametersCount();
    parameterIndex++
  ) {
    const parameter = instructionMetadata.getParameter(parameterIndex);
    if (!gd.ParameterMetadata.isBehavior(parameter.getType())) {
      // No more behavior parameter to check.
      // The instruction can be used with the object.
      return true;
    }
    if (
      parameter.getExtraInfo() !== '' &&
      !objectBehaviorTypes.has(parameter.getExtraInfo())
    ) {
      return false;
    }
  }
  return true;
};

const isBehaviorInstruction = (
  instructionMetadata: gdInstructionMetadata,
  behaviorType?: string
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

export const getExtensionPrefix = (
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
  scope: InstructionOrExpressionScope,
  project: gdProject,
  i18n: I18nType
): Array<EnumeratedInstructionMetadata> => {
  if (shouldHideExtension(project, extension)) {
    return [];
  }
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
        enumerateInstruction(prefix, type, instrMetadata, scope, i18n)
      );
    }
  }
  return allInstructions;
};

/**
 * Enumerate free instructions that start with an object parameter.
 */
const enumerateExtraObjectInstructions = (
  isCondition: boolean,
  extension: gdPlatformExtension,
  objectType: string,
  objectBehaviorTypes?: Set<string>,
  scope: InstructionOrExpressionScope,
  project: gdProject,
  i18n: I18nType
): Array<EnumeratedInstructionMetadata> => {
  if (shouldHideExtension(project, extension)) {
    return [];
  }

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
      isObjectInstruction(instrMetadata, objectType, objectBehaviorTypes)
    ) {
      allInstructions.push(
        enumerateInstruction('', type, instrMetadata, scope, i18n)
      );
    }
  }
  return allInstructions;
};

/**
 * Enumerate free instructions excluding the instructions that have been moved to
 * the object instructions list unless they are in `freeInstructionsToKeep`.
 */
const enumerateFreeInstructionsWithoutExtra = (
  isCondition: boolean,
  extension: gdPlatformExtension,
  scope: InstructionOrExpressionScope,
  project: gdProject,
  i18n: I18nType
): Array<EnumeratedInstructionMetadata> => {
  if (shouldHideExtension(project, extension)) {
    return [];
  }
  const instructions = isCondition
    ? extension.getAllConditions()
    : extension.getAllActions();
  const prefix = getExtensionPrefix(extension, i18n);
  const extensionInstructionsToKeep =
    // $FlowFixMe[invalid-computed-prop]
    freeInstructionsToKeep[extension.getName()];

  // Get the map containing the metadata of the instructions provided by the extension...
  const instructionsTypes = instructions.keys();
  const allInstructions = [];

  //... and add each instruction
  for (let j = 0; j < instructionsTypes.size(); ++j) {
    const type = instructionsTypes.at(j);
    const instrMetadata = instructions.get(type);

    // Instructions that are merged together are hidden
    // apart from the one that represent them all.
    const unifiedInstructionType = gd.VariableInstructionSwitcher.getSwitchableVariableInstructionIdentifier(
      type
    );
    if (unifiedInstructionType.length > 0 && unifiedInstructionType !== type) {
      continue;
    }

    const isWhiteListed =
      extensionInstructionsToKeep &&
      extensionInstructionsToKeep.indexOf(type) !== -1;
    if (
      !instrMetadata.isHidden() &&
      (isWhiteListed ||
        // Exclude instructions that are moved to the object instructions list.
        (!isObjectInstruction(instrMetadata) &&
          !isBehaviorInstruction(instrMetadata)))
    ) {
      allInstructions.push(
        enumerateInstruction(
          prefix,
          type,
          instrMetadata,
          scope,
          i18n,
          /* ignoresGroups */ isWhiteListed
        )
      );
    }
  }
  return allInstructions;
};

const enumerateInstruction = (
  prefix: string,
  type: string,
  instrMetadata: gdInstructionMetadata,
  scope: InstructionOrExpressionScope,
  i18n: I18nType,
  ignoresGroups?: boolean = false
): EnumeratedInstructionMetadata => {
  const displayedName = instrMetadata.getFullName();
  let description = instrMetadata.getDescription();
  if (description.length > 140) {
    const spaceIndex = description.indexOf(' ', 140);
    if (spaceIndex >= 0) {
      description = description.substring(0, spaceIndex);
    }
  }
  const groupName = i18n
    ? i18n._(instrMetadata.getGroup())
    : instrMetadata.getGroup();
  const iconFilename = instrMetadata.getIconFilename();
  const fullGroupName = ignoresGroups
    ? prefix
    : [prefix, groupName].filter(Boolean).join(GROUP_DELIMITER);

  return {
    type,
    metadata: instrMetadata,
    iconFilename,
    displayedName,
    description,
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
  scope: InstructionOrExpressionScope,
  i18n: I18nType,
  objectType?: string,
  objectBehaviorTypes?: Set<string>
): Array<EnumeratedInstructionMetadata> => {
  //Get the map containing the metadata of the instructions provided by the extension...
  const instructionsTypes = instructions.keys();
  const allInstructions = [];

  //... and add each instruction
  for (let j = 0; j < instructionsTypes.size(); ++j) {
    const type = instructionsTypes.at(j);

    // Instructions that are merged together are hidden
    // apart from the one that represent them all.
    const unifiedInstructionType = gd.VariableInstructionSwitcher.getSwitchableVariableInstructionIdentifier(
      type
    );
    if (unifiedInstructionType.length > 0 && unifiedInstructionType !== type) {
      continue;
    }

    const instrMetadata = instructions.get(type);
    if (
      !instrMetadata.isHidden() &&
      (!objectType ||
        isObjectInstruction(instrMetadata, objectType, objectBehaviorTypes))
    ) {
      allInstructions.push(
        enumerateInstruction(prefix, type, instrMetadata, scope, i18n)
      );
    }
  }

  return allInstructions;
};

/**
 * List all the instructions available.
 */
export const enumerateAllInstructions = (
  isCondition: boolean,
  project: gdProject,
  i18n: I18nType
): Array<EnumeratedInstructionMetadata> => {
  let allInstructions: Array<EnumeratedInstructionMetadata> = [];

  const allExtensions = gd
    .asPlatform(gd.JsPlatform.get())
    .getAllPlatformExtensions();
  for (let i = 0; i < allExtensions.size(); ++i) {
    const extension = allExtensions.at(i);
    if (shouldHideExtension(project, extension)) {
      continue;
    }
    const allObjectsTypes = extension.getExtensionObjectsTypes();
    const allBehaviorsTypes = extension.getBehaviorsTypes();
    const prefix = getExtensionPrefix(extension, i18n);

    //Free instructions
    const extensionFreeInstructions = enumerateExtensionInstructions(
      prefix,
      isCondition ? extension.getAllConditions() : extension.getAllActions(),
      {
        extension: { name: extension.getName() },
        objectMetadata: undefined,
        behaviorMetadata: undefined,
      },
      i18n
    );
    allInstructions = [...allInstructions, ...extensionFreeInstructions];

    //Objects instructions:
    for (let j = 0; j < allObjectsTypes.size(); ++j) {
      const objectType = allObjectsTypes.at(j);
      const objectMetadata = extension.getObjectMetadata(objectType);
      const scope: InstructionOrExpressionScope = {
        extension: { name: extension.getName() },
        objectMetadata: {
          name: objectMetadata.getName(),
          isPrivate: objectMetadata.isPrivate(),
        },
      };
      allInstructions = [
        ...allInstructions,
        ...enumerateExtensionInstructions(
          prefix,
          isCondition
            ? extension.getAllConditionsForObject(objectType)
            : extension.getAllActionsForObject(objectType),
          scope,
          i18n
        ),
      ];
    }

    //Behaviors instructions:
    for (let j = 0; j < allBehaviorsTypes.size(); ++j) {
      const behaviorType = allBehaviorsTypes.at(j);
      const behaviorMetadata = extension.getBehaviorMetadata(behaviorType);
      const scope = {
        extension: { name: extension.getName() },
        behaviorMetadata: {
          name: behaviorMetadata.getName(),
          isPrivate: behaviorMetadata.isPrivate(),
        },
      };

      allInstructions = [
        ...allInstructions,
        ...enumerateExtensionInstructions(
          prefix,
          isCondition
            ? extension.getAllConditionsForBehavior(behaviorType)
            : extension.getAllActionsForBehavior(behaviorType),
          // $FlowFixMe[incompatible-type]
          scope,
          i18n
        ),
      ];
    }
  }

  // $FlowFixMe[incompatible-type]
  return allInstructions;
};

/**
 * How the groups of a section of the object instructions list are ordered.
 * - `declared`: in the order the instructions are given (for events-based
 *   objects and behaviors, this is the order of their functions, chosen by
 *   the extension author).
 * - `specificFirst`: the groups that are specific to the object or behavior
 *   first, then the groups shared with all objects in the usual order.
 * - `usual`: the groups shared with all objects in the usual order, then the
 *   other ones.
 */
type GroupsOrder = 'declared' | 'specificFirst' | 'usual';

type InstructionsSection = {|
  instructions: Array<EnumeratedInstructionMetadata>,
  groupsOrder: GroupsOrder,
|};

/**
 * The groups of the instructions that can be used with any object, from the
 * most commonly used and high level ones to the most specialized ones.
 */
const getUsualObjectGroups = (i18n: I18nType): Array<string> =>
  [
    'Animations and images',
    'Text',
    'Objects',
    'Position',
    'Angle',
    'Size',
    'Visibility',
    'Effects',
    'Collision',
    'Mouse and touch',
    'Variables',
    'Timers',
    'Layers and cameras',
    'Layer',
    'Movement using forces',
    'Behaviors',
  ].map(groupName => (i18n ? i18n._(groupName) : groupName));

const getTopLevelGroupName = (
  instruction: EnumeratedInstructionMetadata
): string => instruction.fullGroupName.split(GROUP_DELIMITER)[0];

const getGroupRankInSection = (
  groupName: string,
  groupsOrder: GroupsOrder,
  usualObjectGroups: Array<string>
): number => {
  if (groupsOrder === 'declared') return 0;

  const usualIndex = usualObjectGroups.indexOf(groupName);
  if (groupsOrder === 'specificFirst') return usualIndex;
  return usualIndex === -1 ? usualObjectGroups.length : usualIndex;
};

/**
 * Order the instructions so that their groups come section by section (a group
 * found in several sections is shown in the first one), and are sorted inside
 * a section according to its `groupsOrder`. Instructions without a group
 * always come first.
 */
const sortInstructionsBySectionsAndGroups = (
  sections: Array<InstructionsSection>,
  i18n: I18nType
): Array<EnumeratedInstructionMetadata> => {
  const usualObjectGroups = getUsualObjectGroups(i18n);
  const groupSortKeys: Map<string, Array<number>> = new Map();
  const addGroupSortKeys = (isPrivate: boolean) => {
    sections.forEach(({ instructions, groupsOrder }, sectionIndex) => {
      instructions.forEach(instruction => {
        if (instruction.isPrivate !== isPrivate) return;
        const groupName = getTopLevelGroupName(instruction);
        if (groupSortKeys.has(groupName)) return;

        groupSortKeys.set(
          groupName,
          groupName === ''
            ? [-1, 0, 0]
            : [
                sectionIndex,
                getGroupRankInSection(
                  groupName,
                  groupsOrder,
                  usualObjectGroups
                ),
                groupSortKeys.size,
              ]
        );
      });
    });
  };
  // Private instructions are only visible inside their extension: they must
  // not move a group that is otherwise made of public instructions.
  addGroupSortKeys(false);
  addGroupSortKeys(true);

  const compareGroups = (groupA: string, groupB: string): number => {
    const sortKeyA = groupSortKeys.get(groupA) || [];
    const sortKeyB = groupSortKeys.get(groupB) || [];
    for (let index = 0; index < sortKeyA.length; index++) {
      if (sortKeyA[index] !== sortKeyB[index])
        return sortKeyA[index] - sortKeyB[index];
    }
    return 0;
  };

  // The sort is stable: inside a group, instructions keep the sections order.
  return sections
    .flatMap(({ instructions }) => instructions)
    .sort((instructionA, instructionB) =>
      compareGroups(
        getTopLevelGroupName(instructionA),
        getTopLevelGroupName(instructionB)
      )
    );
};

const putInGroupIfWithoutGroup = (
  instructions: Array<EnumeratedInstructionMetadata>,
  groupName: string
): Array<EnumeratedInstructionMetadata> =>
  instructions.map(instruction =>
    instruction.fullGroupName
      ? instruction
      : { ...instruction, fullGroupName: groupName }
  );

/**
 * Sort the instructions of an events-based object or behavior in the order of
 * the functions declared by the extension author.
 * Instructions not generated from a function (like the ones for properties)
 * are put at the end.
 */
const sortByEventsFunctionsOrder = (
  instructions: Array<EnumeratedInstructionMetadata>,
  eventsFunctionsContainer: gdEventsFunctionsContainer
): Array<EnumeratedInstructionMetadata> => {
  const getEventsFunctionPosition = (functionName: string): number =>
    eventsFunctionsContainer.hasEventsFunctionNamed(functionName)
      ? eventsFunctionsContainer.getEventsFunctionPosition(
          eventsFunctionsContainer.getEventsFunction(functionName)
        )
      : -1;
  const getInstructionPosition = (
    instruction: EnumeratedInstructionMetadata
  ): number => {
    const instructionName = instruction.type.split('::').pop() || '';
    const position = getEventsFunctionPosition(instructionName);
    if (position !== -1) return position;

    // Actions of expression-and-condition functions are named "Set" + the
    // function name.
    if (instructionName.startsWith('Set')) {
      const getterPosition = getEventsFunctionPosition(
        instructionName.substring(3)
      );
      if (getterPosition !== -1) return getterPosition;
    }
    return Number.MAX_SAFE_INTEGER;
  };

  return [...instructions].sort(
    (instructionA, instructionB) =>
      getInstructionPosition(instructionA) -
      getInstructionPosition(instructionB)
  );
};

const enumerateBehaviorInstructions = (
  isCondition: boolean,
  behaviorType: string,
  objectType: string,
  objectBehaviorTypes: Set<string>,
  project: gdProject,
  i18n: I18nType
): Array<EnumeratedInstructionMetadata> => {
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
  const prefix = '';

  const behaviorInstructions = enumerateExtensionInstructions(
    prefix,
    isCondition
      ? extension.getAllConditionsForBehavior(behaviorType)
      : extension.getAllActionsForBehavior(behaviorType),
    // $FlowFixMe[incompatible-type]
    scope,
    i18n,
    // Allow behaviors to have some of their instruction to be restricted
    // to some type of object.
    objectType,
    objectBehaviorTypes
  );

  // Free functions can require a behavior even if this behavior is from
  // another extension.
  const freeBehaviorInstructions: Array<EnumeratedInstructionMetadata> = [];
  const allExtensions = gd
    .asPlatform(gd.JsPlatform.get())
    .getAllPlatformExtensions();
  for (let i = 0; i < allExtensions.size(); ++i) {
    const extension = allExtensions.at(i);
    if (shouldHideExtension(project, extension)) {
      continue;
    }

    freeBehaviorInstructions.push(
      ...enumerateExtraBehaviorInstructions(
        isCondition,
        extension,
        behaviorType,
        prefix,
        // $FlowFixMe[incompatible-type]
        scope,
        project,
        i18n
      )
    );
  }

  return [
    ...(project.hasEventsBasedBehavior(behaviorType)
      ? sortByEventsFunctionsOrder(
          behaviorInstructions,
          project.getEventsBasedBehavior(behaviorType).getEventsFunctions()
        )
      : behaviorInstructions),
    ...freeBehaviorInstructions,
  ];
};

/**
 * List all the instructions that can be used for the given object,
 * in the given context. This includes instructions for the behaviors
 * attached to the object.
 *
 * Instructions are ordered from the most specific to the most generic:
 * - the instructions of the object itself,
 * - the instructions of the behaviors added to the object,
 * - the instructions that can be used with any object (including the ones of
 *   the default behaviors, the "capabilities", of the object),
 * - the instructions from other extensions that can be used with any object.
 */
export const enumerateObjectAndBehaviorsInstructions = (
  isCondition: boolean,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  objectName: string,
  project: gdProject,
  i18n: I18nType
): Array<EnumeratedInstructionMetadata> => {
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
  const getBehaviorType = (behaviorName: string): string =>
    gd.getTypeOfBehavior(
      globalObjectsContainer,
      objectsContainer,
      behaviorName,
      false
    );
  const objectBehaviorTypes = new Set(objectBehaviorNames.map(getBehaviorType));
  const isDefaultBehavior = (behaviorName: string): boolean =>
    gd.hasDefaultBehavior(
      globalObjectsContainer,
      objectsContainer,
      objectName,
      behaviorName,
      true
    );
  const addedBehaviorTypes = new Set(
    objectBehaviorNames
      .filter(behaviorName => !isDefaultBehavior(behaviorName))
      .map(getBehaviorType)
  );
  const defaultBehaviorTypes = new Set(
    objectBehaviorNames
      .filter(behaviorName => isDefaultBehavior(behaviorName))
      .map(getBehaviorType)
  );

  // Enumerate instructions of the object.
  const extensionAndObjectMetadata = gd.MetadataProvider.getExtensionAndObjectMetadata(
    gd.JsPlatform.get(),
    objectType
  );
  const objectExtension = extensionAndObjectMetadata.getExtension();
  const objectMetadata = extensionAndObjectMetadata.getMetadata();
  const scope = {
    extension: { name: objectExtension.getName() },
    objectMetadata: {
      name: objectMetadata.getName(),
      isPrivate: objectMetadata.isPrivate(),
    },
  };
  const prefix = '';

  const ownObjectInstructions = enumerateExtensionInstructions(
    prefix,
    isCondition
      ? objectExtension.getAllConditionsForObject(objectType)
      : objectExtension.getAllActionsForObject(objectType),
    // $FlowFixMe[incompatible-type]
    scope,
    i18n
  );
  const isEventsBasedObject = project.hasEventsBasedObject(objectType);

  // Enumerate instructions of the base object that the object "inherits" from.
  const baseObjectType = ''; /* An empty string means the base object */
  let baseObjectInstructions: Array<EnumeratedInstructionMetadata> = [];
  if (objectType !== baseObjectType) {
    const baseExtensionAndObjectMetadata = gd.MetadataProvider.getExtensionAndObjectMetadata(
      gd.JsPlatform.get(),
      baseObjectType
    );
    const baseObjectExtension = baseExtensionAndObjectMetadata.getExtension();

    baseObjectInstructions = enumerateExtensionInstructions(
      prefix,
      isCondition
        ? baseObjectExtension.getAllConditionsForObject(baseObjectType)
        : baseObjectExtension.getAllActionsForObject(baseObjectType),
      // $FlowFixMe[incompatible-type]
      scope,
      i18n
    );
  }

  // Free instructions from all extensions that take an object as first parameter.
  const extraObjectInstructions: Array<EnumeratedInstructionMetadata> = [];
  const allExtensions = gd
    .asPlatform(gd.JsPlatform.get())
    .getAllPlatformExtensions();
  for (let i = 0; i < allExtensions.size(); ++i) {
    const extension = allExtensions.at(i);
    const scope = {
      extension: { name: extension.getName() },
      objectMetadata: {
        name: objectMetadata.getName(),
        isPrivate: objectMetadata.isPrivate(),
      },
    };

    extraObjectInstructions.push(
      ...putInGroupIfWithoutGroup(
        enumerateExtraObjectInstructions(
          isCondition,
          extension,
          objectType,
          objectBehaviorTypes,
          // $FlowFixMe[incompatible-type]
          scope,
          project,
          i18n
        ),
        extension.getFullName()
      )
    );
  }

  const enumerateInstructionsOfBehavior = (behaviorType: string) =>
    enumerateBehaviorInstructions(
      isCondition,
      behaviorType,
      objectType,
      objectBehaviorTypes,
      project,
      i18n
    );

  const sections: Array<InstructionsSection> = [
    {
      instructions: isEventsBasedObject
        ? sortByEventsFunctionsOrder(
            ownObjectInstructions,
            project.getEventsBasedObject(objectType).getEventsFunctions()
          )
        : ownObjectInstructions,
      groupsOrder: isEventsBasedObject ? 'declared' : 'specificFirst',
    },
    ...[...addedBehaviorTypes].map(behaviorType => ({
      instructions: putInGroupIfWithoutGroup(
        enumerateInstructionsOfBehavior(behaviorType),
        gd.MetadataProvider.getBehaviorMetadata(
          gd.JsPlatform.get(),
          behaviorType
        ).getFullName()
      ),
      groupsOrder: project.hasEventsBasedBehavior(behaviorType)
        ? 'declared'
        : 'specificFirst',
    })),
    {
      instructions: [
        ...[...defaultBehaviorTypes].flatMap(enumerateInstructionsOfBehavior),
        ...baseObjectInstructions,
        ...extraObjectInstructions,
      ],
      groupsOrder: 'usual',
    },
  ];

  let allInstructions = sortInstructionsBySectionsAndGroups(sections, i18n);

  // 'CreateByName' action only makes sense for groups.
  if (
    !globalObjectsContainer.getObjectGroups().has(objectName) &&
    !objectsContainer.getObjectGroups().has(objectName)
  ) {
    allInstructions = allInstructions.filter(
      instruction => instruction.type !== 'CreateByName'
    );
  }

  return allInstructions;
};

/**
 * Enumerate all the instructions that are not directly tied
 * to an object.
 */
export const enumerateFreeInstructions = (
  isCondition: boolean,
  project: gdProject,
  i18n: I18nType
): Array<EnumeratedInstructionMetadata> => {
  const allFreeInstructions: Array<EnumeratedInstructionMetadata> = [];

  const allExtensions = gd
    .asPlatform(gd.JsPlatform.get())
    .getAllPlatformExtensions();
  for (let i = 0; i < allExtensions.size(); ++i) {
    const extension = allExtensions.at(i);

    allFreeInstructions.push(
      ...enumerateFreeInstructionsWithoutExtra(
        isCondition,
        extension,
        {
          extension: { name: extension.getName() },
          objectMetadata: undefined,
          behaviorMetadata: undefined,
        },
        project,
        i18n
      )
    );
  }
  return allFreeInstructions;
};

export type InstructionFilteringOptions = {|
  searchText: string,
|};

export const getObjectParameterIndex = (
  instructionMetadata: gdInstructionMetadata
): number => {
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
