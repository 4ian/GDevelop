// @flow
import { unserializeFromJSObject } from '../../Utils/Serializer';
import { mapVector } from '../../Utils/MapFor';
import { getFreeEventsFunctionType } from '../../EventsFunctionsExtensionsLoader';
import getObjectGroupByName from '../../Utils/GetObjectGroupByName';
import {
  getProjectScopedContainersFromScope,
  type EventsScope,
} from '../../InstructionOrExpression/EventsScope.flow';
const gd: libGDevelop = global.gd;

/**
 * Set up an events function with the given serialized events,
 * so that the function contains these events, expecting the objects
 * as parameters.
 */
export const setupFunctionFromEvents = ({
  globalObjectsContainer,
  objectsContainer,
  scope,
  serializedEvents,
  project,
  eventsFunction,
}: {
  project: gdProject,
  scope: EventsScope,
  globalObjectsContainer: gdObjectsContainer,
  objectsContainer: gdObjectsContainer,
  serializedEvents: Object,
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

  // Analyze events...
  const projectScopedContainers = getProjectScopedContainersFromScope(
    scope,
    globalObjectsContainer,
    objectsContainer
  );
  const eventsContextAnalyzer = new gd.EventsContextAnalyzer(
    gd.JsPlatform.get()
  );
  eventsContextAnalyzer.launch(
    eventsFunction.getEvents(),
    projectScopedContainers
  );
  const eventsContext = eventsContextAnalyzer.getEventsContext();

  // ...to extract objects and groups
  const objectOrGroupNames: Array<string> = eventsContext
    .getReferencedObjectOrGroupNames()
    .toNewVectorString()
    .toJSArray();
  const objectNames: Array<string> = eventsContext
    .getObjectNames()
    .toNewVectorString()
    .toJSArray();
  const groups: Array<gdObjectGroup> = objectOrGroupNames
    // Filter to only keep groups
    .filter(
      (objectOrGroupName: string) =>
        objectNames.indexOf(objectOrGroupName) === -1
    )
    .map(groupName =>
      getObjectGroupByName(globalObjectsContainer, objectsContainer, groupName)
    )
    .filter(Boolean);

  // Compute what the parameters should be:
  // 1) The groups, but only the ones that have no object directly referenced.
  const parameterGroups: Array<gdObjectGroup> = groups.filter(group => {
    return !objectOrGroupNames.some(referencedObjectOrGroupName =>
      group.find(referencedObjectOrGroupName)
    );
  });
  const parameterGroupNames: Array<string> = parameterGroups.map(group =>
    group.getName()
  );

  // 2) The objects, but only the ones that are already in the groups in parameters
  const parameterObjectNames: Array<string> = objectNames.filter(objectName => {
    return !parameterGroups.some(group => group.find(objectName));
  });

  // Create parameters for these objects (or these groups without any object directly referenced)
  const parameters = eventsFunction.getParameters();
  parameters.clear();
  [...parameterGroupNames, ...parameterObjectNames].forEach(objectName => {
    const newParameter = new gd.ParameterMetadata();
    newParameter.setType('objectList');
    newParameter.setName(objectName);
    newParameter.setExtraInfo(
      projectScopedContainers
        .getObjectsContainersList()
        .getTypeOfObject(objectName)
    );
    parameters.push_back(newParameter);

    const behaviorNames: Array<string> = eventsContext
      .getBehaviorNamesOfObjectOrGroup(objectName)
      .toNewVectorString()
      .toJSArray();

    behaviorNames.forEach(behaviorName => {
      const newParameter = new gd.ParameterMetadata();
      newParameter.setType('behavior');
      newParameter.setName(behaviorName);
      newParameter.setExtraInfo(
        projectScopedContainers
          .getObjectsContainersList()
          .getTypeOfBehavior(behaviorName, false)
      );
      parameters.push_back(newParameter);
    });
  });

  // Import groups that are used in events, but are not in parameters,
  // inside the events function groups.
  groups
    .filter(group => !parameterGroupNames.includes(group.getName()))
    .forEach(group => {
      if (group) {
        eventsFunction.getObjectGroups().insert(group, 0);
      }
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

  action.setType(getFreeEventsFunctionType(extensionName, eventsFunction));
  action.setParametersCount(
    eventsFunction.getParameters().size() +
      runtimeSceneParameterCount +
      contextParameterCount
  );

  mapVector(eventsFunction.getParameters(), (parameterMetadata, index) => {
    action.setParameter(
      runtimeSceneParameterCount + index,
      parameterMetadata.getName()
    );
  });

  return action;
};

/**
 * Validate that a function name is valid.
 */
export const validateEventsFunctionName = (functionName: string) => {
  return gd.Project.isNameSafe(functionName);
};

/**
 * Validate that an events functions extension name is valid.
 */
export const validateExtensionName = (extensionName: string) => {
  return gd.Project.isNameSafe(extensionName);
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
