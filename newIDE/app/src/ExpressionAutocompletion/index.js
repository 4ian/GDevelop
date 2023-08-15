// @flow
import { mapFor, mapVector } from '../Utils/MapFor';
import {
  enumerateObjectsAndGroups,
  filterObjectsList,
  filterGroupsList,
} from '../ObjectsList/EnumerateObjects';
import { enumerateVariables } from '../EventsSheet/ParameterFields/EnumerateVariables';
import flatten from 'lodash/flatten';
import { type EventsScope } from '../InstructionOrExpression/EventsScope';
import {
  enumerateFreeExpressions,
  filterExpressions,
  enumerateObjectExpressions,
  enumerateBehaviorExpressions,
} from '../InstructionOrExpression/EnumerateExpressions';
import {
  type EnumeratedExpressionMetadata,
  filterEnumeratedInstructionOrExpressionMetadataByScope,
} from '../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata';
import { getVisibleParameterTypes } from '../EventsSheet/ParameterFields/GenericExpressionField/FormatExpressionCall';
import { getParameterChoices } from '../EventsSheet/ParameterFields/ParameterMetadataTools';
import getObjectByName from '../Utils/GetObjectByName';
import { getAllPointNames } from '../ObjectEditor/Editors/SpriteEditor/Utils/SpriteObjectHelper';
import { enumerateParametersUsableInExpressions } from '../EventsSheet/ParameterFields/EnumerateFunctionParameters';

const gd: libGDevelop = global.gd;

type BaseExpressionAutocompletion = {|
  completion: string,
  replacementStartPosition?: number,
  replacementEndPosition?: number,
  addParenthesis?: boolean,
  addDot?: boolean,
  addParameterSeparator?: boolean,
  addNamespaceSeparator?: boolean,
  hasVisibleParameters?: boolean,
  isExact?: boolean,
|};

export type ExpressionAutocompletion =
  | {|
      ...BaseExpressionAutocompletion,
      kind: 'Expression',
      enumeratedExpressionMetadata: EnumeratedExpressionMetadata,
      shouldConvertToString: boolean,
    |}
  | {|
      ...BaseExpressionAutocompletion,
      kind: 'Text',
    |}
  | {|
      ...BaseExpressionAutocompletion,
      kind: 'Variable',
    |}
  | {|
      ...BaseExpressionAutocompletion,
      object?: gdObject,
      kind: 'Object',
    |}
  | {|
      ...BaseExpressionAutocompletion,
      kind: 'Behavior',
      behaviorType?: string,
    |}
  | {|
      ...BaseExpressionAutocompletion,
      kind: 'FullExpression',
    |};

type ExpressionAutocompletionContext = {|
  gd: libGDevelop,
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  scope: EventsScope,
|};

const filterStringList = (
  list: Array<string>,
  searchText: string
): Array<string> => {
  if (!searchText) return list;

  const lowercaseSearchText = searchText.toLowerCase();

  return list.filter((text: string) => {
    return text.toLowerCase().indexOf(lowercaseSearchText) !== -1;
  });
};

const getAutocompletionsForExpressions = (
  expressionMetadatas: Array<EnumeratedExpressionMetadata>,
  prefix: string,
  replacementStartPosition: number,
  replacementEndPosition: number,
  isExact: boolean,
  completionType: string
): Array<ExpressionAutocompletion> => {
  return expressionMetadatas
    .filter(
      enumeratedExpressionMetadata =>
        !isExact || enumeratedExpressionMetadata.type === prefix
    )
    .map(enumeratedExpressionMetadata => {
      // All enumeratedExpressionMetadata should have a name.
      if (
        !enumeratedExpressionMetadata.name ||
        !enumeratedExpressionMetadata.parameters
      )
        return null;

      return {
        kind: 'Expression',
        completion: enumeratedExpressionMetadata.name,
        replacementStartPosition,
        replacementEndPosition,
        enumeratedExpressionMetadata: enumeratedExpressionMetadata,
        addParenthesis: true,
        hasVisibleParameters:
          getVisibleParameterTypes(enumeratedExpressionMetadata).length !== 0,
        isExact,
        shouldConvertToString:
          completionType === 'string' &&
          enumeratedExpressionMetadata.metadata.getReturnType() === 'number',
      };
    })
    .filter(Boolean);
};

