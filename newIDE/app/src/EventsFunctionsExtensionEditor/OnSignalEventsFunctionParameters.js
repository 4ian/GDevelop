// @flow

const gd: libGDevelop = global.gd;

const onSignalFunctionName = 'onSignal';
const signalParameters = [
  {
    name: 'SignalName',
    type: 'string',
    description: 'Signal name',
  },
  {
    name: 'Payload',
    type: 'string',
    description: 'Payload',
  },
];

const addParameter = (
  parameters: gdParameterMetadataContainer,
  name: string,
  type: string,
  description: string,
  extraInfo?: string
) => {
  const parameter = parameters.addNewParameter(name);
  parameter.setType(type).setName(name).setDescription(description);
  if (extraInfo) {
    parameter.setExtraInfo(extraInfo);
  }
};

const addSignalParameters = (parameters: gdParameterMetadataContainer) => {
  for (let i = 0; i < signalParameters.length; ++i) {
    const parameter = signalParameters[i];
    addParameter(
      parameters,
      parameter.name,
      parameter.type,
      parameter.description
    );
  }
};

const isParameterMatching = (
  parameters: gdParameterMetadataContainer,
  index: number,
  name: string,
  type: string,
  extraInfo?: string
): boolean => {
  if (index >= parameters.getParametersCount()) {
    return false;
  }

  const parameter = parameters.getParameterAt(index);
  if (parameter.getName() !== name || parameter.getType() !== type) {
    return false;
  }

  return !extraInfo || parameter.getExtraInfo() === extraInfo;
};

const hasExpectedSignalParameters = (
  parameters: gdParameterMetadataContainer,
  firstSignalParameterIndex: number
): boolean => {
  for (let i = 0; i < signalParameters.length; ++i) {
    const parameter = signalParameters[i];
    if (
      !isParameterMatching(
        parameters,
        firstSignalParameterIndex + i,
        parameter.name,
        parameter.type
      )
    ) {
      return false;
    }
  }
  return true;
};

export const ensureOnSignalObjectEventsFunctionProperParameters = (
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedObject: gdEventsBasedObject
): boolean => {
  const eventsFunctions = eventsBasedObject.getEventsFunctions();
  if (!eventsFunctions.hasEventsFunctionNamed(onSignalFunctionName)) {
    return false;
  }

  const eventsFunction =
    eventsFunctions.getEventsFunction(onSignalFunctionName);
  const parameters = eventsFunction.getParameters();
  const objectType = gd.PlatformExtension.getObjectFullType(
    eventsFunctionsExtension.getName(),
    eventsBasedObject.getName()
  );
  if (
    parameters.getParametersCount() === 3 &&
    isParameterMatching(parameters, 0, 'Object', 'object', objectType) &&
    hasExpectedSignalParameters(parameters, 1)
  ) {
    return false;
  }

  parameters.clearParameters();
  addParameter(parameters, 'Object', 'object', 'Object', objectType);
  addSignalParameters(parameters);
  return true;
};

export const ensureOnSignalBehaviorEventsFunctionProperParameters = (
  eventsFunctionsExtension: gdEventsFunctionsExtension,
  eventsBasedBehavior: gdEventsBasedBehavior
): boolean => {
  const eventsFunctions = eventsBasedBehavior.getEventsFunctions();
  if (!eventsFunctions.hasEventsFunctionNamed(onSignalFunctionName)) {
    return false;
  }

  const eventsFunction =
    eventsFunctions.getEventsFunction(onSignalFunctionName);
  const parameters = eventsFunction.getParameters();
  const behaviorType = gd.PlatformExtension.getBehaviorFullType(
    eventsFunctionsExtension.getName(),
    eventsBasedBehavior.getName()
  );
  if (
    parameters.getParametersCount() === 4 &&
    isParameterMatching(
      parameters,
      0,
      'Object',
      'object',
      eventsBasedBehavior.getObjectType()
    ) &&
    isParameterMatching(parameters, 1, 'Behavior', 'behavior', behaviorType) &&
    hasExpectedSignalParameters(parameters, 2)
  ) {
    return false;
  }

  parameters.clearParameters();
  addParameter(
    parameters,
    'Object',
    'object',
    'Object',
    eventsBasedBehavior.getObjectType()
  );
  addParameter(parameters, 'Behavior', 'behavior', 'Behavior', behaviorType);
  addSignalParameters(parameters);
  return true;
};
