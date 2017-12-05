export const formatExpressionCall = (expressionInfo, parameterValues) => {
    const functionArgs = parameterValues.join(', ');
    const functionCall = `${expressionInfo.name}(${functionArgs})`;

    return functionCall;
}