const getAutocompletionsForFreeExpressions = function(
  expressionAutocompletionContext: ExpressionAutocompletionContext,
  completionDescription: gdExpressionCompletionDescription
): Array<ExpressionAutocompletion> {
  const prefix: string = completionDescription.getPrefix();
  const type: string = completionDescription.getType();
  const isExact: boolean = completionDescription.isExact();

  const freeExpressions = enumerateFreeExpressions(type);

  const filteredFreeExpressions = filterEnumeratedInstructionOrExpressionMetadataByScope(
    filterExpressions(freeExpressions, prefix),
    expressionAutocompletionContext.scope
  );
  return getAutocompletionsForExpressions(
    filteredFreeExpressions,
    prefix,
    completionDescription.getReplacementStartPosition(),
    completionDescription.getReplacementEndPosition(),
    isExact,
    type
  );
};

const getAutocompletionsForObjectExpressions = function(
  expressionAutocompletionContext: ExpressionAutocompletionContext,
  completionDescription: gdExpressionCompletionDescription
): Array<ExpressionAutocompletion> {
  const prefix: string = completionDescription.getPrefix();
  const type: string = completionDescription.getType();
  const objectName: string = completionDescription.getObjectName();
  const isExact: boolean = completionDescription.isExact();
  const {
    gd,
    globalObjectsContainer,
    objectsContainer,
  } = expressionAutocompletionContext;

  const objectType: string = gd.getTypeOfObject(
    globalObjectsContainer,
    objectsContainer,
    objectName,
    /* searchInGroups= */ true
  );
  const objectExpressions = enumerateObjectExpressions(type, objectType);
  const filteredObjectExpressions = filterEnumeratedInstructionOrExpressionMetadataByScope(
    filterExpressions(objectExpressions, prefix),
    expressionAutocompletionContext.scope
  );
  const autocompletions = getAutocompletionsForExpressions(
    filteredObjectExpressions,
    prefix,
    completionDescription.getReplacementStartPosition(),
    completionDescription.getReplacementEndPosition(),
    isExact,
    type
  );

  const behaviorNames = gd.getBehaviorsOfObject(
    globalObjectsContainer,
    objectsContainer,
    objectName,
    true
  );
  mapVector(behaviorNames, behaviorName => {
    const behaviorType = gd.getTypeOfBehaviorInObjectOrGroup(
      globalObjectsContainer,
      objectsContainer,
      objectName,
      behaviorName,
      true
    );
    if (!behaviorType) {
      return;
    }
    const behaviorExpressions = enumerateBehaviorExpressions(
      type,
      behaviorType
    );
    const filteredBehaviorExpressions = filterEnumeratedInstructionOrExpressionMetadataByScope(
      filterExpressions(behaviorExpressions, prefix),
      expressionAutocompletionContext.scope
    );
    const behaviorExpressionAutocompletions = getAutocompletionsForExpressions(
      filteredBehaviorExpressions,
      prefix,
      completionDescription.getReplacementStartPosition(),
      completionDescription.getReplacementEndPosition(),
      isExact,
      type
    );
    behaviorExpressionAutocompletions.forEach(autocompletion => {
      autocompletion.completion =
        behaviorName +
        gd.PlatformExtension.getNamespaceSeparator() +
        autocompletion.completion;
    });
    autocompletions.push.apply(
      autocompletions,
      behaviorExpressionAutocompletions
    );
  });

  return autocompletions;
};

