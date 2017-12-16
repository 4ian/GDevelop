//@flow
import { type InstructionOrExpressionInformation } from '../../InstructionOrExpressionSelector/InstructionOrExpressionInformation.flow.js';
import { type ParameterValues } from './ExpressionParametersEditorDialog';

const filterOutCodeOnlyParameters = (
  array: Array<string>,
  expressionMetadata: Object
) => {
  const parametersCount = expressionMetadata.getParametersCount();

  return array.filter((parameter, index) => {
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
    const [objectName, ...otherParameters] = parameterValues;

    const functionArgs = filterOutCodeOnlyParameters(
      otherParameters,
      expressionInfo.metadata
    ).join(', ');
    return `${objectName}.${functionName}(${functionArgs})`;
  } else if (expressionInfo.behaviorMetadata) {
    const [objectName, behaviorName, ...otherParameters] = parameterValues;

    const functionArgs = filterOutCodeOnlyParameters(
      otherParameters,
      expressionInfo.metadata
    ).join(', ');
    return `${objectName}.${behaviorName}::${functionName}(${functionArgs})`;
  } else {
    const functionArgs = filterOutCodeOnlyParameters(
      parameterValues,
      expressionInfo.metadata
    ).join(', ');
    return `${functionName}(${functionArgs})`;
  }
};
