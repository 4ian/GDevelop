// @flow
import { getInstancesInLayoutForLayer } from '../Utils/Layout';
import { mapFor } from '../Utils/MapFor';
import { SafeExtractor } from '../Utils/SafeExtractor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { type AiGeneratedEvent } from '../Utils/GDevelopServices/Generation';

const gd: libGDevelop = global.gd;

export type EditorFunctionCall = {|
  name: string,
  arguments: string,
  call_id: string,
|};

export type EditorFunctionCallResult =
  | {|
      status: 'working',
      call_id: string,
    |}
  | {|
      status: 'finished',
      call_id: string,
      success: boolean,
      output: any,
    |}
  | {|
      status: 'ignored',
      call_id: string,
    |};

type EditorFunctionGenericOutput = {|
  success: boolean,
  message?: string,
  objectName?: string,
  behaviorName?: string,
  properties?: any,
  instances?: any,
|};

export type EventsGenerationOptions = {|
  sceneName: string,
  eventsDescription: string,
  extensionNamesList: string,
  objectsList: string,
|};

/**
 * A function that does something in the editor on the given project.
 */
type EditorFunction = (options: {|
  project: gdProject,
  args: any,
  launchEventsGeneration: (
    options: EventsGenerationOptions
  ) => Promise<AiGeneratedEvent>,
  onEnsureExtensionInstalled: (options: {
    extensionName: string,
  }) => Promise<void>,
|}) => Promise<EditorFunctionGenericOutput>;

/**
 * Helper function to safely extract required string arguments
 */
const extractRequiredString = (args: any, propertyName: string): string => {
  const value = SafeExtractor.extractStringProperty(args, propertyName);
  if (value === null) {
    throw new Error(
      `Missing or invalid required string argument: ${propertyName}`
    );
  }
  return value;
};

/**
 * Helper function to safely extract required number arguments
 */
const extractRequiredNumber = (args: any, propertyName: string): number => {
  const value = SafeExtractor.extractNumberProperty(args, propertyName);
  if (value === null) {
    throw new Error(
      `Missing or invalid required number argument: ${propertyName}`
    );
  }
  return value;
};

const makeGenericFailure = (message: string): EditorFunctionGenericOutput => ({
  success: false,
  message,
});

const makeGenericSuccess = (message: string): EditorFunctionGenericOutput => ({
  success: true,
  message,
});

const serializeNamedProperty = (
  name: string,
  property: gdPropertyDescriptor
): null | {} => {
  if (property.isHidden() || property.isDeprecated()) return null;

  return {
    name,
    ...serializeToJSObject(property),
    group: undefined,
    quickCustomizationVisibility: undefined,
    advanced: undefined,
  };
};

/**
 * Creates a new object in the specified scene
 */
const createObject: EditorFunction = async ({
  project,
  args,
  onEnsureExtensionInstalled,
}) => {
  const scene_name = extractRequiredString(args, 'scene_name');
  const object_type = extractRequiredString(args, 'object_type');
  const object_name = extractRequiredString(args, 'object_name');

  if (!project.hasLayoutNamed(scene_name)) {
    return makeGenericFailure(`Scene not found: "${scene_name}".`);
  }

  const layout = project.getLayout(scene_name);
  const objectsContainer = layout.getObjects();

  // Check if object with this name already exists
  if (objectsContainer.hasObjectNamed(object_name)) {
    if (objectsContainer.getObject(object_name).getType() !== object_type) {
      return makeGenericFailure(
        `Object with name "${object_name}" already exists in scene "${scene_name}" but with a different type ("${object_type}").`
      );
    }

    return makeGenericSuccess(
      `Object with name "${object_name}" already exists, no need to re-create it.`
    );
  }

  if (object_type.includes('::')) {
    const extensionName = object_type.split('::')[0];
    try {
      await onEnsureExtensionInstalled({ extensionName });
    } catch (error) {
      console.error(
        `Could not get extension "${extensionName}" installed:`,
        error
      );
      return makeGenericFailure(
        `Could not install extension "${extensionName}" - should you consider trying with another object type?`
      );
    }
  }

  const objectMetadata = gd.MetadataProvider.getObjectMetadata(
    project.getCurrentPlatform(),
    object_type
  );
  if (gd.MetadataProvider.isBadObjectMetadata(objectMetadata)) {
    return makeGenericFailure(
      `Type "${object_type}" does not exist for objects.`
    );
  }

  // Create the object based on the type
  objectsContainer.insertNewObject(
    project,
    object_type,
    object_name,
    objectsContainer.getObjectsCount()
  );

  // TODO: send back the properties of the object?
  return makeGenericSuccess(
    `Created object "${object_name}" of type "${object_type}" in scene "${scene_name}".`
  );
};

