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
  var instructionsTypes = instructions.keys();
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
      var objectMetadata = extension.getObjectMetadata(objectType);
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
