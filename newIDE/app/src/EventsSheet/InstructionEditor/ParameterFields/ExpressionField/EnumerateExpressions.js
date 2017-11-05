// @flow weak
import update from 'lodash.update';
import compact from 'lodash.compact';
const gd = global.gd;

const GROUP_DELIMITER = '/';

const enumerateExtensionExpressions = (
  prefix,
  expressions,
  objectMetadata,
  behaviorMetadata
) => {
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
      if (objectMetadata && i == 0) continue;
      if (behaviorMetadata && i <= 1) continue; //Skip object and behavior parameters
      if (exprMetadata.getParameter(i).isCodeOnly()) continue;

      parameters.push(exprMetadata.getParameter(i));
    }

    const displayedName = exprMetadata.getFullName();
    const groupName = exprMetadata.getGroup();
    const fullGroupName = prefix + groupName;

    allExpressions.push({
      type: expressionsTypes.get(j),
      displayedName,
      fullGroupName,
      metadata: exprMetadata,
      parameters: parameters,
      objectMetadata: objectMetadata,
      behaviorMetadata: behaviorMetadata,
    });
  }

  return allExpressions;
};

export const enumerateExpressions = (type = 'number') => {
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

    //TODO: Factor with InstructionTypeSelector.js
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
      enumerateExtensionExpressions(prefix, allFreeExpressionsGetter.call(extension))
    );

    //Objects expressions:
    for (var j = 0; j < allObjectsTypes.size(); ++j) {
      var objMetadata = extension.getObjectMetadata(allObjectsTypes.get(j));
      objectsExpressions.push.apply(
        objectsExpressions,
        enumerateExtensionExpressions(
          prefix,
          allObjectExpressionsGetter.call(extension, allObjectsTypes.get(j)),
          objMetadata
        )
      );
    }

    //Behaviors expressions:
    for (var j = 0; j < allBehaviorsTypes.size(); ++j) {
      var autoMetadata = extension.getBehaviorMetadata(
        allBehaviorsTypes.get(j)
      );
      behaviorsExpressions.push.apply(
        behaviorsExpressions,
        enumerateExtensionExpressions(
          prefix,
          allBehaviorExpressionsGetter.call(
            extension,
            allBehaviorsTypes.get(j)
          ),
          undefined,
          autoMetadata
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

export const filterExpressions = (list, searchText) => {
    if (!searchText) return list;
    const lowercaseSearchText = searchText.toLowerCase();

    return list.filter(enumeratedExpression => {
      return (
        enumeratedExpression.type
          .toLowerCase()
          .indexOf(lowercaseSearchText) !== -1
      );
    });
}

export const createExpressionsTree = (allExpressions) => {
  const tree = {};
  allExpressions.forEach(expressionInfo => {
    update(
      tree,
      compact(expressionInfo.fullGroupName.split(GROUP_DELIMITER)),
      groupInfo => {
        const existingGroupInfo = groupInfo || {};
        return {
          ...existingGroupInfo,
          [expressionInfo.displayedName]: expressionInfo,
        };
      }
    );
  });

  return tree;
}