/**
 * Retrieves the properties of a specific object in a scene
 */
const inspectObjectProperties: EditorFunction = async ({ project, args }) => {
  const scene_name = extractRequiredString(args, 'scene_name');
  const object_name = extractRequiredString(args, 'object_name');

  if (!project.hasLayoutNamed(scene_name)) {
    return makeGenericFailure(`Scene not found: "${scene_name}".`);
  }

  const layout = project.getLayout(scene_name);
  const objectsContainer = layout.getObjects();

  if (!objectsContainer.hasObjectNamed(object_name)) {
    return makeGenericFailure(
      `Object not found: "${object_name}" in scene "${scene_name}".`
    );
  }

  const object = objectsContainer.getObject(object_name);
  const objectConfiguration = object.getConfiguration();
  const objectProperties = objectConfiguration.getProperties();

  const propertyNames = objectProperties.keys().toJSArray();
  const properties = propertyNames
    .map(name => {
      const propertyDescriptor = objectProperties.get(name);

      return serializeNamedProperty(name, propertyDescriptor);
    })
    .filter(Boolean);

  return {
    success: true,
    objectName: object_name,
    properties,
  };
};

/**
 * Changes a property of a specific object in a scene
 */
const changeObjectProperty: EditorFunction = async ({ project, args }) => {
  const scene_name = extractRequiredString(args, 'scene_name');
  const object_name = extractRequiredString(args, 'object_name');
  const property_name = extractRequiredString(args, 'property_name');
  const new_value = extractRequiredString(args, 'new_value');

  if (!project.hasLayoutNamed(scene_name)) {
    return makeGenericFailure(`Scene not found: "${scene_name}".`);
  }

  const layout = project.getLayout(scene_name);
  const objectsContainer = layout.getObjects();

  if (!objectsContainer.hasObjectNamed(object_name)) {
    return makeGenericFailure(
      `Object not found: "${object_name}" in scene "${scene_name}".`
    );
  }

  const object = objectsContainer.getObject(object_name);
  const objectConfiguration = object.getConfiguration();
  const objectProperties = objectConfiguration.getProperties();

  if (!objectProperties.has(property_name)) {
    return makeGenericFailure(
      `Property not found: ${property_name} on object ${object_name}.`
    );
  }

  if (!objectConfiguration.updateProperty(property_name, new_value)) {
    return makeGenericFailure(
      `Could not change property "${property_name}" of object "${object_name}". The value might be invalid, of the wrong type or not allowed.`
    );
  }

  return makeGenericSuccess(
    `Changed property "${property_name}" of object "${object_name}" to "${new_value}".`
  );
};

/**
 * Adds a behavior to an object in a scene
 */