const getAutocompletionsForBehaviorExpressions = function(
  expressionAutocompletionContext: ExpressionAutocompletionContext,
  completionDescription: gdExpressionCompletionDescription
): Array<ExpressionAutocompletion> {
  const prefix: string = completionDescription.getPrefix();
  const type: string = completionDescription.getType();
  const behaviorName: string = completionDescription.getBehaviorName();
  const isExact: boolean = completionDescription.isExact();
  const {
    gd,
    globalObjectsContainer,
    objectsContainer,
  } = expressionAutocompletionContext;

  // TODO: could be made more precise with the object name
  const behaviorType = gd.getTypeOfBehavior(
    globalObjectsContainer,
    objectsContainer,
    behaviorName,
    /* searchInGroups= */ true
  );

  const behaviorExpressions = enumerateBehaviorExpressions(type, behaviorType);

  const filteredBehaviorExpressions = filterEnumeratedInstructionOrExpressionMetadataByScope(
    filterExpressions(behaviorExpressions, prefix),
    expressionAutocompletionContext.scope
  );

  return getAutocompletionsForExpressions(
    filteredBehaviorExpressions,
    prefix,
    completionDescription.getReplacementStartPosition(),
    completionDescription.getReplacementEndPosition(),
    isExact,
    type
  );
};

const getAutocompletionsForObject = function(
  expressionAutocompletionContext: ExpressionAutocompletionContext,
  completionDescription: gdExpressionCompletionDescription
): Array<ExpressionAutocompletion> {
  const prefix: string = completionDescription.getPrefix();
  const type: string = completionDescription.getType();
  const {
    gd,
    globalObjectsContainer,
    objectsContainer,
  } = expressionAutocompletionContext;

  const { allObjectsList, allGroupsList } = enumerateObjectsAndGroups(
    globalObjectsContainer,
    objectsContainer
  );

  // We hide exact matches to prevent suggesting options already fully typed.
  const filteredObjectsList = filterObjectsList(allObjectsList, {
    searchText: prefix,
    selectedTags: [],
    hideExactMatches: true,
  });
  const filteredGroupsList = filterGroupsList(allGroupsList, {
    searchText: prefix,
    hideExactMatches: true,
  });

  // If we expect an object, don't add a dot. Otherwise (number, string...),
  // add a dot to prepare for an object function.
  const addDot = !gd.ParameterMetadata.isObject(type);

  return [
    ...filteredObjectsList.map(({ object }) => ({
      kind: 'Object',
      completion: object.getName(),
      replacementStartPosition: completionDescription.getReplacementStartPosition(),
      replacementEndPosition: completionDescription.getReplacementEndPosition(),
      object,
      addDot,
    })),
    ...filteredGroupsList.map(({ group }) => ({
      kind: 'Object',
      completion: group.getName(),
      replacementStartPosition: completionDescription.getReplacementStartPosition(),
      replacementEndPosition: completionDescription.getReplacementEndPosition(),
      addDot,
    })),
  ];
};

