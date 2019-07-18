// @flow
import {
  type EnumeratedInstructionOrExpressionMetadata,
  type InstructionOrExpressionScope,
} from './EnumeratedInstructionOrExpressionMetadata.js';
const gd = global.gd;

const GROUP_DELIMITER = '/';

const enumerateExtensionInstructions = (
  prefix: string,
  instructions: gdMapStringInstructionMetadata,
  scope: InstructionOrExpressionScope
): Array<EnumeratedInstructionOrExpressionMetadata> => {
  //Get the map containing the metadata of the instructions provided by the extension...
  const instructionsTypes = instructions.keys();
  const allInstructions = [];

  //... and add each instruction
  for (let j = 0; j < instructionsTypes.size(); ++j) {
    const instrMetadata = instructions.get(instructionsTypes.get(j));
    if (instrMetadata.isHidden()) continue;

    const displayedName = instrMetadata.getFullName();
    const groupName = instrMetadata.getGroup();
    const iconFilename = instrMetadata.getIconFilename();
    const fullGroupName = prefix + groupName;

    allInstructions.push({
      type: instructionsTypes.get(j),
      metadata: instrMetadata,
      iconFilename,
      displayedName,
      fullGroupName,
      scope,
      isPrivate: instrMetadata.isPrivate(),
    });
  }

  return allInstructions;
};

export const enumerateInstructions = (
  isCondition: boolean
): Array<EnumeratedInstructionOrExpressionMetadata> => {
  let allInstructions = [];

  const allExtensions = gd
    .asPlatform(gd.JsPlatform.get())
    .getAllPlatformExtensions();
  for (let i = 0; i < allExtensions.size(); ++i) {
    const extension = allExtensions.get(i);
    const allObjectsTypes = extension.getExtensionObjectsTypes();
    const allBehaviorsTypes = extension.getBehaviorsTypes();

    let prefix = '';
    if (allObjectsTypes.size() > 0 || allBehaviorsTypes.size() > 0) {
      prefix =
        extension.getName() === 'BuiltinObject'
          ? 'Common ' +
            (isCondition ? 'conditions' : 'actions') +
            ' for all objects'
          : extension.getFullName();
      prefix += GROUP_DELIMITER;
    }

    //Free instructions
    allInstructions = [
      ...allInstructions,
      ...enumerateExtensionInstructions(
        prefix,
        isCondition ? extension.getAllConditions() : extension.getAllActions(),
        {
          objectMetadata: undefined,
          behaviorMetadata: undefined,
        }
      ),
    ];

    //Objects instructions:
    for (let j = 0; j < allObjectsTypes.size(); ++j) {
      const objectType = allObjectsTypes.get(j);
      const objectMetadata = extension.getObjectMetadata(objectType);
      allInstructions = [
        ...allInstructions,
        ...enumerateExtensionInstructions(
          prefix,
          isCondition
            ? extension.getAllConditionsForObject(objectType)
            : extension.getAllActionsForObject(objectType),
          { objectMetadata }
        ),
      ];
    }

    //Behaviors instructions:
    for (let j = 0; j < allBehaviorsTypes.size(); ++j) {
      const behaviorType = allBehaviorsTypes.get(j);
      const behaviorMetadata = extension.getBehaviorMetadata(behaviorType);
      allInstructions = [
        ...allInstructions,
        ...enumerateExtensionInstructions(
          prefix,
          isCondition
            ? extension.getAllConditionsForBehavior(behaviorType)
            : extension.getAllActionsForBehavior(behaviorType),
          { behaviorMetadata }
        ),
      ];
    }
  }

  return allInstructions;
};

/**
 * List all the instructions that can be used for the given object,
 * in the given context. This includes instructions for the behaviors
 * attached to the object.
 */
