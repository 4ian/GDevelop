// @flow
import { mapVector } from '../Utils/MapFor';
import {
  enumerateObjectsAndGroups,
  filterObjectsList,
  filterGroupsList,
} from '../ObjectsList/EnumerateObjects';
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

type BaseExpressionAutocompletion = {|
  completion: string,
  addParenthesis?: boolean,
  addDot?: boolean,
  addNamespaceSeparator?: boolean,
  addClosingParenthesis?: boolean,
  isExact?: boolean,
|};

export type ExpressionAutocompletion =
  | {|
      ...BaseExpressionAutocompletion,
      kind: 'Expression',
      enumeratedExpressionMetadata: EnumeratedExpressionMetadata,
    |}
  | {|
      ...BaseExpressionAutocompletion,
      kind: 'Text',
    |}
  | {|
      ...BaseExpressionAutocompletion,
      object?: gdObject,
      kind: 'Object',
    |}
  | {|
      ...BaseExpressionAutocompletion,
      kind: 'Behavior',
    |};

type ExpressionAutocompletionContext = {|
  gd: libGDevelop,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  scope: EventsScope,
|};

const getAutocompletionsForExpressions = (
  expressionMetadatas: Array<EnumeratedExpressionMetadata>,
  prefix: string,
  isExact: boolean
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
        enumeratedExpressionMetadata: enumeratedExpressionMetadata,
        addParenthesis: true,
        addClosingParenthesis:
          getVisibleParameterTypes(enumeratedExpressionMetadata).length === 0,
        isExact,
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
    isExact
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

  return getAutocompletionsForExpressions(
    filteredObjectExpressions,
    prefix,
    isExact
  );
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
    isExact
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

  const filteredObjectsList = filterObjectsList(allObjectsList, {
    searchText: prefix,
    selectedTags: [],
  });
  const filteredGroupsList = filterGroupsList(allGroupsList, prefix);

  // If we expect an object, don't add a dot. Otherwise (number, string...),
  // add a dot to prepare for an object function.
  const addDot = !gd.ParameterMetadata.isObject(type);

  return [
    ...filteredObjectsList.map(({ object }) => ({
      kind: 'Object',
      completion: object.getName(),
      object,
      addDot,
    })),
    ...filteredGroupsList.map(({ group }) => ({
      kind: 'Object',
      completion: group.getName(),
      addDot,
    })),
  ];
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
    .map(behaviorName => ({
      kind: 'Behavior',
      completion: behaviorName,
      addNamespaceSeparator: true,
      isExact,
    }));
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
      }

      return [];
    })
  );
};

const separatorChars = ' .:+-/*=()<>[]@!?|\\^%#';

type InsertedAutocompletion = {|
  completion: string,
  addParenthesis?: ?boolean,
  addClosingParenthesis?: ?boolean,
  addDot?: ?boolean,
  addNamespaceSeparator?: ?boolean,
|};

type ExpressionAndCaretLocation = {|
  expression: string,
  caretLocation: number,
|};

export const insertAutocompletionInExpression = (
  { expression, caretLocation }: ExpressionAndCaretLocation,
  insertedAutocompletion: InsertedAutocompletion
): ExpressionAndCaretLocation => {
  const formatCompletion = (nextCharacter: ?string) => {
    const suffix = insertedAutocompletion.addDot
      ? '.'
      : insertedAutocompletion.addNamespaceSeparator
      ? '::'
      : insertedAutocompletion.addParenthesis
      ? insertedAutocompletion.addClosingParenthesis
        ? '()'
        : '('
      : '';

    const addSuffix =
      !nextCharacter || !suffix || nextCharacter[0] !== suffix[0];

    return insertedAutocompletion.completion + (addSuffix ? suffix : '');
  };

  if (caretLocation > expression.length) {
    caretLocation = expression.length;
  }

  if (caretLocation === 0 || !expression) {
    const newExpression = formatCompletion(undefined) + expression;
    return {
      caretLocation: newExpression.length,
      expression: newExpression,
    };
  }

  // Start from the character just before the caret.
  const startPosition = caretLocation - 1;

  const isSeparatorChar = (char: string) => {
    return separatorChars.indexOf(char) !== -1;
  };

  // Find the start position of the current word, unless we're already on a separator.
  let wordStartPosition = startPosition;
  const startPositionIsSeparator = isSeparatorChar(
    expression[wordStartPosition]
  );
  if (!startPositionIsSeparator) {
    while (
      wordStartPosition > 0 &&
      !isSeparatorChar(expression[wordStartPosition - 1])
    ) {
      wordStartPosition--;
    }
  } else {
    // If the start position is a separator, the new word start position
    // must be after the separator.
    wordStartPosition++;
  }

  // Find the end position of the current word
  let wordEndPosition = startPosition;
  while (
    wordEndPosition < expression.length &&
    !isSeparatorChar(expression[wordEndPosition + 1])
  ) {
    wordEndPosition++;
  }

  // The next character, if any, will be useful to format the completion
  // (to avoid repeating an existing character).
  const maybeNextCharacter: ?string = expression[wordEndPosition + 1];

  const newExpressionStart = expression.substring(0, wordStartPosition);
  const insertedWord = formatCompletion(maybeNextCharacter);
  const newExpressionEnd = expression.substring(wordEndPosition + 1);

  return {
    caretLocation: newExpressionStart.length + insertedWord.length,
    expression: newExpressionStart + insertedWord + newExpressionEnd,
  };
};
