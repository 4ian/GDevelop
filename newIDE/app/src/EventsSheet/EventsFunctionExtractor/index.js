// @flow
import { unserializeFromJSObject } from '../../Utils/Serializer';
import { mapVector } from '../../Utils/MapFor';
import { getEventsFunctionType } from '../../EventsFunctionsExtensionsLoader';
const gd = global.gd;

/**
 * Set up an events function with the given serialized events,
 * so that the function contains these events, expecting the objects
 * as parameters.
 */
export const setupFunctionFromEvents = ({
  globalObjectsContainer,
  objectsContainer,
  serializedEvents,
  project,
  eventsFunction,
}: {
  project: gdProject,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  serializedEvents: string,
  eventsFunction: gdEventsFunction,
}) => {
  // Set up the function
  eventsFunction.setName('MyFunction');
  eventsFunction.setFunctionType(gd.EventsFunction.Action);
  unserializeFromJSObject(
    eventsFunction.getEvents(),
    serializedEvents,
    'unserializeFrom',
    project
  );

  // Deduct parameters from events
  const eventsContextAnalyzer = new gd.EventsContextAnalyzer(
    gd.JsPlatform.get(),
    globalObjectsContainer,
    objectsContainer
  );
  eventsContextAnalyzer.launch(eventsFunction.getEvents());
  const eventsContext = eventsContextAnalyzer.getEventsContext();
  const objectNames: Array<string> = eventsContext
    .getObjectOrGroupNames()
    .toNewVectorString()
    .toJSArray();

  const parameters = eventsFunction.getParameters();
  parameters.clear();
  objectNames.forEach(objectName => {
    const newParameter = new gd.ParameterMetadata();
    newParameter.setType('objectList');
    newParameter.setName(objectName);
    newParameter.setExtraInfo(
      gd.getTypeOfObject(
        globalObjectsContainer,
        objectsContainer,
        objectName,
        true
      )
    );
    parameters.push_back(newParameter);

    // TODO: Renamed behaviors are not working in events function. Would need a "getBehavior"/"getBehaviorName" indirection :/
    // CAn also prohibit renaming behaviors??
    const behaviorNames: Array<string> = eventsContext
      .getBehaviorNamesOf(objectName)
      .toNewVectorString()
      .toJSArray();

    behaviorNames.forEach(behaviorName => {
      const newParameter = new gd.ParameterMetadata();
      newParameter.setType('behavior');
      newParameter.setName(behaviorName);
      newParameter.setExtraInfo(
        gd.getTypeOfBehavior(
          globalObjectsContainer,
          objectsContainer,
          behaviorName
        )
      );
      parameters.push_back(newParameter);
    });
  });
  eventsContextAnalyzer.delete();
};

/**
 * Create an instruction to call the given events function
 */
export const createNewInstructionForEventsFunction = (
  extensionName: string,
  eventsFunction: gdEventsFunction
): gdInstruction => {
  const action = new gd.Instruction(); //Add a simple action
  const runtimeSceneParameterCount = 1; // By convention, first parameter is always the Runtime Scene.
  const contextParameterCount = 1; // By convention, latest parameter is always the eventsFunctionContext of the calling function (if any).

  action.setType(getEventsFunctionType(extensionName, eventsFunction));
  action.setParametersCount(
    eventsFunction.getParameters().size() +
      runtimeSceneParameterCount +
      contextParameterCount
  );

  mapVector(eventsFunction.getParameters(), (parameterMetadata, index) => {
    action.setParameter(
      runtimeSceneParameterCount + index,
      parameterMetadata.getName()
    ); //TODO
  });

  return action;
};

/**
 * Validate that a function name is valid.
 */
export const validateEventsFunctionName = (functionName: string) => {
  return gd.Project.validateObjectName(functionName);
};

/**
 * Validate that an events functions extension name is valid.
 */
export const validateExtensionName = (extensionName: string) => {
  return gd.Project.validateObjectName(extensionName);
};

/**
 * Validate that an events functions extension name is unique in a project.
 */
export const validateExtensionNameUniqueness = (
  project: gdProject,
  extensionName: string
) => {
  return !project.hasEventsFunctionsExtensionNamed(extensionName);
};

/**
 * Validate that an events function name is unique in a project extension.
 */
export const validateEventsFunctionNameUniqueness = (
  project: gdProject,
  extensionName: string,
  eventsFunction: gdEventsFunction
) => {
  if (project.hasEventsFunctionsExtensionNamed(extensionName)) {
    const eventsFunctionsExtension = project.getEventsFunctionsExtension(
      extensionName
    );

    return !eventsFunctionsExtension.hasEventsFunctionNamed(
      eventsFunction.getName()
    );
  }

  return true;
};

/**
 * Return true if the events function can be added to the given extension
 * without any conflict/invalid name.
 */
export const canCreateEventsFunction = (
  project: gdProject,
  extensionName: string,
  eventsFunction: gdEventsFunction
) => {
  return (
    extensionName !== '' &&
    validateExtensionName(extensionName) &&
    validateExtensionNameUniqueness(project, extensionName) &&
    eventsFunction.getName() !== '' &&
    validateEventsFunctionName(eventsFunction.getName()) &&
    validateEventsFunctionNameUniqueness(
      project,
      extensionName,
      eventsFunction
    ) &&
    eventsFunction.getFullName() !== '' &&
    eventsFunction.getSentence() !== ''
  );
};

/**
 * Return true if the function is considered to have more parameters than usual.
 */
export const functionHasLotsOfParameters = (
  eventsFunction: gdEventsFunction
) => {
  return eventsFunction.getParameters().size() > 7;
};
