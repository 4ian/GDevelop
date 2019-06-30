// @flow
import {
  type EnumeratedInstructionOrExpressionMetadata,
  type InstructionOrExpressionScope,
} from './EnumeratedInstructionOrExpressionMetadata.js';
const gd = global.gd;

const GROUP_DELIMITER = '/';

const enumerateExtensionExpressions = (
  prefix: string,
  expressions: gdMapStringExpressionMetadata,
  scope: InstructionOrExpressionScope
): Array<EnumeratedInstructionOrExpressionMetadata> => {
  const allExpressions = [];

  //Get the map containing the metadata of the expression provided by the extension...
  var expressionsTypes = expressions.keys();

  //... and add each instruction
  for (var j = 0; j < expressionsTypes.size(); ++j) {
    var exprMetadata = expressions.get(expressionsTypes.get(j));
    if (!exprMetadata.isShown()) {
      //Skip hidden expressions
      continue;
    }

    var parameters = [];
    for (var i = 0; i < exprMetadata.getParametersCount(); i++) {
      if (scope.objectMetadata && i === 0) continue;
      if (scope.behaviorMetadata && i <= 1) continue; //Skip object and behavior parameters
      if (exprMetadata.getParameter(i).isCodeOnly()) continue;

      parameters.push(exprMetadata.getParameter(i));
    }

    const displayedName = exprMetadata.getFullName();
    const groupName = exprMetadata.getGroup();
    const iconFilename = exprMetadata.getSmallIconFilename();
    const fullGroupName = prefix + groupName;

    allExpressions.push({
      type: expressionsTypes.get(j),
      name: expressionsTypes.get(j),
      displayedName,
      fullGroupName,
      iconFilename,
      metadata: exprMetadata,
      parameters: parameters,
      scope,
      isPrivate: exprMetadata.isPrivate(),
    });
  }

  return allExpressions;
};

export const enumerateExpressions = (type: string) => {
  const freeExpressions = [];
  const objectsExpressions = [];
  const behaviorsExpressions = [];

  const allExtensions = gd
    .asPlatform(gd.JsPlatform.get())
    .getAllPlatformExtensions();
  for (var i = 0; i < allExtensions.size(); ++i) {
    var extension = allExtensions.get(i);
    var allObjectsTypes = extension.getExtensionObjectsTypes();
    var allBehaviorsTypes = extension.getBehaviorsTypes();

    let prefix = '';
    if (allObjectsTypes.size() > 0 || allBehaviorsTypes.size() > 0) {
      prefix =
        extension.getName() === 'BuiltinObject'
          ? 'Common expressions for all objects'
          : extension.getFullName();
      prefix += GROUP_DELIMITER;
    }

    //Check which type of expression we want to autocomplete.
    var allFreeExpressionsGetter = extension.getAllExpressions;
    var allObjectExpressionsGetter = extension.getAllExpressionsForObject;
    var allBehaviorExpressionsGetter = extension.getAllExpressionsForBehavior;
    if (type === 'string') {
      allFreeExpressionsGetter = extension.getAllStrExpressions;
      allObjectExpressionsGetter = extension.getAllStrExpressionsForObject;
      allBehaviorExpressionsGetter = extension.getAllStrExpressionsForBehavior;
    }

    //Free expressions
    freeExpressions.push.apply(
      freeExpressions,
      enumerateExtensionExpressions(
        prefix,
        allFreeExpressionsGetter.call(extension),
        {
          objectMetadata: undefined,
          behaviorMetadata: undefined,
        }
      )
    );

    //Objects expressions:
    for (var j = 0; j < allObjectsTypes.size(); ++j) {
      const objectType = allObjectsTypes.get(j);
      const objectMetadata = extension.getObjectMetadata(objectType);
      objectsExpressions.push.apply(
        objectsExpressions,
        enumerateExtensionExpressions(
          prefix,
          allObjectExpressionsGetter.call(extension, objectType),
          { objectMetadata }
        )
      );
    }

    //Behaviors expressions:
    for (var k = 0; k < allBehaviorsTypes.size(); ++k) {
      const behaviorType = allBehaviorsTypes.get(k);
      const behaviorMetadata = extension.getBehaviorMetadata(behaviorType);
      behaviorsExpressions.push.apply(
        behaviorsExpressions,
        enumerateExtensionExpressions(
          prefix,
          allBehaviorExpressionsGetter.call(extension, behaviorType),
          { behaviorMetadata }
        )
      );
    }
  }

  return {
    allExpressions: [
      ...freeExpressions,
      ...objectsExpressions,
      ...behaviorsExpressions,
    ],
    freeExpressions,
    objectsExpressions,
    behaviorsExpressions,
  };
};

export const filterExpressions = (
  list: Array<EnumeratedInstructionOrExpressionMetadata>,
  searchText: string
): Array<EnumeratedInstructionOrExpressionMetadata> => {
  if (!searchText) return list;
  const lowercaseSearchText = searchText.toLowerCase();

  return list.filter(enumeratedExpression => {
    return (
      enumeratedExpression.type.toLowerCase().indexOf(lowercaseSearchText) !==
      -1
    );
  });
};