export const enumerateObjectInstructions = (
  isCondition: boolean,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  objectName: string
): Array<EnumeratedInstructionOrExpressionMetadata> => {
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
        behaviorName
      )
    )
  );

  const allExtensions = gd
    .asPlatform(gd.JsPlatform.get())
    .getAllPlatformExtensions();
  for (let i = 0; i < allExtensions.size(); ++i) {
    const extension = allExtensions.get(i);
    const hasObjectType =
      extension
        .getExtensionObjectsTypes()
        .toJSArray()
        .indexOf(objectType) !== -1;
    const hasBaseObjectType =
      extension
        .getExtensionObjectsTypes()
        .toJSArray()
        .indexOf('' /* An empty string means the base object */) !== -1;
    const behaviorTypes = extension
      .getBehaviorsTypes()
      .toJSArray()
      .filter(behaviorType => objectBehaviorTypes.has(behaviorType));

    if (!hasObjectType && !hasBaseObjectType && behaviorTypes.length === 0) {
      continue;
    }

    const prefix = '';

    //Objects instructions:
    if (hasObjectType) {
      const objectMetadata = extension.getObjectMetadata(objectType);
      allInstructions = [
        ...allInstructions,
        ...enumerateExtensionInstructions(
          prefix,
          isCondition
            ? extension.getAllConditionsForObject(objectType)
            : extension.getAllActionsForObject(objectType),
          { objectMetadata }
        ),
      ];
    }

    if (hasBaseObjectType) {
      const objectMetadata = extension.getObjectMetadata('');
      allInstructions = [
        ...allInstructions,
        ...enumerateExtensionInstructions(
          prefix,
          isCondition
            ? extension.getAllConditionsForObject(
                '' /* An empty string means the base object */
              )
            : extension.getAllActionsForObject(
                '' /* An empty string means the base object */
              ),
          { objectMetadata }
        ),
      ];
    }

    //Behaviors instructions (show them at the top of the list):
    // eslint-disable-next-line
    behaviorTypes.forEach(behaviorType => {
      const behaviorMetadata = extension.getBehaviorMetadata(behaviorType);
      allInstructions = [
        ...enumerateExtensionInstructions(
          prefix,
          isCondition
            ? extension.getAllConditionsForBehavior(behaviorType)
            : extension.getAllActionsForBehavior(behaviorType),
          { behaviorMetadata }
        ),
        ...allInstructions,
      ];
    });
  }

  return allInstructions;
};

/**
 * Enumerate all the instructions that are not directly tied
 * to an object.
 */
export const enumerateFreeInstructions = (
  isCondition: boolean
): Array<EnumeratedInstructionOrExpressionMetadata> => {
  let allFreeInstructions = [];

  const allExtensions = gd
    .asPlatform(gd.JsPlatform.get())
    .getAllPlatformExtensions();
  for (let i = 0; i < allExtensions.size(); ++i) {
    const extension = allExtensions.get(i);
    const allObjectsTypes = extension.getExtensionObjectsTypes();
    const allBehaviorsTypes = extension.getBehaviorsTypes();

    let prefix = '';
    if (allObjectsTypes.size() > 0 || allBehaviorsTypes.size() > 0) {
      prefix =
        extension.getName() === 'BuiltinObject' ? '' : extension.getFullName();
      prefix += GROUP_DELIMITER;
    }

    //Free instructions
    allFreeInstructions = [
      ...allFreeInstructions,
      ...enumerateExtensionInstructions(
        prefix,
        isCondition ? extension.getAllConditions() : extension.getAllActions(),
        {
          objectMetadata: undefined,
          behaviorMetadata: undefined,
        }
      ),
    ];
  }

  return allFreeInstructions;
};

export type InstructionFilteringOptions = {|
  searchText: string,
|};

// TODO: Move near filterEnumeratedInstructionOrExpressionMetadataByScope?
export const filterInstructionsList = (
  list: Array<EnumeratedInstructionOrExpressionMetadata>,
  { searchText }: InstructionFilteringOptions
): Array<EnumeratedInstructionOrExpressionMetadata> => {
  if (!searchText === '') {
    return list;
  }

  const lowercaseSearch = searchText.toLowerCase();

  const matchCritera = (
    enumeratedInstructionOrExpressionMetadata: EnumeratedInstructionOrExpressionMetadata
  ) => {
    const {
      displayedName,
      fullGroupName,
    } = enumeratedInstructionOrExpressionMetadata;
    return (
      displayedName.toLowerCase().indexOf(lowercaseSearch) !== -1 ||
      fullGroupName.toLowerCase().indexOf(lowercaseSearch) !== -1
    );
  };

  return list.filter(matchCritera);
};
