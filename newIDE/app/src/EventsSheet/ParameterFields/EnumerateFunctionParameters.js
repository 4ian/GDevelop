// @flow
import { mapVector } from '../../Utils/MapFor';
const gd: libGDevelop = global.gd;

export const enumerateParametersUsableInExpressions = (
  eventsFunctionsContainer: gdEventsFunctionsContainer,
  eventsFunction: gdEventsFunction,
  allowedParameterTypes: string[]
): Array<gdParameterMetadata> => {
  return mapVector(
    eventsFunction.getParametersForEvents(eventsFunctionsContainer),
    parameterMetadata =>
      !parameterMetadata.isCodeOnly() &&
      !gd.ParameterMetadata.isObject(parameterMetadata.getType()) &&
      !gd.ParameterMetadata.isBehavior(parameterMetadata.getType()) &&
      (allowedParameterTypes.length === 0 ||
        allowedParameterTypes.includes(
          gd.ValueTypeMetadata.getPrimitiveValueType(
            parameterMetadata.getType()
          )
        ))
        ? parameterMetadata
        : null
  ).filter(Boolean);
};
