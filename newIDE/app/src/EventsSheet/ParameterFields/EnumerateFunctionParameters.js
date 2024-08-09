// @flow
import { mapFor } from '../../Utils/MapFor';
const gd: libGDevelop = global.gd;

export const enumerateParametersUsableInExpressions = (
  eventsFunctionsContainer: gdEventsFunctionsContainer,
  eventsFunction: gdEventsFunction,
  allowedParameterTypes: string[]
): Array<gdParameterMetadata> => {
  const parameters = eventsFunction.getParametersForEvents(
    eventsFunctionsContainer
  );
  return mapFor(0, parameters.getParametersCount(), i => {
    const parameterMetadata = parameters.getParameterAt(i);
    return !parameterMetadata.isCodeOnly() &&
      !gd.ParameterMetadata.isObject(parameterMetadata.getType()) &&
      !gd.ParameterMetadata.isBehavior(parameterMetadata.getType()) &&
      (allowedParameterTypes.length === 0 ||
        allowedParameterTypes.includes(
          gd.ValueTypeMetadata.getPrimitiveValueType(
            parameterMetadata.getType()
          )
        ))
      ? parameterMetadata
      : null;
  }).filter(Boolean);
};
