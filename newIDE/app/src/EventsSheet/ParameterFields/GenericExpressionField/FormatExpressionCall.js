//@flow
import { type EnumeratedInstructionOrExpressionMetadata } from '../../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata.js';
import { type ParameterValues } from './ExpressionParametersEditorDialog';
import { mapVector } from '../../../Utils/MapFor';

const filterOutCodeOnlyParameters = (
  array: Array<string>,
  expressionMetadata: gdExpressionMetadata | gdInstructionMetadata,
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

export const getVisibleParameterTypes = (
  expressionMetadata: EnumeratedInstructionOrExpressionMetadata
): Array<string> => {
  const parameterTypes: Array<string> = mapVector(
    expressionMetadata.metadata.getParameters(),
    parameterMetadata => parameterMetadata.getType()
  );

  if (expressionMetadata.scope.objectMetadata) {
    return filterOutCodeOnlyParameters(
      parameterTypes,
      expressionMetadata.metadata,
      1
    );
  } else if (expressionMetadata.scope.behaviorMetadata) {
    return filterOutCodeOnlyParameters(
      parameterTypes,
      expressionMetadata.metadata,
      2
    );
  } else {
    return filterOutCodeOnlyParameters(
      parameterTypes,
      expressionMetadata.metadata,
      0
    );
  }
};

export const formatExpressionCall = (
  expressionInfo: EnumeratedInstructionOrExpressionMetadata,
  parameterValues: ParameterValues
): string => {
  const functionName = expressionInfo.name || '';

  if (expressionInfo.scope.objectMetadata) {
    const objectName = parameterValues[0];

    const functionArgs = filterOutCodeOnlyParameters(
      parameterValues,
      expressionInfo.metadata,
      1
    ).join(', ');
    return `${objectName}.${functionName}(${functionArgs})`;
  } else if (expressionInfo.scope.behaviorMetadata) {
    const objectName = parameterValues[0];
    const behaviorName = parameterValues[1];

    const functionArgs = filterOutCodeOnlyParameters(
      parameterValues,
      expressionInfo.metadata,
      2
    ).join(', ');
    return `${objectName}.${behaviorName}::${functionName}(${functionArgs})`;
  } else {
    const functionArgs = filterOutCodeOnlyParameters(
      parameterValues,
      expressionInfo.metadata,
      0
    ).join(', ');
    return `${functionName}(${functionArgs})`;
  }
};
