// @flow
import { type ExpressionParameters } from './ParameterFieldCommons';
import { type ExpressionAutocompletion } from '../../ExpressionAutocompletion';
const gd: libGDevelop = global.gd;

/**
 * Given an instruction or an expression and a parameter number,
 * return the name of the object that this parameter (usually, a "behavior" or a "objectvar") should use.
 *
 * This is an extension to ParameterMetadataTools.cpp and ParameterMetadataTools.h.
 * It's only here to ease to search of the object name in fields like BehaviorField or
 * ObjectVariableField.
 */
export const getLastObjectParameterValue = ({
  instructionMetadata,
  instruction,
  expressionMetadata,
  expression,
  parameterIndex,
}: {|
  instructionMetadata: ?gdInstructionMetadata,
  instruction: ?gdInstruction,
  expressionMetadata: ?gdExpressionMetadata,
  expression: ?ExpressionParameters,
  parameterIndex: ?number,
|}): ?string => {
  if (parameterIndex === undefined || parameterIndex == null) {
    // No parameter index given: the parameter is not even in a list of parameters
    return null;
  }

  let objectName = null;
  if (instructionMetadata && instruction) {
    const objectParameterIndex = gd.ParameterMetadataTools.getObjectParameterIndexFor(
      instructionMetadata.getParameters(),
      parameterIndex
    );
    if (
      objectParameterIndex >= 0 &&
      objectParameterIndex < instruction.getParametersCount()
    ) {
      objectName = instruction
        .getParameter(objectParameterIndex)
        .getPlainString();
    }
  } else if (expressionMetadata && expression) {
    const objectParameterIndex = gd.ParameterMetadataTools.getObjectParameterIndexFor(
      expressionMetadata.getParameters(),
      parameterIndex
    );
    if (
      objectParameterIndex >= 0 &&
      objectParameterIndex < expression.getParametersCount()
    ) {
      objectName = expression.getParameter(objectParameterIndex);
    }
  }

  return objectName;
};

export const getLastObjectParameterObjectType = (
  parameters: gdVectorParameterMetadata,
  parameterIndex: number
) => {
  const objectParameterIndex = gd.ParameterMetadataTools.getObjectParameterIndexFor(
    parameters,
    parameterIndex
  );
  if (objectParameterIndex < 0 || objectParameterIndex >= parameters.size()) {
    return '';
  }

  return parameters.at(objectParameterIndex).getExtraInfo();
};

/**
 * Given an instruction or an expression and a parameter number,
 * return the value of the previous parameter.
 */
export const getPreviousParameterValue = ({
  instruction,
  expression,
  parameterIndex,
}: {|
  instruction: ?gdInstruction,
  expression: ?ExpressionParameters,
  parameterIndex: ?number,
|}): ?string => {
  if (parameterIndex === undefined || parameterIndex == null) {
    // No parameter index given: the parameter is not even in a list of parameters
    return null;
  }

  if (instruction) {
    if (
      parameterIndex >= 1 &&
      parameterIndex < instruction.getParametersCount()
    ) {
      return instruction.getParameter(parameterIndex - 1).getPlainString();
    }
  } else if (expression) {
    if (
      parameterIndex >= 1 &&
      parameterIndex < expression.getParametersCount()
    ) {
      return expression.getParameter(parameterIndex - 1);
    }
  }

  return null;
};

/**
 * Try to extract the value of a string literal, or null. Result is not guaranteed to be valid.
 * - for `"Hello"`, this returns `Hello`.
 * - for `"Hello`, this returns null.
 * - for `"H" + "O"`, this returns `H" + "O`.
 */
export const tryExtractStringLiteralContent = (
  parameterValue: ?string
): ?string => {
  if (!parameterValue) return null;

  const trimmedParameterValue = parameterValue.trim();
  if (
    trimmedParameterValue.length >= 2 &&
    trimmedParameterValue[0] === '"' &&
    trimmedParameterValue[trimmedParameterValue.length - 1] === '"'
  ) {
    return trimmedParameterValue.substr(1, trimmedParameterValue.length - 2);
  }

  return null;
};

export const getParameterChoiceAutocompletions = (
  parameterMetadata: ?gdParameterMetadata
): Array<ExpressionAutocompletion> =>
  getParameterChoiceValues(parameterMetadata).map(choice => ({
    kind: 'Text',
    completion: `"${choice}"`,
  }));

export const getParameterChoiceValues = (
  parameterMetadata: ?gdParameterMetadata
): Array<string> => {
  if (!parameterMetadata) {
    return [];
  }

  try {
    return JSON.parse(parameterMetadata.getExtraInfo());
  } catch (exception) {
    console.error(
      'The parameter seems misconfigured, as an array of choices could not be extracted - verify that your properly wrote a list of choices in JSON format. Full exception is:',
      exception
    );
  }

  return [];
};