const getAutocompletionsForText = function(
  expressionAutocompletionContext: ExpressionAutocompletionContext,
  completionDescription: gdExpressionCompletionDescription
): Array<ExpressionAutocompletion> {
  const prefix: string = completionDescription.getPrefix();
  const type: string = completionDescription.getType();
  const { project, scope } = expressionAutocompletionContext;

  let autocompletionTexts: string[] = [];
  if (type === 'layer') {
    const layout = scope.layout;
    if (layout) {
      for (let index = 0; index < layout.getLayersCount(); index++) {
        autocompletionTexts.push(`"${layout.getLayerAt(index).getName()}"`);
      }
    }
  } else if (type === 'sceneName') {
    if (project) {
      for (let index = 0; index < project.getLayoutsCount(); index++) {
        autocompletionTexts.push(`"${project.getLayoutAt(index).getName()}"`);
      }
    }
  } else if (type === 'stringWithSelector') {
    autocompletionTexts = getParameterChoices(
      completionDescription.getParameterMetadata()
    ).map(autocompletion => autocompletion.completion);
  } else if (type === 'objectPointName') {
    const objectName: string = completionDescription.getObjectName();
    if (!objectName) {
      return [];
    }

    const object = getObjectByName(project, scope.layout, objectName);
    if (!object) {
      return [];
    }

    if (object.getType() === 'Sprite') {
      const spriteConfiguration = gd.asSpriteConfiguration(
        object.getConfiguration()
      );

      autocompletionTexts = getAllPointNames(spriteConfiguration)
        .map(spriteObjectName =>
          spriteObjectName.length > 0 ? `"${spriteObjectName}"` : null
        )
        .filter(Boolean);
    } else {
      return [];
    }
  } else if (type === 'objectAnimationName') {
    const objectName: string = completionDescription.getObjectName();
    if (!objectName) {
      return [];
    }

    const object = getObjectByName(project, scope.layout, objectName);
    if (!object) {
      return [];
    }

    if (object.getType() === 'Sprite') {
      const spriteConfiguration = gd.asSpriteConfiguration(
        object.getConfiguration()
      );

      autocompletionTexts = mapFor(
        0,
        spriteConfiguration.getAnimationsCount(),
        index => {
          const animationName = spriteConfiguration
            .getAnimation(index)
            .getName();
          return animationName.length > 0 ? `"${animationName}"` : null;
        }
      ).filter(Boolean);
    } else {
      return [];
    }
  } else if (type === 'functionParameterName') {
    const eventsBasedEntity =
      scope.eventsBasedBehavior || scope.eventsBasedObject;
    const functionsContainer = eventsBasedEntity
      ? eventsBasedEntity.getEventsFunctions()
      : scope.eventsFunctionsExtension;
    const eventsFunction = scope.eventsFunction;
    if (eventsFunction && functionsContainer) {
      const allowedParameterTypes = completionDescription
        .getParameterMetadata()
        .getExtraInfo()
        .split(',');
      autocompletionTexts = enumerateParametersUsableInExpressions(
        functionsContainer,
        eventsFunction,
        allowedParameterTypes
      ).map(parameterMetadata => `"${parameterMetadata.getName()}"`);
    }
  }
  // To add missing string types see Core\GDCore\Extensions\Metadata\ParameterMetadata.h

  const filteredTextList = filterStringList(autocompletionTexts, prefix).sort();

  const isLastParameter = completionDescription.isLastParameter();
  return filteredTextList.map(text => ({
    kind: 'Text',
    completion: text,
    replacementStartPosition: completionDescription.getReplacementStartPosition(),
    replacementEndPosition: completionDescription.getReplacementEndPosition(),
    addParameterSeparator: !isLastParameter,
  }));
};

const getAutocompletionsForVariable = function(
  expressionAutocompletionContext: ExpressionAutocompletionContext,
  completionDescription: gdExpressionCompletionDescription
): Array<ExpressionAutocompletion> {
  const prefix: string = completionDescription.getPrefix();
  const type: string = completionDescription.getType();
  const objectName: string = completionDescription.getObjectName();
  const { project, scope } = expressionAutocompletionContext;
  const layout = scope.layout;

  let variablesContainer: gdVariablesContainer;
  if (type === 'globalvar') {
    if (!project) {
      // No variable completion
      return [];
    }
    variablesContainer = project.getVariables();
  } else if (type === 'scenevar') {
    if (!layout) {
      // No variable completion
      return [];
    }
    variablesContainer = layout.getVariables();
  } else if (type === 'objectvar') {
    const object = getObjectByName(project, layout, objectName);
    if (!object) {
      // No variable completion for unknown objet
      return [];
    }
    variablesContainer = object.getVariables();
  }

  const definedVariableNames = enumerateVariables(variablesContainer)
    .map(({ name, isValidName }) =>
      isValidName
        ? name
        : // Hide invalid variable names - they would not
          // be parsed correctly anyway.
          null
    )
    .filter(Boolean);

  const filteredVariablesList = filterStringList(definedVariableNames, prefix);

  return filteredVariablesList.map(variableName => ({
    kind: 'Variable',
    completion: variableName,
    replacementStartPosition: completionDescription.getReplacementStartPosition(),
    replacementEndPosition: completionDescription.getReplacementEndPosition(),
  }));
};