const addBehavior: EditorFunction = async ({
  project,
  args,
  onEnsureExtensionInstalled,
}) => {
  const scene_name = extractRequiredString(args, 'scene_name');
  const object_name = extractRequiredString(args, 'object_name');
  const behavior_type = extractRequiredString(args, 'behavior_type');
  const behavior_name = extractRequiredString(args, 'behavior_name');

  if (!project.hasLayoutNamed(scene_name)) {
    return makeGenericFailure(`Scene not found: "${scene_name}".`);
  }

  const layout = project.getLayout(scene_name);
  const objectsContainer = layout.getObjects();

  if (!objectsContainer.hasObjectNamed(object_name)) {
    return makeGenericFailure(
      `Object not found: "${object_name}" in scene "${scene_name}".`
    );
  }

  const object = objectsContainer.getObject(object_name);

  // Check if behavior with this name already exists
  if (object.hasBehaviorNamed(behavior_name)) {
    const behavior = object.getBehavior(behavior_name);
    if (behavior.getTypeName() !== behavior_type) {
      return makeGenericFailure(
        `Behavior with name "${behavior_name}" already exists on object "${object_name}" but with a different type ("${behavior_type}").`
      );
    }

    return makeGenericSuccess(
      `Behavior with name "${behavior_name}" already exists on object "${object_name}", no need to re-create it.`
    );
  }

  if (behavior_type.includes('::')) {
    const extensionName = behavior_type.split('::')[0];
    try {
      await onEnsureExtensionInstalled({ extensionName });
    } catch (error) {
      console.error(
        `Could not get extension "${extensionName}" installed:`,
        error
      );
      return makeGenericFailure(
        `Could not install extension "${extensionName}" - should you consider trying with another behavior type?`
      );
    }
  }

  const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
    project.getCurrentPlatform(),
    behavior_type
  );
  if (gd.MetadataProvider.isBadBehaviorMetadata(behaviorMetadata)) {
    return makeGenericFailure(
      `Type "${behavior_type}" does not exist for behaviors.`
    );
  }

  // Add the behavior
  object.addNewBehavior(project, behavior_type, behavior_name);

  // TODO: send back the properties?
  return makeGenericSuccess(
    `Added behavior "${behavior_name}" of type "${behavior_type}" to object "${object_name}".`
  );
};

/**
 * Removes a behavior from an object in a scene
 */
const removeBehavior: EditorFunction = async ({ project, args }) => {
  const scene_name = extractRequiredString(args, 'scene_name');
  const object_name = extractRequiredString(args, 'object_name');
  const behavior_name = extractRequiredString(args, 'behavior_name');

  if (!project.hasLayoutNamed(scene_name)) {
    return makeGenericFailure(`Scene not found: "${scene_name}".`);
  }

  const layout = project.getLayout(scene_name);
  const objectsContainer = layout.getObjects();

  if (!objectsContainer.hasObjectNamed(object_name)) {
    return makeGenericFailure(
      `Object not found: "${object_name}" in scene "${scene_name}".`
    );
  }

  const object = objectsContainer.getObject(object_name);

  if (!object.hasBehaviorNamed(behavior_name)) {
    return makeGenericFailure(
      `Behavior not found: "${behavior_name}" on object "${object_name}".`
    );
  }

  // Remove the behavior
  object.removeBehavior(behavior_name);

  return makeGenericSuccess(
    `Removed behavior "${behavior_name}" from object "${object_name}".`
  );
};

/**
 * Retrieves the properties of a specific behavior attached to an object
 */
const inspectBehaviorProperties: EditorFunction = async ({ project, args }) => {
  const scene_name = extractRequiredString(args, 'scene_name');
  const object_name = extractRequiredString(args, 'object_name');
  const behavior_name = extractRequiredString(args, 'behavior_name');

  if (!project.hasLayoutNamed(scene_name)) {
    return makeGenericFailure(`Scene not found: "${scene_name}".`);
  }

  const layout = project.getLayout(scene_name);
  const objectsContainer = layout.getObjects();

  if (!objectsContainer.hasObjectNamed(object_name)) {
    return makeGenericFailure(
      `Object not found: "${object_name}" in scene "${scene_name}".`
    );
  }

  const object = objectsContainer.getObject(object_name);

  if (!object.hasBehaviorNamed(behavior_name)) {
    return makeGenericFailure(
      `Behavior not found: "${behavior_name}" on object "${object_name}".`
    );
  }

  const behavior = object.getBehavior(behavior_name);
  const behaviorProperties = behavior.getProperties();
  const propertyNames = behaviorProperties.keys().toJSArray();
  const properties = propertyNames
    .map(name => {
      const propertyDescriptor = behaviorProperties.get(name);

      return serializeNamedProperty(name, propertyDescriptor);
    })
    .filter(Boolean);

  return {
    success: true,
    behaviorName: behavior_name,
    properties: properties,
  };
};

/**
 * Changes a property of a specific behavior attached to an object
 */
