//@flow
import { type InstructionOrExpressionInformation } from '../../InstructionEditor/InstructionOrExpressionSelector/InstructionOrExpressionInformation.flow.js';
import { type ParameterValues } from './ExpressionParametersEditorDialog';

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

export const formatExpressionCall = (
  expressionInfo: InstructionOrExpressionInformation,
  parameterValues: ParameterValues
): string => {
  const functionName = expressionInfo.name || '';

  if (expressionInfo.objectMetadata) {
    const objectName = parameterValues[0];

    const functionArgs = filterOutCodeOnlyParameters(
      parameterValues,
      expressionInfo.metadata,
      1
    ).join(', ');
    return `${objectName}.${functionName}(${functionArgs})`;
  } else if (expressionInfo.behaviorMetadata) {
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