const getAutocompletionsForBehavior = function(
  expressionAutocompletionContext: ExpressionAutocompletionContext,
  completionDescription: gdExpressionCompletionDescription
): Array<ExpressionAutocompletion> {
  const prefix: string = completionDescription.getPrefix();
  const isExact: boolean = completionDescription.isExact();
  const objectName: string = completionDescription.getObjectName();

  const {
    gd,
    globalObjectsContainer,
    objectsContainer,
  } = expressionAutocompletionContext;
  return gd
    .getBehaviorsOfObject(
      globalObjectsContainer,
      objectsContainer,
      objectName,
      true
    )
    .toJSArray()
    .filter(behaviorName => behaviorName.indexOf(prefix) !== -1)
    .map(behaviorName => {
      const behaviorType = gd.getTypeOfBehaviorInObjectOrGroup(
        globalObjectsContainer,
        objectsContainer,
        objectName,
        behaviorName,
        true
      );
      return {
        kind: 'Behavior',
        completion: behaviorName,
        replacementStartPosition: completionDescription.getReplacementStartPosition(),
        replacementEndPosition: completionDescription.getReplacementEndPosition(),
        addNamespaceSeparator: true,
        isExact,
        behaviorType,
      };
    });
};

export const getAutocompletionsFromDescriptions = (
  expressionAutocompletionContext: ExpressionAutocompletionContext,
  expressionCompletionDescriptions: gdVectorExpressionCompletionDescription
): Array<ExpressionAutocompletion> => {
  const { gd } = expressionAutocompletionContext;

  return flatten(
    mapVector(expressionCompletionDescriptions, completionDescription => {
      const completionKind = completionDescription.getCompletionKind();

      if (completionKind === gd.ExpressionCompletionDescription.Expression) {
        const objectName: string = completionDescription.getObjectName();
        const behaviorName: string = completionDescription.getBehaviorName();

        if (behaviorName) {
          return getAutocompletionsForBehaviorExpressions(
            expressionAutocompletionContext,
            completionDescription
          );
        } else if (objectName) {
          return getAutocompletionsForObjectExpressions(
            expressionAutocompletionContext,
            completionDescription
          );
        } else {
          return getAutocompletionsForFreeExpressions(
            expressionAutocompletionContext,
            completionDescription
          );
        }
      } else if (completionKind === gd.ExpressionCompletionDescription.Object) {
        return getAutocompletionsForObject(
          expressionAutocompletionContext,
          completionDescription
        );
      } else if (
        completionKind === gd.ExpressionCompletionDescription.Behavior
      ) {
        return getAutocompletionsForBehavior(
          expressionAutocompletionContext,
          completionDescription
        );
      } else if (completionKind === gd.ExpressionCompletionDescription.Text) {
        return getAutocompletionsForText(
          expressionAutocompletionContext,
          completionDescription
        );
      } else if (
        completionKind === gd.ExpressionCompletionDescription.Variable
      ) {
        return getAutocompletionsForVariable(
          expressionAutocompletionContext,
          completionDescription
        );
      }

      return [];
    })
  );
};

type InsertedAutocompletion = {|
  completion: string,
  replacementStartPosition?: number,
  replacementEndPosition?: number,
  addParenthesis?: ?boolean,
  hasVisibleParameters?: ?boolean,
  addDot?: ?boolean,
  addParameterSeparator?: ?boolean,
  addNamespaceSeparator?: ?boolean,
  shouldConvertToString?: ?boolean,
|};

type ExpressionAndCaretLocation = {|
  expression: string,
  caretLocation: number,
|};

/**
 * Returns the position where the last expression call (node) starts,
 * so that we know where to insert the ToString call.
 * For example:
 * '"HelloWorld" + Object.Behavior::' should return 15.
 */
const findLastNodeStartPosition = (expression: string) => {
  let match;
  let indexes = [];
  // We consider that expressions are composed of letters, digits, dot or colons
  const expressionSeparatorRegex = new RegExp(/[^\w\d.:]/g);
  while ((match = expressionSeparatorRegex.exec(expression))) {
    indexes.push(match.index);
  }
  return Math.max(...indexes);
};