const changeBehaviorProperty: EditorFunction = async ({ project, args }) => {
  const scene_name = extractRequiredString(args, 'scene_name');
  const object_name = extractRequiredString(args, 'object_name');
  const behavior_name = extractRequiredString(args, 'behavior_name');
  const property_name = extractRequiredString(args, 'property_name');
  const new_value = extractRequiredString(args, 'new_value');

  if (!project.hasLayoutNamed(scene_name)) {
    return makeGenericFailure(`Scene not found: "${scene_name}".`);
  }

  const layout = project.getLayout(scene_name);
  const objectsContainer = layout.getObjects();

  if (!objectsContainer.hasObjectNamed(object_name)) {
    return makeGenericFailure(
      `Object not found: "${object_name}" in scene "${scene_name}".`
    );
  }

  const object = objectsContainer.getObject(object_name);

  if (!object.hasBehaviorNamed(behavior_name)) {
    return makeGenericFailure(
      `Behavior not found: "${behavior_name}" on object "${object_name}".`
    );
  }

  const behavior = object.getBehavior(behavior_name);
  const behaviorProperties = behavior.getProperties();

  if (!behaviorProperties.has(property_name)) {
    throw new Error(
      `Property not found: ${property_name} on behavior "${object_name}".`
    );
  }

  if (!behavior.updateProperty(property_name, new_value)) {
    return makeGenericFailure(
      `Could not change property "${property_name}" of behavior "${behavior_name}". The value might be invalid, of the wrong type or not allowed.`
    );
  }

  return makeGenericSuccess(
    `Changed property "${property_name}" of behavior "${behavior_name}" to "${new_value}".`
  );
};

/**
 * Lists all object instances in a scene
 */
const describeInstances: EditorFunction = async ({ project, args }) => {
  const scene_name = extractRequiredString(args, 'scene_name');

  if (!project.hasLayoutNamed(scene_name)) {
    return makeGenericFailure(`Scene not found: "${scene_name}".`);
  }

  const layout = project.getLayout(scene_name);
  const initialInstances = layout.getInitialInstances();

  const instances = [];

  // For each layer
  mapFor(0, layout.getLayersCount(), i => {
    const layer = layout.getLayerAt(i);
    const layerName = layer.getName();

    getInstancesInLayoutForLayer(initialInstances, layerName).forEach(
      instance => {
        instances.push({
          ...serializeToJSObject(instance),
        });
      }
    );
  });

  return {
    success: true,
    instances: instances,
  };
};

/**
 * Places a new 2D instance in a scene
 */
const put2dInstance: EditorFunction = async ({ project, args }) => {
  const scene_name = extractRequiredString(args, 'scene_name');
  const object_name = extractRequiredString(args, 'object_name');
  const layer_name = extractRequiredString(args, 'layer_name');
  const x = extractRequiredNumber(args, 'x');
  const y = extractRequiredNumber(args, 'y');

  if (!project.hasLayoutNamed(scene_name)) {
    return makeGenericFailure(`Scene not found: "${scene_name}".`);
  }

  const layout = project.getLayout(scene_name);
  const objectsContainer = layout.getObjects();

  if (!objectsContainer.hasObjectNamed(object_name)) {
    return makeGenericFailure(
      `Object not found: "${object_name}" in scene "${scene_name}".`
    );
  }

  // Check if layer exists (empty string is allowed for base layer)
  if (layer_name !== '' && !layout.hasLayerNamed(layer_name)) {
    return makeGenericFailure(
      `Layer not found: ${layer_name} in scene "${scene_name}".`
    );
  }

  const initialInstances = layout.getInitialInstances();
  const instance = initialInstances.insertNewInitialInstance();

  instance.setObjectName(object_name);
  instance.setLayer(layer_name);
  instance.setX(x);
  instance.setY(y);

  return makeGenericSuccess(
    `Added instance of object "${object_name}" at position (${x}, ${y}) on layer "${layer_name ||
      'base'}"`
  );
};

/**
 * Places a new 3D instance in a scene
 */
