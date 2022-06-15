//@flow
import { type EnumeratedInstructionOrExpressionMetadata } from '../../../InstructionOrExpression/EnumeratedInstructionOrExpressionMetadata';
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

const filterVisibleParameters = (
  array: Array<string>,
  expressionMetadata: gdExpressionMetadata | gdInstructionMetadata,
  firstParameterIndex: number
) => {
  let lastRequiredIndex = -1;
  let lastProvidedIndex = -1;

  const arrayWithDefaults = array.map((parameter, index) => {
    const metadata = expressionMetadata.getParameter(index);

    if (!metadata.isOptional()) {
      lastRequiredIndex = index;
    }

    if (parameter.length > 0) {
      lastProvidedIndex = index;
      return parameter;
    } else {
      // Fill default values for intermediate parameters so that the user doesn't have to.
      return metadata.getDefaultValue();
    }
  });

  const lastParameterIndex = Math.max(lastRequiredIndex, lastProvidedIndex, 0);

  return arrayWithDefaults.filter(
    (parameter, index) =>
      firstParameterIndex <= index &&
      index <= lastParameterIndex &&
      !expressionMetadata.getParameter(index).isCodeOnly()
  );
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
  parameterValues: ParameterValues,
  options: {| shouldConvertToString: boolean |}
): string => {
  const functionName = expressionInfo.name || '';
  let functionCall = '';

  if (expressionInfo.scope.objectMetadata) {
    const objectName = parameterValues[0];

    const functionArgs = filterVisibleParameters(
      parameterValues,
      expressionInfo.metadata,
      1
    ).join(', ');
    functionCall = `${objectName}.${functionName}(${functionArgs})`;
  } else if (expressionInfo.scope.behaviorMetadata) {
    const objectName = parameterValues[0];
    const behaviorName = parameterValues[1];

    const functionArgs = filterVisibleParameters(
      parameterValues,
      expressionInfo.metadata,
      2
    ).join(', ');
    functionCall = `${objectName}.${behaviorName}::${functionName}(${functionArgs})`;
  } else {
    const functionArgs = filterVisibleParameters(
      parameterValues,
      expressionInfo.metadata,
      0
    ).join(', ');
    functionCall = `${functionName}(${functionArgs})`;
  }
  return options.shouldConvertToString
    ? `ToString(${functionCall})`
    : functionCall;
};