const insertWordInExpressionWithToString = ({
  expression,
  wordStartPosition,
  wordEndPosition,
  insertedWord,
}: {
  expression: string,
  wordStartPosition: number,
  wordEndPosition: number,
  insertedWord: string,
}) => {
  const expressionStart = expression.substring(0, wordStartPosition);
  // If the grammar is becoming more complex, you'll need to implement a
  // NodeParenthesesBoundsFinder worker to specify the proper bounds for each node
  // or give this responsibility to `ExpressionCompletionDescription`/`ExpressionCompletionFinder`.
  const completedNodeStartPosition: number = findLastNodeStartPosition(
    expressionStart
  );

  const newExpressionStart = expression.substring(
    0,
    completedNodeStartPosition + 1
  );
  const completedNodeStart = expression.substring(
    completedNodeStartPosition + 1,
    wordStartPosition
  );

  const newExpressionEnd = expression.substring(wordEndPosition);
  return {
    expression:
      newExpressionStart +
      'ToString(' +
      completedNodeStart +
      insertedWord +
      ')' +
      newExpressionEnd,
    // We place the caret before the closing parenthesis of ToString()
    // so that the user's typing flow is not interrupted.
    caretLocation:
      newExpressionStart.length +
      completedNodeStart.length +
      insertedWord.length +
      'ToString('.length,
  };
};

const insertWordInExpression = ({
  expression,
  wordStartPosition,
  wordEndPosition,
  insertedWord,
}: {
  expression: string,
  wordStartPosition: number,
  wordEndPosition: number,
  insertedWord: string,
}) => {
  const newExpressionStart = expression.substring(0, wordStartPosition);
  const newExpressionEnd = expression.substring(wordEndPosition);
  return {
    expression: newExpressionStart + insertedWord + newExpressionEnd,
    caretLocation: newExpressionStart.length + insertedWord.length,
  };
};

export const insertAutocompletionInExpression = (
  { expression, caretLocation }: ExpressionAndCaretLocation,
  insertedAutocompletion: InsertedAutocompletion
): ExpressionAndCaretLocation => {
  const {
    addDot,
    addParameterSeparator,
    addNamespaceSeparator,
    addParenthesis,
    completion,
    shouldConvertToString,
    replacementStartPosition,
    replacementEndPosition,
    hasVisibleParameters,
  } = insertedAutocompletion;
  const formatCompletion = (nextCharacter: ?string) => {
    const suffix = addDot
      ? '.'
      : addParameterSeparator
      ? ', '
      : addNamespaceSeparator
      ? '::'
      : addParenthesis
      ? '()'
      : '';

    const addSuffix =
      !nextCharacter || !suffix || nextCharacter[0] !== suffix[0];

    return completion + (addSuffix ? suffix : '');
  };

  if (caretLocation > expression.length) {
    caretLocation = expression.length;
  }

  if (caretLocation === 0 || !expression) {
    const newExpression = formatCompletion(undefined) + expression;
    return {
      caretLocation: newExpression.length,
      expression: shouldConvertToString
        ? `ToString(${newExpression})`
        : newExpression,
    };
  }

  const wordStartPosition: number = replacementStartPosition
    ? replacementStartPosition
    : 0;
  const wordEndPosition: number = replacementEndPosition
    ? replacementEndPosition
    : expression.length;

  // The next character, if any, will be useful to format the completion
  // (to avoid repeating an existing character).
  const maybeNextCharacter: ?string = expression[wordEndPosition];
  const insertedWord = formatCompletion(maybeNextCharacter);

  const newAutocompletedExpression = shouldConvertToString
    ? insertWordInExpressionWithToString({
        expression,
        insertedWord,
        wordEndPosition,
        wordStartPosition,
      })
    : insertWordInExpression({
        expression,
        insertedWord,
        wordEndPosition,
        wordStartPosition,
      });

  if (addParenthesis && hasVisibleParameters) {
    newAutocompletedExpression.caretLocation =
      newAutocompletedExpression.caretLocation - 1;
  }

  return newAutocompletedExpression;
};
