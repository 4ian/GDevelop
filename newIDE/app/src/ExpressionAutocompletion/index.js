// @flow
import { type I18n as I18nType } from '@lingui/core';
import { mapFor, mapVector } from '../Utils/MapFor';
import flatten from 'lodash/flatten';
import { type EventsScope } from '../InstructionOrExpression/EventsScope.flow';
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
import { getParameterChoiceAutocompletions } from '../EventsSheet/ParameterFields/ParameterMetadataTools';
import getObjectByName from '../Utils/GetObjectByName';
import { getAllPointNames } from '../ObjectEditor/Editors/SpriteEditor/Utils/SpriteObjectHelper';
import { enumerateParametersUsableInExpressions } from '../EventsSheet/ParameterFields/EnumerateFunctionParameters';
import { filterStringListWithPrefix } from '../Utils/ListFiltering';

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
      variableType: Variable_Type,
    |}
  | {|
      ...BaseExpressionAutocompletion,
      kind: 'Property',
      propertyType: string,
    |}
  | {|
      ...BaseExpressionAutocompletion,
      kind: 'Parameter',
      parameterType: string,
    |}
  | {|
      ...BaseExpressionAutocompletion,
      objectConfiguration: ?gdObjectConfiguration,
      kind: 'Object',
    |}
  | {|
      ...BaseExpressionAutocompletion,
      kind: 'Behavior',
      behaviorType: string,
    |}
  | {|
      ...BaseExpressionAutocompletion,
      kind: 'FullExpression',
    |};

type ExpressionAutocompletionContext = {|
  gd: libGDevelop,
  project: gdProject,
  projectScopedContainers: gdProjectScopedContainers,
  scope: EventsScope, // TODO: Should be replaced by usage of projectScopedContainers everywhere.
|};

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
  completionDescription: gdExpressionCompletionDescription,
  i18n: I18nType
): Array<ExpressionAutocompletion> {
  const prefix: string = completionDescription.getPrefix();
  const type: string = completionDescription.getType();
  const isExact: boolean = completionDescription.isExact();

  const freeExpressions = enumerateFreeExpressions(type, i18n);

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
  const { gd, projectScopedContainers } = expressionAutocompletionContext;

  const objectType = projectScopedContainers
    .getObjectsContainersList()
    .getTypeOfObject(objectName);
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

  const behaviorNames = projectScopedContainers
    .getObjectsContainersList()
    .getBehaviorsOfObject(objectName, true);
  mapVector(behaviorNames, behaviorName => {
    const behaviorType = projectScopedContainers
      .getObjectsContainersList()
      .getTypeOfBehaviorInObjectOrGroup(objectName, behaviorName, true);
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
  const { projectScopedContainers } = expressionAutocompletionContext;

  // TODO: could be made more precise with the object name
  const behaviorType = projectScopedContainers
    .getObjectsContainersList()
    .getTypeOfBehavior(behaviorName, /* searchInGroups= */ true);

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
    autocompletionTexts = getParameterChoiceAutocompletions(
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
      const animations = spriteConfiguration.getAnimations();

      autocompletionTexts = getAllPointNames(animations)
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
      const animations = spriteConfiguration.getAnimations();

      autocompletionTexts = mapFor(
        0,
        animations.getAnimationsCount(),
        index => {
          const animationName = animations.getAnimation(index).getName();
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

  const filteredTextList = filterStringListWithPrefix(
    autocompletionTexts,
    prefix
  ).sort();

  const isLastParameter = completionDescription.isLastParameter();
  return filteredTextList.map(text => ({
    kind: 'Text',
    completion: text,
    replacementStartPosition: completionDescription.getReplacementStartPosition(),
    replacementEndPosition: completionDescription.getReplacementEndPosition(),
    addParameterSeparator: !isLastParameter,
  }));
};

const getAutocompletionsForBehavior = function(
  expressionAutocompletionContext: ExpressionAutocompletionContext,
  completionDescription: gdExpressionCompletionDescription
): Array<ExpressionAutocompletion> {
  const prefix: string = completionDescription.getPrefix();
  const isExact: boolean = completionDescription.isExact();
  const objectName: string = completionDescription.getObjectName();

  const { projectScopedContainers } = expressionAutocompletionContext;
  return projectScopedContainers
    .getObjectsContainersList()
    .getBehaviorsOfObject(objectName, true)
    .toJSArray()
    .filter(behaviorName => behaviorName.indexOf(prefix) !== -1)
    .map(behaviorName => {
      const behaviorType = projectScopedContainers
        .getObjectsContainersList()
        .getTypeOfBehaviorInObjectOrGroup(objectName, behaviorName, true);
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
  expressionCompletionDescriptions: gdVectorExpressionCompletionDescription,
  i18n: I18nType
): Array<ExpressionAutocompletion> => {
  const { gd } = expressionAutocompletionContext;

  return flatten(
    mapVector(expressionCompletionDescriptions, completionDescription => {
      const completionKind = completionDescription.getCompletionKind();

      if (
        completionKind ===
        gd.ExpressionCompletionDescription.ExpressionWithPrefix
      ) {
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
            completionDescription,
            i18n
          );
        }
      } else if (completionKind === gd.ExpressionCompletionDescription.Object) {
        return [
          {
            kind: 'Object',
            completion: completionDescription.getCompletion(),
            replacementStartPosition: completionDescription.getReplacementStartPosition(),
            replacementEndPosition: completionDescription.getReplacementEndPosition(),
            objectConfiguration: completionDescription.hasObjectConfiguration()
              ? completionDescription.getObjectConfiguration()
              : null,
            addDot: !gd.ParameterMetadata.isObject(
              completionDescription.getType()
            ),
          },
        ];
      } else if (
        completionKind === gd.ExpressionCompletionDescription.BehaviorWithPrefix
      ) {
        return getAutocompletionsForBehavior(
          expressionAutocompletionContext,
          completionDescription
        );
      } else if (
        completionKind === gd.ExpressionCompletionDescription.TextWithPrefix
      ) {
        return getAutocompletionsForText(
          expressionAutocompletionContext,
          completionDescription
        );
      } else if (
        completionKind === gd.ExpressionCompletionDescription.Variable
      ) {
        return [
          {
            kind: 'Variable',
            completion: completionDescription.getCompletion(),
            replacementStartPosition: completionDescription.getReplacementStartPosition(),
            replacementEndPosition: completionDescription.getReplacementEndPosition(),
            variableType: completionDescription.getVariableType(),
          },
        ];
      } else if (
        completionKind === gd.ExpressionCompletionDescription.Property
      ) {
        return [
          {
            kind: 'Property',
            completion: completionDescription.getCompletion(),
            replacementStartPosition: completionDescription.getReplacementStartPosition(),
            replacementEndPosition: completionDescription.getReplacementEndPosition(),
            propertyType: completionDescription.getType(),
          },
        ];
      } else if (
        completionKind === gd.ExpressionCompletionDescription.Parameter
      ) {
        return [
          {
            kind: 'Parameter',
            completion: completionDescription.getCompletion(),
            replacementStartPosition: completionDescription.getReplacementStartPosition(),
            replacementEndPosition: completionDescription.getReplacementEndPosition(),
            parameterType: completionDescription.getType(),
          },
        ];
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
