//@flow
import { type InstructionOrExpressionInformation } from '../../InstructionOrExpressionSelector/InstructionOrExpressionInformation.flow.js';
import { type ParameterValues } from './ExpressionParametersEditorDialog';

export const formatExpressionCall = (
  expressionInfo: InstructionOrExpressionInformation,
  parameterValues: ParameterValues
): string => {
  if (expressionInfo.objectMetadata) {
    const [objectName, ...otherParameters] = parameterValues;

    const functionArgs = otherParameters.join(', ');
    return `${objectName}.${expressionInfo.name}(${functionArgs})`;
  } else if (expressionInfo.behaviorMetadata) {
    const [objectName, behaviorName, ...otherParameters] = parameterValues;

    const functionArgs = otherParameters.join(', ');
    return `${objectName}.${behaviorName}::${expressionInfo.name}(${functionArgs})`;
  } else {
    const functionArgs = parameterValues.join(', ');
    return `${expressionInfo.name}(${functionArgs})`;
  }
};