const put3dInstance: EditorFunction = async ({ project, args }) => {
  const scene_name = extractRequiredString(args, 'scene_name');
  const object_name = extractRequiredString(args, 'object_name');
  const layer_name = extractRequiredString(args, 'layer_name');
  const x = extractRequiredNumber(args, 'x');
  const y = extractRequiredNumber(args, 'y');
  const z = extractRequiredNumber(args, 'z');

  if (!project.hasLayoutNamed(scene_name)) {
    return makeGenericFailure(`Scene not found: "${scene_name}".`);
  }

  const layout = project.getLayout(scene_name);
  const objectsContainer = layout.getObjects();

  if (!objectsContainer.hasObjectNamed(object_name)) {
    return makeGenericFailure(
      `Object not found: "${object_name}" in scene "${scene_name}".`
    );
  }

  // Check if layer exists (empty string is allowed for base layer)
  if (layer_name !== '' && !layout.hasLayerNamed(layer_name)) {
    return makeGenericFailure(
      `Layer not found: ${layer_name} in scene "${scene_name}".`
    );
  }

  const initialInstances = layout.getInitialInstances();
  const instance = initialInstances.insertNewInitialInstance();

  instance.setObjectName(object_name);
  instance.setLayer(layer_name);
  instance.setX(x);
  instance.setY(y);
  instance.setZ(z);

  return makeGenericSuccess(
    `Added 3D instance of object "${object_name}" at position (${x}, ${y}, ${z}) on layer "${layer_name ||
      'base'}"`
  );
};

/**
 * Retrieves the event sheet structure for a scene
 */
const readSceneEvents: EditorFunction = async ({ project, args }) => {
  const scene_name = extractRequiredString(args, 'scene_name');

  if (!project.hasLayoutNamed(scene_name)) {
    return makeGenericFailure(`Scene not found: "${scene_name}".`);
  }

  const layout = project.getLayout(scene_name);
  const events = layout.getEvents();

  // Convert events to a more readable format
  // This is a simplified implementation - in a real implementation
  // you would traverse the events tree and convert it to a user-friendly format

  return {
    success: true,
    events: 'Events structure would be generated here',
  };
};

/**
 * Adds a new event to a scene's event sheet
 */
const addSceneEvents: EditorFunction = async ({
  project,
  args,
  launchEventsGeneration,
}) => {
  const sceneName = extractRequiredString(args, 'scene_name');
  const eventsDescription = extractRequiredString(args, 'events_description');
  const extensionNamesList = extractRequiredString(
    args,
    'extension_names_list'
  );
  const objectsList = SafeExtractor.extractStringProperty(args, 'objects_list');

  if (!project.hasLayoutNamed(sceneName)) {
    return makeGenericFailure(`Scene not found: "${sceneName}".`);
  }

  try {
    const aiGeneratedEvent: AiGeneratedEvent = await launchEventsGeneration({
      sceneName,
      eventsDescription,
      extensionNamesList,
      objectsList,
    });
    console.log('got events:', aiGeneratedEvent);

    if (aiGeneratedEvent.error) {
      throw new Error(
        `Error "${aiGeneratedEvent.error.message}" while generating events.`
      );
    }
    if (!aiGeneratedEvent.generatedEvents) {
      throw new Error(`No events found in the generated events response.`);
    }

    let eventsListContent;
    try {
      eventsListContent = JSON.parse(aiGeneratedEvent.generatedEvents);
    } catch (error) {
      throw new Error(
        `Error while parsing generated events: ${error.message}.`
      );
    }

    const eventsList = new gd.EventsList();
    unserializeFromJSObject(
      eventsList,
      eventsListContent,
      'unserializeFrom',
      project
    );

    if (!project.hasLayoutNamed(sceneName)) {
      return makeGenericFailure(`Scene not found: "${sceneName}".`);
    }
    const scene = project.getLayout(sceneName);

    scene
      .getEvents()
      .insertEvents(
        eventsList,
        0,
        eventsList.getEventsCount(),
        scene.getEvents().getEventsCount()
      );
    eventsList.delete();

    return makeGenericSuccess(`Modified or added new event(s)."`);
  } catch (error) {
    console.error('Error while generating events:', error);
    return makeGenericFailure(`An error happened while generating events.`);
  }
};

