//@flow
import { type EnumeratedInstructionOrExpressionMetadata } from '../../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata.js';
import { type ParameterValues } from './ExpressionParametersEditorDialog';

const filterOutOptionalParameters = (
  array: Array<string>,
  expressionMetadata: Object,
  firstParameterIndex: number
) => {
  const parametersCount = expressionMetadata.getParametersCount();

  return array.filter((parameter, index) => {
    if (index < firstParameterIndex) return false;

    return (
      index < parametersCount &&
      !expressionMetadata.getParameter(index).isOptional()
    );
  });
};

const filterOutCodeOnlyParameters = (
  array: Array<string>,
  expressionMetadata: Object,
  firstParameterIndex: number
) => {
  const parametersCount = expressionMetadata.getParametersCount();

  return array.filter((parameter, index) => {
    if (index < firstParameterIndex) return false;

    return (
      index < parametersCount &&
      !expressionMetadata.getParameter(index).isCodeOnly()
    );
  });
};

const filterParameters = (
  array: Array<string>,
  expressionMetadata: Object,
  firstParameterIndex: number
) => {
  return filterOutOptionalParameters(
    filterOutCodeOnlyParameters(array, expressionMetadata, firstParameterIndex),
    expressionMetadata,
    firstParameterIndex
  );
};

export const formatExpressionCall = (
  expressionInfo: EnumeratedInstructionOrExpressionMetadata,
  parameterValues: ParameterValues
): string => {
  const functionName = expressionInfo.name || '';

  if (expressionInfo.scope.objectMetadata) {
    const objectName = parameterValues[0];

    const functionArgs = filterParameters(
      parameterValues,
      expressionInfo.metadata,
      1
    ).join(', ');
    return `${objectName}.${functionName}(${functionArgs})`;
  } else if (expressionInfo.scope.behaviorMetadata) {
    const objectName = parameterValues[0];
    const behaviorName = parameterValues[1];

    const functionArgs = filterParameters(
      parameterValues,
      expressionInfo.metadata,
      2
    ).join(', ');
    return `${objectName}.${behaviorName}::${functionName}(${functionArgs})`;
  } else {
    const functionArgs = filterParameters(
      parameterValues,
      expressionInfo.metadata,
      0
    ).join(', ');
    return `${functionName}(${functionArgs})`;
  }
};
