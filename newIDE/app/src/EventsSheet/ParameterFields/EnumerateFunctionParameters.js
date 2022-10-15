// @flow
import { mapVector } from '../../Utils/MapFor';
const gd: libGDevelop = global.gd;

export const enumerateParametersUsableInExpressions = (
  eventsFunction: gdEventsFunction
): Array<gdParameterMetadata> => {
  return mapVector(eventsFunction.getParameters(), parameterMetadata =>
    parameterMetadata.isCodeOnly() ||
    gd.ParameterMetadata.isObject(parameterMetadata.getType()) ||
    gd.ParameterMetadata.isBehavior(parameterMetadata.getType())
      ? null
      : parameterMetadata
  ).filter(Boolean);
};
