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
  if (expressionInfo.objectMetadata) {
    const [objectName, ...otherParameters] = parameterValues;

    const functionArgs = filterOutCodeOnlyParameters(
      otherParameters,
      expressionInfo.metadata
    ).join(', ');
    return `${objectName}.${expressionInfo.name}(${functionArgs})`;
  } else if (expressionInfo.behaviorMetadata) {
    const [objectName, behaviorName, ...otherParameters] = parameterValues;

    const functionArgs = filterOutCodeOnlyParameters(
      otherParameters,
      expressionInfo.metadata
    ).join(', ');
    return `${objectName}.${behaviorName}::${expressionInfo.name}(${functionArgs})`;
  } else {
    const functionArgs = filterOutCodeOnlyParameters(
      parameterValues,
      expressionInfo.metadata
    ).join(', ');
    return `${expressionInfo.name}(${functionArgs})`;
  }
};