/**
 * Creates a new, empty scene
 */
const createScene: EditorFunction = async ({ project, args }) => {
  const scene_name = extractRequiredString(args, 'scene_name');

  if (project.hasLayoutNamed(scene_name)) {
    return makeGenericSuccess(
      `Scene with name "${scene_name}" already exists, no need to re-create it.`
    );
  }

  const scenesCount = project.getLayoutsCount();
  project.insertNewLayout(scene_name, scenesCount);

  return makeGenericSuccess(`Created new scene "${scene_name}".`);
};

/**
 * Deletes an existing scene
 */
const deleteScene: EditorFunction = async ({ project, args }) => {
  const scene_name = extractRequiredString(args, 'scene_name');

  if (!project.hasLayoutNamed(scene_name)) {
    return makeGenericSuccess(
      `Scene is already non existent or deleted: "${scene_name}". No need to delete it.`
    );
  }

  project.removeLayout(scene_name);

  return makeGenericSuccess(`Deleted scene "${scene_name}".`);
};

const addOrEditVariable: EditorFunction = async ({ project, args }) => {
  const variable_name_or_path = extractRequiredString(
    args,
    'variable_name_or_path'
  );
  const value = extractRequiredString(args, 'value');
  const variable_type = SafeExtractor.extractStringProperty(
    args,
    'variable_type'
  );
  const variable_scope = extractRequiredString(args, 'variable_scope');
  const object_name = SafeExtractor.extractStringProperty(args, 'object_name');
  const scene_name = SafeExtractor.extractStringProperty(args, 'scene_name');

  let variablesContainer;
  if (variable_scope === 'scene') {
    if (!scene_name) {
      return makeGenericFailure(
        `Missing "scene_name" argument, required to edit a scene variable.`
      );
    }
    if (!project.hasLayoutNamed(scene_name)) {
      return makeGenericFailure(`Scene not found: "${scene_name}".`);
    }
    variablesContainer = project.getLayout(scene_name).getVariables();
  } else if (variable_scope === 'object') {
    let objectsContainer;
    if (scene_name) {
      if (!project.hasLayoutNamed(scene_name)) {
        return makeGenericFailure(`Scene not found: "${scene_name}".`);
      }
      objectsContainer = project.getLayout(scene_name).getObjects();
      if (!objectsContainer.hasObjectNamed(object_name)) {
        return makeGenericFailure(
          `Object not found: "${object_name}" in scene "${scene_name}".`
        );
      }
    } else {
      objectsContainer = project.getObjects();
      if (!objectsContainer.hasObjectNamed(object_name)) {
        return makeGenericFailure(
          `Object not found: "${object_name}" in project.`
        );
      }
    }

    variablesContainer = objectsContainer.getObject(object_name).getVariables();
  } else if (variable_scope === 'global') {
    variablesContainer = project.getVariables();
  } else {
    return makeGenericFailure(
      `Invalid "variable_scope" argument: "${variable_scope}". Valid values are \`scene\`, \`object\` or \`global\`.`
    );
  }

  const variableNames = variable_name_or_path.split('.');
  if (variable_name_or_path.length === 0) {
    return makeGenericFailure(
      `Invalid "variable_name_or_path" argument: "${variable_name_or_path}". It should be the name of the variable, or a dot separated path to the variable (for structures).`
    );
  }

  let addedNewVariable = false;
  const firstVariableName = variableNames[0];
  let variable = null;
  if (!variablesContainer.has(firstVariableName)) {
    variable = variablesContainer.insertNew(firstVariableName, 0);
    addedNewVariable = true;
  } else {
    variable = variablesContainer.get(firstVariableName);
  }

  for (let i = 1; i < variableNames.length; i++) {
    const childVariableName = variableNames[i];

    variable.castTo('Structure');
    if (!variable.hasChild(childVariableName)) {
      addedNewVariable = true;
    }

    variable = variable.getChild(childVariableName);
  }

  const readOrInferVariableType = (
    specifiedType: string | null,
    value: string
  ): string => {
    if (specifiedType) {
      const lowercaseSpecifiedType = specifiedType.toLowerCase();
      if (lowercaseSpecifiedType === 'string') {
        return 'String';
      } else if (lowercaseSpecifiedType === 'number') {
        return 'Number';
      } else if (lowercaseSpecifiedType === 'boolean') {
        return 'Boolean';
      }
    }

    if (value.toLowerCase() === 'true' || value.toLowerCase() === 'false') {
      return 'Boolean';
    }

    const numberValue = parseFloat(value);
    if (!Number.isNaN(numberValue)) {
      return 'Number';
    }

    return 'String';
  };

  const variableType = readOrInferVariableType(variable_type, value);

  if (variableType === 'String') {
    variable.setString(value);
  } else if (variableType === 'Number') {
    variable.setValue(parseFloat(value));
  } else if (variableType === 'Boolean') {
    variable.setBool(value.toLowerCase() === 'true');
  }

  return makeGenericSuccess(
    addedNewVariable
      ? `Properly added variable "${variable_name_or_path}" of type "${variableType}".`
      : `Properly edited variable "${variable_name_or_path}".`
  );
};

