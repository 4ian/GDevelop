// @flow
import { type InstructionOrExpressionInformation } from './InstructionOrExpressionInformation.flow.js';
const gd = global.gd;

const GROUP_DELIMITER = '/';

const enumerateExtensionInstructions = (
  groupPrefix: string,
  extensionInstructions
) => {
  //Get the map containing the metadata of the instructions provided by the extension...
  var instructionsTypes = extensionInstructions.keys();
  const allInstructions = [];

  //... and add each instruction
  for (let j = 0; j < instructionsTypes.size(); ++j) {
    const instrMetadata = extensionInstructions.get(instructionsTypes.get(j));
    if (instrMetadata.isHidden()) continue;

    const displayedName = instrMetadata.getFullName();
    const groupName = instrMetadata.getGroup();
    const fullGroupName = groupPrefix + groupName;

    allInstructions.push({
      type: instructionsTypes.get(j),
      displayedName,
      fullGroupName,
    });
  }

  return allInstructions;
};

export const enumerateInstructions = (
  isCondition: boolean
): Array<InstructionOrExpressionInformation> => {
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
            (isCondition ? 'conditions' : 'action') +
            ' for all objects'
          : extension.getFullName();
      prefix += GROUP_DELIMITER;
    }

    //Free instructions
    allInstructions = [
      ...allInstructions,
      ...enumerateExtensionInstructions(
        prefix,
        isCondition ? extension.getAllConditions() : extension.getAllActions()
      ),
    ];

    //Objects instructions:
    for (let j = 0; j < allObjectsTypes.size(); ++j) {
      allInstructions = [
        ...allInstructions,
        ...enumerateExtensionInstructions(
          prefix,
          isCondition
            ? extension.getAllConditionsForObject(allObjectsTypes.get(j))
            : extension.getAllActionsForObject(allObjectsTypes.get(j))
        ),
      ];
    }

    //Behaviors instructions:
    for (let j = 0; j < allBehaviorsTypes.size(); ++j) {
      allInstructions = [
        ...allInstructions,
        ...enumerateExtensionInstructions(
          prefix,
          isCondition
            ? extension.getAllConditionsForBehavior(allBehaviorsTypes.get(j))
            : extension.getAllActionsForBehavior(allBehaviorsTypes.get(j))
        ),
      ];
    }
  }

  return allInstructions;
};
