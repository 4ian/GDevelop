// @flow
import { type ExpressionParameters } from './ParameterFieldCommons';
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
      objectName = instruction.getParameter(objectParameterIndex);
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

export const getParameterChoices = (
  parameterMetadata: ?gdParameterMetadata
): Array<ExpressionAutocompletion> => {
  if (!parameterMetadata) {
    return [];
  }

  try {
    return JSON.parse(parameterMetadata.getExtraInfo()).map(choice => ({
      kind: 'Text',
      completion: `"${choice}"`,
    }));
  } catch (exception) {
    console.error(
      'The parameter seems misconfigured, as an array of choices could not be extracted - verify that your properly wrote a list of choices in JSON format. Full exception is:',
      exception
    );
  }

  return [];
};