// Map of available commands
// TODO: rename
const commandsMap: { [string]: EditorFunction } = {
  create_object: createObject,
  inspect_object_properties: inspectObjectProperties,
  change_object_property: changeObjectProperty,
  add_behavior: addBehavior,
  remove_behavior: removeBehavior,
  inspect_behavior_properties: inspectBehaviorProperties,
  change_behavior_property: changeBehaviorProperty,
  describe_instances: describeInstances,
  put_2d_instance: put2dInstance,
  put_3d_instance: put3dInstance,
  read_scene_events: readSceneEvents,
  add_scene_events: addSceneEvents,
  create_scene: createScene,
  delete_scene: deleteScene,
  add_or_edit_variable: addOrEditVariable,
};

export type ProcessEditorFunctionCallsOptions = {|
  project: gdProject,
  functionCalls: Array<EditorFunctionCall>,
  ignore: boolean,
  launchEventsGeneration: (
    options: EventsGenerationOptions
  ) => Promise<AiGeneratedEvent>,
  onEnsureExtensionInstalled: (options: {
    extensionName: string,
  }) => Promise<void>,
|};

export const processEditorFunctionCalls = async ({
  functionCalls,
  project,
  launchEventsGeneration,
  ignore,
  onEnsureExtensionInstalled,
}: ProcessEditorFunctionCallsOptions): Promise<
  Array<EditorFunctionCallResult>
> => {
  const results: Array<EditorFunctionCallResult> = [];

  for (const functionCall of functionCalls) {
    const call_id = functionCall.call_id;
    if (ignore) {
      results.push({
        status: 'ignored',
        call_id,
      });
      continue;
    }

    const name = functionCall.name;
    let args;
    try {
      try {
        args = JSON.parse(functionCall.arguments);
      } catch (error) {
        console.error('Error parsing arguments: ', error);
        results.push({
          status: 'finished',
          call_id,
          success: false,
          output: {
            message: 'Invalid arguments (not a valid JSON string).',
          },
        });
      }

      if (name === null) {
        results.push({
          status: 'finished',
          call_id,
          success: false,
          output: {
            message: 'Missing or invalid function name.',
          },
        });
        continue;
      }

      if (args === null) {
        results.push({
          status: 'finished',
          call_id,
          success: false,
          output: {
            message: `Invalid arguments for function: ${name}.`,
          },
        });
        continue;
      }

      // Check if the function exists
      if (!commandsMap[name]) {
        results.push({
          status: 'finished',
          call_id,
          success: false,
          output: {
            message: `Unknown function: ${name}.`,
          },
        });
        continue;
      }

      // Execute the function
      const result: EditorFunctionGenericOutput = await commandsMap[name]({
        project,
        args,
        launchEventsGeneration,
        onEnsureExtensionInstalled,
      });
      const { success, ...output } = result;
      results.push({
        status: 'finished',
        call_id,
        success,
        output,
      });
    } catch (error) {
      results.push({
        status: 'finished',
        call_id,
        success: false,
        output: { message: error.message || 'Unknown error' },
      });
    }
  }

  return results;
};
