// @flow
import * as React from 'react';
import { getInstancesInLayoutForLayer } from '../Utils/Layout';
import { mapFor, mapVector } from '../Utils/MapFor';
import { SafeExtractor } from '../Utils/SafeExtractor';
import { serializeToJSObject } from '../Utils/Serializer';
import { type AiGeneratedEvent } from '../Utils/GDevelopServices/Generation';
import { renderNonTranslatedEventsAsText } from '../EventsSheet/EventsTree/TextRenderer';
import {
  addMissingObjectBehaviors,
  addObjectUndeclaredVariables,
  addUndeclaredVariables,
  applyEventsChanges,
} from './ApplyEventsChanges';
import { isBehaviorDefaultCapability } from '../BehaviorsEditor/EnumerateBehaviorsMetadata';
import { Trans } from '@lingui/macro';
import Link from '../UI/Link';
import {
  hexNumberToRGBArray,
  rgbColorToHex,
  rgbOrHexToHexNumber,
} from '../Utils/ColorTransformer';
import { type SimplifiedBehavior } from './SimplifiedProject/SimplifiedProject';
import { ColumnStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import { applyVariableChange } from './ApplyVariableChange';
import {
  addDefaultLightToAllLayers,
  addDefaultLightToLayer,
} from '../ProjectCreation/CreateProject';
import { retryIfFailed } from '../Utils/RetryIfFailed';
import newNameGenerator from '../Utils/NewNameGenerator';
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';
import PixiResourcesLoader from '../ObjectsRendering/PixiResourcesLoader';
import { swapAsset } from '../AssetStore/AssetSwapper';

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

export type EditorFunctionGenericOutput = {|
  success: boolean,
  meta?: {
    newSceneNames?: Array<string>,
  },
  message?: string,
  eventsAsText?: string,
  objectName?: string,
  behaviorName?: string,
  properties?: any,
  sharedProperties?: any,
  instances?: any,
  layers?: any,
  behaviors?: Array<SimplifiedBehavior>,
  animationNames?: string,
  generatedEventsErrorDiagnostics?: string,
  aiGeneratedEventId?: string,
  warnings?: string,

  initializedProject?: boolean,
  initializedFromTemplateSlug?: string,
  eventsAsTextByScene?: { [string]: string },

  // Used for de-duplication of outputs:
  eventsForSceneNamed?: string,
  instancesForSceneNamed?: string,
  instancesOnlyForObjectsNamed?: string, // Must be combined with `instancesForSceneNamed`.
  propertiesLayersEffectsForSceneNamed?: string,
  objectPropertiesDeduplicationKey?: string,
|};

export type EventsGenerationResult =
  | {|
      generationCompleted: true,
      aiGeneratedEvent: AiGeneratedEvent,
    |}
  | {|
      generationCompleted: false,
      errorMessage: string,
    |};

export type EventsGenerationOptions = {|
  sceneName: string,
  eventsDescription: string,
  extensionNamesList: string,
  objectsList: string,
  existingEventsAsText: string,
  placementHint: string,
|};

export type AssetSearchAndInstallResult = {|
  status: 'asset-installed' | 'nothing-found' | 'error',
  message: string,
  createdObjects: Array<gdObject>,
  assetShortHeader: AssetShortHeader | null,
|};

export type AssetSearchAndInstallOptions = {|
  scene: gdLayout,
  objectName: string,
  objectType: string,
  searchTerms: string,
  description: string,
  twoDimensionalViewKind: string,
|};

export type EditorCallbacks = {|
  onOpenLayout: (
    sceneName: string,
    options: {|
      openEventsEditor: boolean,
      openSceneEditor: boolean,
      focusWhenOpened:
        | 'scene-or-events-otherwise'
        | 'scene'
        | 'events'
        | 'none',
    |}
  ) => void,
  onCreateProject: ({|
    name: string,
    exampleSlug: string | null,
  |}) => Promise<{|
    createdProject: gdProject | null,
    exampleSlug: string | null,
  |}>,
|};

export type SceneEventsOutsideEditorChanges = {|
  scene: gdLayout,
  newOrChangedAiGeneratedEventIds: Set<string>,
|};

export type InstancesOutsideEditorChanges = {|
  scene: gdLayout,
|};

type RenderForEditorOptions = {|
  project: gdProject | null,
  args: any,
  editorCallbacks: EditorCallbacks,
  shouldShowDetails: boolean,
|};

type LaunchFunctionOptionsWithoutProject = {|
  args: any,
  editorCallbacks: EditorCallbacks,
  generateEvents: (
    options: EventsGenerationOptions
  ) => Promise<EventsGenerationResult>,
  onSceneEventsModifiedOutsideEditor: (
    changes: SceneEventsOutsideEditorChanges
  ) => void,
  onInstancesModifiedOutsideEditor: (
    changes: InstancesOutsideEditorChanges
  ) => void,
  ensureExtensionInstalled: (options: {|
    extensionName: string,
  |}) => Promise<void>,
  searchAndInstallAsset: (
    options: AssetSearchAndInstallOptions
  ) => Promise<AssetSearchAndInstallResult>,
|};

type LaunchFunctionOptionsWithProject = {|
  ...LaunchFunctionOptionsWithoutProject,
  project: gdProject,
|};

/**
 * A function that does something in the editor on the given project.
 */
export type EditorFunction = {|
  renderForEditor: (
    options: RenderForEditorOptions
  ) => {|
    text: React.Node,
    details?: ?React.Node,
    hasDetailsToShow?: boolean,
  |},
  launchFunction: (
    options: LaunchFunctionOptionsWithProject
  ) => Promise<EditorFunctionGenericOutput>,
|};

/**
 * A function that does something in the editor.
 */
export type EditorFunctionWithoutProject = {|
  renderForEditor: (
    options: RenderForEditorOptions
  ) => {|
    text: React.Node,
    details?: ?React.Node,
    hasDetailsToShow?: boolean,
  |},
  launchFunction: (
    options: LaunchFunctionOptionsWithoutProject
  ) => Promise<EditorFunctionGenericOutput>,
|};

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

const makeGenericFailure = (message: string): EditorFunctionGenericOutput => ({
  success: false,
  message,
});

const makeGenericSuccess = (message: string): EditorFunctionGenericOutput => ({
  success: true,
  message,
});

const makeMultipleChangesOutput = (
  changes: Array<string>,
  warnings: Array<string>
): EditorFunctionGenericOutput => {
  if (changes.length === 0 && warnings.length === 0) {
    return {
      success: false,
      message: 'No changes were made.',
    };
  } else if (changes.length === 0 && warnings.length > 0) {
    return {
      success: false,
      message: [
        'No changes were made because of these issues:',
        ...warnings,
      ].join('\n'),
    };
  } else if (changes.length > 0 && warnings.length === 0) {
    return {
      success: true,
      message: ['Successfully done the changes.', ...changes].join('\n'),
    };
  }

  return {
    success: true,
    message: [
      'Successfully done some changes but some issues were found - see the warnings.',
      ...changes,
      ...warnings,
    ].join('\n'),
  };
};

const shouldHideProperty = (property: gdPropertyDescriptor): boolean => {
  return (
    property.isHidden() ||
    property.isDeprecated() ||
    property.getType() === 'Behavior' // No need to mess around with the "required behaviors", they are automatically filled.
  );
};

const serializeNamedProperty = (
  name: string,
  property: gdPropertyDescriptor
): null | {} => {
  return {
    name,
    ...serializeToJSObject(property),
    group: undefined,
    quickCustomizationVisibility: undefined,
    advanced: undefined,
  };
};

const findPropertyByName = ({
  properties,
  name,
}: {|
  properties: gdMapStringPropertyDescriptor | null,
  name: string,
|}): {|
  foundProperty: gdPropertyDescriptor | null,
  foundPropertyName: string | null,
|} => {
  if (!properties)
    return {
      foundProperty: null,
      foundPropertyName: null,
    };

  const propertyNames = properties.keys().toJSArray();
  const foundPropertyName =
    propertyNames.find(
      propertyName => propertyName.toLowerCase() === name.toLowerCase()
    ) || null;
  const foundProperty = foundPropertyName
    ? properties.get(foundPropertyName)
    : null;
  return {
    foundProperty,
    foundPropertyName,
  };
};

const sanitizePropertyNewValue = (
  property: gdPropertyDescriptor | null,
  newValue: string
): string => {
  // Note: updateProperty expect the booleans in an usual "0" or "1" format.
  if (property && property.getType().toLowerCase() === 'boolean') {
    const lowerCaseNewValue = newValue.toLowerCase();
    return lowerCaseNewValue === 'true' ||
      lowerCaseNewValue === 'yes' ||
      lowerCaseNewValue === '1'
      ? '1'
      : '0';
  }
  return newValue;
};

const makeShortTextForNamedProperty = (
  name: string,
  property: gdPropertyDescriptor
): string => {
  const type = property.getType();
  const measurementUnit = property.getMeasurementUnit();
  const measurementUnitText = measurementUnit.isUndefined()
    ? null
    : measurementUnit.getName();
  const value = property.getValue();

  if (type.toLowerCase() === 'number') {
    return `${name}: ${value} ${
      measurementUnitText ? `(${measurementUnitText})` : ''
    }`;
  }

  const choices =
    type.toLowerCase() === 'choice'
      ? [
          ...mapVector(property.getChoices(), choice => choice.getValue()),
          // TODO Remove this once we made sure no built-in extension still use `addExtraInfo` instead of `addChoice`.
          ...property.getExtraInfo().toJSArray(),
        ]
      : null;
  const information = [
    type,
    choices
      ? `one of: [${choices.map(choice => `"${choice}"`).join(', ')}]`
      : null,
    measurementUnitText,
  ].filter(Boolean);

  return `${name}: ${value} (${information.join(', ')})`;
};

const listLabelAndValuesFromChangedProperties = (
  changed_properties: Array<any>
) => {
  return changed_properties
    .map(changed_property => {
      const propertyName = SafeExtractor.extractStringProperty(
        changed_property,
        'property_name'
      );
      const newValue = SafeExtractor.extractStringProperty(
        changed_property,
        'new_value'
      );
      if (propertyName === null || newValue === null) {
        return null;
      }
      return {
        label: propertyName,
        newValue: newValue,
      };
    })
    .filter(Boolean);
};

/**
 * Creates a new object in the specified scene
 */
const createOrReplaceObject: EditorFunction = {
  renderForEditor: ({ args, editorCallbacks }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const object_name = extractRequiredString(args, 'object_name');
    const replaceExistingObject = SafeExtractor.extractBooleanProperty(
      args,
      'replace_existing_object'
    );

    return {
      text: replaceExistingObject ? (
        <Trans>
          Replace object <b>{object_name}</b> in scene{' '}
          <Link
            href="#"
            onClick={() =>
              editorCallbacks.onOpenLayout(scene_name, {
                openEventsEditor: true,
                openSceneEditor: true,
                focusWhenOpened: 'scene',
              })
            }
          >
            {scene_name}
          </Link>
          .
        </Trans>
      ) : (
        <Trans>
          Create object <b>{object_name}</b> in scene{' '}
          <Link
            href="#"
            onClick={() =>
              editorCallbacks.onOpenLayout(scene_name, {
                openEventsEditor: true,
                openSceneEditor: true,
                focusWhenOpened: 'scene',
              })
            }
          >
            {scene_name}
          </Link>
          .
        </Trans>
      ),
    };
  },
  launchFunction: async ({
    project,
    args,
    ensureExtensionInstalled,
    searchAndInstallAsset,
  }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const object_type = extractRequiredString(args, 'object_type');
    const object_name = extractRequiredString(args, 'object_name');
    const shouldReplaceExistingObject = SafeExtractor.extractBooleanProperty(
      args,
      'replace_existing_object'
    );
    const description = SafeExtractor.extractStringProperty(
      args,
      'description'
    );
    const search_terms = SafeExtractor.extractStringProperty(
      args,
      'search_terms'
    );
    const two_dimensional_view_kind = SafeExtractor.extractStringProperty(
      args,
      'two_dimensional_view_kind'
    );

    if (!project.hasLayoutNamed(scene_name)) {
      return makeGenericFailure(`Scene not found: "${scene_name}".`);
    }

    const layout = project.getLayout(scene_name);
    const objectsContainer = layout.getObjects();

    const getPropertiesText = (object: gdObject): string => {
      const objectConfiguration = object.getConfiguration();
      const properties = objectConfiguration.getProperties();
      const propertyShortTexts = properties
        .keys()
        .toJSArray()
        .map(
          (name: string): string | null => {
            const propertyDescriptor = properties.get(name);
            if (shouldHideProperty(propertyDescriptor)) return null;

            return makeShortTextForNamedProperty(name, propertyDescriptor);
          }
        )
        .filter(Boolean);

      const propertiesText = `It has the following properties: ${propertyShortTexts.join(
        ', '
      )}.`;
      return propertiesText;
    };

    const createNewObject = async () => {
      // First try to search and install an object from the asset store.
      try {
        const { status, message, createdObjects } = await searchAndInstallAsset(
          {
            scene: layout,
            objectName: object_name,
            objectType: object_type,
            searchTerms: search_terms || '',
            description: description || '',
            twoDimensionalViewKind: two_dimensional_view_kind || '',
          }
        );

        if (status === 'error') {
          return makeGenericFailure(
            `Unable to search and install object (${message}).`
          );
        } else if (status === 'asset-installed') {
          if (createdObjects.length === 1) {
            const object = createdObjects[0];
            return makeGenericSuccess(
              [
                `Created (from the asset store) object "${object.getName()}" of type "${object.getType()}" in scene "${scene_name}".`,
                getPropertiesText(object),
              ].join(' ')
            );
          }

          return makeGenericSuccess(
            `Created (from the asset store) ${createdObjects
              .map(
                object =>
                  `object "${object.getName()}" of type "${object.getType()}"`
              )
              .join(', ')} in scene "${scene_name}".`
          );
        } else {
          // No asset found - we'll create an object from scratch.
        }
      } catch (error) {
        return makeGenericFailure(
          `An unexpected error happened while search and installing objects (${
            error.message
          }).`
        );
      }

      // Create an object from scratch:
      // Ensure the extension for this object type is installed.
      if (object_type.includes('::')) {
        const extensionName = object_type.split('::')[0];
        try {
          await ensureExtensionInstalled({ extensionName });
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

      // Ensure the object type is valid.
      const objectMetadata = gd.MetadataProvider.getObjectMetadata(
        project.getCurrentPlatform(),
        object_type
      );
      if (gd.MetadataProvider.isBadObjectMetadata(objectMetadata)) {
        return makeGenericFailure(
          `Type "${object_type}" does not exist for objects.`
        );
      }

      const object = objectsContainer.insertNewObject(
        project,
        object_type,
        object_name,
        objectsContainer.getObjectsCount()
      );
      return makeGenericSuccess(
        [
          `Created a new object (from scratch) called "${object_name}" of type "${object_type}" in scene "${scene_name}".`,
          getPropertiesText(object),
        ].join(' ')
      );
    };

    const replaceExistingObject = async () => {
      const object = objectsContainer.getObject(object_name);

      // First try to search and install an object from the asset store.
      try {
        const replacementObjectName = newNameGenerator(
          object_name + 'Replacement',
          name => objectsContainer.hasObjectNamed(name)
        );
        const {
          status,
          message,
          createdObjects,
          assetShortHeader,
        } = await searchAndInstallAsset({
          scene: layout,
          objectName: replacementObjectName,
          objectType: object_type,
          searchTerms: search_terms || '',
          description: description || '',
          twoDimensionalViewKind: two_dimensional_view_kind || '',
        });

        if (status === 'error') {
          // TODO
          return makeGenericFailure(
            `Unable to search and install object (${message}).`
          );
        } else if (
          status === 'asset-installed' &&
          createdObjects.length > 0 &&
          assetShortHeader
        ) {
          swapAsset(
            project,
            PixiResourcesLoader,
            object,
            createdObjects[0],
            assetShortHeader
          );

          for (const createdObject of createdObjects) {
            objectsContainer.removeObject(createdObject.getName());
          }

          return makeGenericSuccess(
            `Replaced object "${object.getName()}" by an object from the asset store fitting the search.`
          );
        } else {
          // No asset found.
        }
      } catch (error) {
        return makeGenericFailure(
          `An unexpected error happened while search and installing objects (${
            error.message
          }).`
        );
      }

      return makeGenericFailure(
        `Could not find an object in the asset store to replace "${object_name}" in scene "${scene_name}". Instead, inspect properties of the object and modify it until it matches what you want it to be.`
      );
    };

    if (!shouldReplaceExistingObject) {
      // Add a new object.
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

      return createNewObject();
    } else {
      // Replace an existing object, if there is one existing.
      if (!objectsContainer.hasObjectNamed(object_name)) {
        return createNewObject();
      }

      return replaceExistingObject();
    }
  },
};

/**
 * Retrieves the properties of a specific object in a scene
 */
const inspectObjectProperties: EditorFunction = {
  renderForEditor: ({ args, editorCallbacks }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const object_name = extractRequiredString(args, 'object_name');

    return {
      text: (
        <Trans>
          Inspecting properties of object <b>{object_name}</b> in scene{' '}
          <Link
            href="#"
            onClick={() =>
              editorCallbacks.onOpenLayout(scene_name, {
                openEventsEditor: true,
                openSceneEditor: true,
                focusWhenOpened: 'scene',
              })
            }
          >
            {scene_name}
          </Link>
          .
        </Trans>
      ),
    };
  },
  launchFunction: async ({ project, args }) => {
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
        if (shouldHideProperty(propertyDescriptor)) return null;

        return serializeNamedProperty(name, propertyDescriptor);
      })
      .filter(Boolean);

    // Also include information about behaviors:
    const behaviors = object
      .getAllBehaviorNames()
      .toJSArray()
      .map(behaviorName => {
        const behavior = object.getBehavior(behaviorName);
        return {
          behaviorName: behaviorName,
          behaviorType: behavior.getTypeName(),
        };
      });

    // Also include information about animations:
    const animationNames = mapFor(
      0,
      objectConfiguration.getAnimationsCount(),
      i => {
        return (
          objectConfiguration.getAnimationName(i) ||
          `(animation without name, animation index is: ${i})`
        );
      }
    );

    const output: EditorFunctionGenericOutput = {
      success: true,
      objectName: object_name,
      properties,
      behaviors,
      objectPropertiesDeduplicationKey: [scene_name, object_name]
        .filter(Boolean)
        .join('-'),
    };
    if (animationNames.length > 0) {
      output.animationNames = animationNames.join(', ');
    }

    return output;
  },
};

const isPropertyForChangingObjectName = (propertyName: string): boolean => {
  return (
    propertyName.toLowerCase() === 'name' ||
    propertyName.toLowerCase().replace(/-|_| /, '') === 'objectname'
  );
};

/**
 * Changes a property of a specific object in a scene
 */
const changeObjectProperty: EditorFunction = {
  renderForEditor: ({ project, shouldShowDetails, args, editorCallbacks }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const object_name = extractRequiredString(args, 'object_name');
    const changed_properties =
      SafeExtractor.extractArrayProperty(args, 'changed_properties') || [];

    const renderChanges = (
      changes: Array<{ label: string, newValue: string }>
    ) => {
      if (changes.length === 1) {
        const { label, newValue } = changes[0];
        return {
          text:
            label === 'name' ? (
              <Trans>
                Rename object "{object_name}" to "<b>{newValue}</b>"" (in scene{' '}
                {scene_name}).
              </Trans>
            ) : (
              <Trans>
                Change property "<b>{label}</b>" of object <b>{object_name}</b>{' '}
                (in scene {scene_name}) to <b>{newValue}</b>.
              </Trans>
            ),
        };
      }

      return {
        text: (
          <Trans>
            Change {changes.length} properties of object {object_name} (in scene{' '}
            {scene_name}).
          </Trans>
        ),
        hasDetailsToShow: true,
        details: shouldShowDetails ? (
          <ColumnStackLayout noMargin>
            {changes.map(change =>
              change.label === 'name' ? (
                <Text key={change.label} noMargin>
                  Renamed object to {change.newValue}.
                </Text>
              ) : (
                <Text key={change.label} noMargin>
                  <b>{change.label}</b> set to {change.newValue}.
                </Text>
              )
            )}
          </ColumnStackLayout>
        ) : null,
      };
    };

    if (!project || !project.hasLayoutNamed(scene_name)) {
      return renderChanges(
        listLabelAndValuesFromChangedProperties(changed_properties)
      );
    }

    const layout = project.getLayout(scene_name);
    const objectsContainer = layout.getObjects();

    if (!objectsContainer.hasObjectNamed(object_name)) {
      return renderChanges(
        listLabelAndValuesFromChangedProperties(changed_properties)
      );
    }

    const object = objectsContainer.getObject(object_name);
    const objectConfiguration = object.getConfiguration();
    const objectProperties = objectConfiguration.getProperties();

    const changes = changed_properties
      .map(changed_property => {
        const propertyName = SafeExtractor.extractStringProperty(
          changed_property,
          'property_name'
        );
        const newValue = SafeExtractor.extractStringProperty(
          changed_property,
          'new_value'
        );
        if (propertyName === null || newValue === null) {
          return null;
        }

        if (isPropertyForChangingObjectName(propertyName)) {
          return {
            label: 'name',
            newValue: newValue,
          };
        }

        const { foundProperty } = findPropertyByName({
          properties: objectProperties,
          name: propertyName,
        });

        return {
          label: foundProperty ? foundProperty.getLabel() : propertyName,
          newValue: newValue,
        };
      })
      .filter(Boolean);

    return renderChanges(changes);
  },
  launchFunction: async ({ project, args }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const object_name = extractRequiredString(args, 'object_name');
    const changed_properties =
      SafeExtractor.extractArrayProperty(args, 'changed_properties') || [];

    if (!project.hasLayoutNamed(scene_name)) {
      return makeGenericFailure(`Scene not found: "${scene_name}".`);
    }

    const layout = project.getLayout(scene_name);

    let isGlobalObject = false;
    let object: gdObject | null = null;

    if (layout.getObjects().hasObjectNamed(object_name)) {
      object = layout.getObjects().getObject(object_name);
    } else if (project.getObjects().hasObjectNamed(object_name)) {
      object = project.getObjects().getObject(object_name);
      isGlobalObject = true;
    }

    if (!object) {
      return makeGenericFailure(
        `Object not found: "${object_name}" in scene "${scene_name}", nor in the global objects.`
      );
    }

    const warnings = [];
    const changes = [];

    changed_properties.forEach(changed_property => {
      if (!object) return;

      const propertyName = SafeExtractor.extractStringProperty(
        changed_property,
        'property_name'
      );
      const newValue = SafeExtractor.extractStringProperty(
        changed_property,
        'new_value'
      );
      if (propertyName === null || newValue === null) {
        warnings.push(
          `Missing "property_name" or "new_value" in an item of \`changed_properties\`: ${JSON.stringify(
            changed_property
          )}. It was ignored and not changed.`
        );
        return;
      }

      // Renaming an object is a special case by using a property called "name".
      if (isPropertyForChangingObjectName(propertyName)) {
        if (object.getName() === newValue) {
          changes.push(
            `Object "${object_name}" already has the name "${newValue}", no need to rename it. Continue assuming this name is correct and valid.`
          );
          return;
        }

        const objectsContainersList = gd.ObjectsContainersList.makeNewObjectsContainersListForProjectAndLayout(
          project,
          layout
        );

        const newName = newNameGenerator(
          gd.Project.getSafeName(newValue),
          tentativeNewName =>
            objectsContainersList.hasObjectOrGroupNamed(tentativeNewName)
        );

        if (layout) {
          if (isGlobalObject) {
            gd.WholeProjectRefactorer.globalObjectOrGroupRenamed(
              project,
              object.getName(),
              newName,
              /* isObjectGroup=*/ false
            );
          } else {
            gd.WholeProjectRefactorer.objectOrGroupRenamedInScene(
              project,
              layout,
              object.getName(),
              newName,
              /* isObjectGroup=*/ false
            );
          }
        }
        // Note: gd.WholeProjectRefactorer.objectOrGroupRenamedInEventsBasedObject to be added here
        // if events-based objects can be handled by AI one day.

        object.setName(newName);

        changes.push(
          `Renamed object "${object_name}" to "${newName}". Events and everything else refering to this object having been also updated. Continue assuming the object has now the name "${newName}" and the whole project has been updated for it.`
        );
        return;
      }

      // Changing a "usual" property of an object:
      const objectConfiguration = object.getConfiguration();
      const objectProperties = objectConfiguration.getProperties();

      const { foundPropertyName, foundProperty } = findPropertyByName({
        properties: objectProperties,
        name: propertyName,
      });

      if (!foundPropertyName) {
        warnings.push(
          `Property not found: ${propertyName} on object ${object_name}.`
        );
        return;
      }

      if (
        !objectConfiguration.updateProperty(
          foundPropertyName,
          sanitizePropertyNewValue(foundProperty, newValue)
        )
      ) {
        warnings.push(
          `Could not change property "${foundPropertyName}" of object "${object_name}". The value might be invalid, of the wrong type or not allowed.`
        );
        return;
      }

      changes.push(
        `Changed property "${foundPropertyName}" of object "${object_name}" to "${newValue}".`
      );
    });

    return makeMultipleChangesOutput(changes, warnings);
  },
};

/**
 * Adds a behavior to an object in a scene
 */
const addBehavior: EditorFunction = {
  renderForEditor: ({ project, args, editorCallbacks }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const object_name = extractRequiredString(args, 'object_name');
    const behavior_type = extractRequiredString(args, 'behavior_type');
    const optionalBehaviorName = SafeExtractor.extractStringProperty(
      args,
      'behavior_name'
    );

    const makeText = (behaviorTypeLabel: string) => {
      return {
        text: (
          <Trans>
            Add behavior {behaviorName} (<b>{behaviorTypeLabel}</b>) on object{' '}
            <b>{object_name}</b> in scene{' '}
            <Link
              href="#"
              onClick={() =>
                editorCallbacks.onOpenLayout(scene_name, {
                  openEventsEditor: true,
                  openSceneEditor: true,
                  focusWhenOpened: 'scene',
                })
              }
            >
              {scene_name}
            </Link>
            .
          </Trans>
        ),
      };
    };

    if (!project) {
      return makeText(behavior_type);
    }

    const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
      project.getCurrentPlatform(),
      behavior_type
    );
    if (gd.MetadataProvider.isBadBehaviorMetadata(behaviorMetadata)) {
      return makeText(behavior_type);
    }

    // In almost all cases, we should use the behavior default name (especially because it
    // allows to share the same behavior shared data between objects).
    const behaviorName =
      optionalBehaviorName || behaviorMetadata.getDefaultName();

    return makeText(behaviorMetadata.getFullName());
  },
  launchFunction: async ({ project, args, ensureExtensionInstalled }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const object_name = extractRequiredString(args, 'object_name');
    const behavior_type = extractRequiredString(args, 'behavior_type');
    const optionalBehaviorName = SafeExtractor.extractStringProperty(
      args,
      'behavior_name'
    );

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

    // Ensure the extension for this behavior is installed.
    if (behavior_type.includes('::')) {
      const extensionName = behavior_type.split('::')[0];
      try {
        await ensureExtensionInstalled({ extensionName });
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

    // In almost all cases, we should use the behavior default name (especially because it
    // allows to share the same behavior shared data between objects).
    const behaviorName =
      optionalBehaviorName || behaviorMetadata.getDefaultName();

    // Check if behavior with this name already exists
    if (object.hasBehaviorNamed(behaviorName)) {
      const behavior = object.getBehavior(behaviorName);
      if (behavior.getTypeName() !== behavior_type) {
        return makeGenericFailure(
          `Behavior with name "${behaviorName}" already exists on object "${object_name}" but with a different type ("${behavior_type}").`
        );
      }

      return makeGenericSuccess(
        `Behavior with name "${behaviorName}" already exists on object "${object_name}", no need to re-create it.`
      );
    }

    if (isBehaviorDefaultCapability(behaviorMetadata)) {
      const alreadyHasDefaultCapability = object
        .getAllBehaviorNames()
        .toJSArray()
        .some(behaviorName => {
          const behavior = object.getBehavior(behaviorName);
          return behavior.getTypeName() === behavior_type;
        });
      if (alreadyHasDefaultCapability) {
        return makeGenericSuccess(
          `Behavior "${behaviorName}" of type "${behavior_type}" is a default capability and is already available on object "${object_name}". There is no need to add it (and it can't be removed).`
        );
      }

      return makeGenericFailure(
        `Behavior "${behaviorName}" of type "${behavior_type}" is a default capability and cannot be added to object "${object_name}".`
      );
    }

    // Add the behavior
    gd.WholeProjectRefactorer.addBehaviorAndRequiredBehaviors(
      project,
      object,
      behavior_type,
      behaviorName
    );
    if (!object.hasBehaviorNamed(behaviorName)) {
      return makeGenericFailure(
        `Unexpected error: behavior "${behaviorName}" was not added to object "${object_name}" despite a valid type and name.`
      );
    }
    layout.updateBehaviorsSharedData(project);

    const behavior = object.getBehavior(behaviorName);

    const behaviorProperties = behavior.getProperties();
    const propertyShortTexts = behaviorProperties
      .keys()
      .toJSArray()
      .map(
        (name: string): string | null => {
          const propertyDescriptor = behaviorProperties.get(name);
          if (shouldHideProperty(propertyDescriptor)) return null;

          return makeShortTextForNamedProperty(name, propertyDescriptor);
        }
      )
      .filter(Boolean);

    const propertiesText = `It has the following properties: ${propertyShortTexts.join(
      ', '
    )}.`;

    return makeGenericSuccess(
      [
        `Added behavior called "${behaviorName}" with type "${behavior_type}" to object "${object_name}".`,
        propertiesText,
      ].join(' ')
    );
  },
};

/**
 * Removes a behavior from an object in a scene
 */
const removeBehavior: EditorFunction = {
  renderForEditor: ({ args }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const object_name = extractRequiredString(args, 'object_name');
    const behavior_name = extractRequiredString(args, 'behavior_name');

    return {
      text: (
        <Trans>
          Remove behavior {behavior_name} from object {object_name} in scene{' '}
          {scene_name}.
        </Trans>
      ),
    };
  },
  launchFunction: async ({ project, args }) => {
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
        `Behavior not found: "${behavior_name}" on object "${object_name}". So it was not removed.`
      );
    }

    const dependentBehaviors = gd.WholeProjectRefactorer.findDependentBehaviorNames(
      project,
      object,
      behavior_name
    ).toJSArray();

    // Remove the behavior
    object.removeBehavior(behavior_name);
    dependentBehaviors.forEach(name => object.removeBehavior(name));

    return makeGenericSuccess(
      dependentBehaviors.length > 0
        ? `Removed behavior "${behavior_name}" from object "${object_name}". Dependent behaviors were also removed as they were based on this behavior: ${dependentBehaviors.join(
            ', '
          )}.`
        : `Removed behavior "${behavior_name}" from object "${object_name}".`
    );
  },
};

/**
 * Retrieves the properties of a specific behavior attached to an object
 */
const inspectBehaviorProperties: EditorFunction = {
  renderForEditor: ({ args }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const object_name = extractRequiredString(args, 'object_name');
    const behavior_name = extractRequiredString(args, 'behavior_name');

    return {
      text: (
        <Trans>
          Inspecting properties of behavior {behavior_name} on object{' '}
          {object_name} in scene {scene_name}.
        </Trans>
      ),
    };
  },
  launchFunction: async ({ project, args }) => {
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
        if (shouldHideProperty(propertyDescriptor)) return null;

        return serializeNamedProperty(name, propertyDescriptor);
      })
      .filter(Boolean);

    const allBehaviorSharedDataNames = layout
      .getAllBehaviorSharedDataNames()
      .toJSArray();

    let sharedProperties = undefined;
    if (allBehaviorSharedDataNames.includes(behavior_name)) {
      const behaviorSharedData = layout.getBehaviorSharedData(behavior_name);
      const behaviorSharedDataProperties = behaviorSharedData.getProperties();
      const behaviorSharedDataPropertyNames = behaviorSharedDataProperties
        .keys()
        .toJSArray();
      sharedProperties = behaviorSharedDataPropertyNames
        .map(name => {
          const propertyDescriptor = behaviorSharedDataProperties.get(name);
          if (shouldHideProperty(propertyDescriptor)) return null;

          return serializeNamedProperty(name, propertyDescriptor);
        })
        .filter(Boolean);
    }

    return {
      success: true,
      behaviorName: behavior_name,
      properties: properties,
      sharedProperties,
    };
  },
};

/**
 * Changes a property of a specific behavior attached to an object
 */
const changeBehaviorProperty: EditorFunction = {
  renderForEditor: ({ project, shouldShowDetails, args, editorCallbacks }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const object_name = extractRequiredString(args, 'object_name');
    const behavior_name = extractRequiredString(args, 'behavior_name');
    const changed_properties =
      SafeExtractor.extractArrayProperty(args, 'changed_properties') || [];

    const renderChanges = (
      changes: Array<{ label: string, newValue: string }>
    ) => {
      if (changes.length === 1) {
        const { label, newValue } = changes[0];
        return {
          text: (
            <Trans>
              Change property "<b>{label}</b>" of behavior {behavior_name} on
              object <b>{object_name}</b> (in scene{' '}
              <Link
                href="#"
                onClick={() =>
                  editorCallbacks.onOpenLayout(scene_name, {
                    openEventsEditor: true,
                    openSceneEditor: true,
                    focusWhenOpened: 'scene',
                  })
                }
              >
                {scene_name}
              </Link>
              ) to <b>{newValue}</b>.
            </Trans>
          ),
        };
      }

      return {
        text: (
          <Trans>
            Changed {changes.length} properties of behavior {behavior_name} on
            object {object_name} (in scene {scene_name}).
          </Trans>
        ),
        hasDetailsToShow: true,
        details: shouldShowDetails ? (
          <ColumnStackLayout noMargin>
            {changes.map(change => (
              <Text key={change.label} noMargin>
                <b>{change.label}</b> set to {change.newValue}.
              </Text>
            ))}
          </ColumnStackLayout>
        ) : null,
      };
    };

    if (!project || !project.hasLayoutNamed(scene_name)) {
      return renderChanges(
        listLabelAndValuesFromChangedProperties(changed_properties)
      );
    }

    const layout = project.getLayout(scene_name);
    const objectsContainer = layout.getObjects();

    if (!objectsContainer.hasObjectNamed(object_name)) {
      return renderChanges(
        listLabelAndValuesFromChangedProperties(changed_properties)
      );
    }

    const object = objectsContainer.getObject(object_name);

    if (!object.hasBehaviorNamed(behavior_name)) {
      return renderChanges(
        listLabelAndValuesFromChangedProperties(changed_properties)
      );
    }

    const behavior = object.getBehavior(behavior_name);
    const behaviorProperties = behavior.getProperties();

    const allBehaviorSharedDataNames = layout
      .getAllBehaviorSharedDataNames()
      .toJSArray();

    let behaviorSharedDataProperties = null;
    if (allBehaviorSharedDataNames.includes(behavior_name)) {
      const behaviorSharedData = layout.getBehaviorSharedData(behavior_name);
      behaviorSharedDataProperties = behaviorSharedData.getProperties();
    }

    const changes = changed_properties
      .map(changed_property => {
        const propertyName = SafeExtractor.extractStringProperty(
          changed_property,
          'property_name'
        );
        const newValue = SafeExtractor.extractStringProperty(
          changed_property,
          'new_value'
        );
        if (propertyName === null || newValue === null) {
          return null;
        }

        const behaviorPropertySearch = findPropertyByName({
          properties: behaviorProperties,
          name: propertyName,
        });

        const behaviorSharedDataPropertySearch = findPropertyByName({
          properties: behaviorSharedDataProperties,
          name: propertyName,
        });

        if (behaviorPropertySearch.foundProperty) {
          return {
            label: behaviorPropertySearch.foundProperty.getLabel(),
            newValue: newValue,
          };
        } else if (behaviorSharedDataPropertySearch.foundProperty) {
          return {
            label: behaviorSharedDataPropertySearch.foundProperty.getLabel(),
            newValue: newValue,
          };
        } else {
          return {
            label: propertyName,
            newValue: newValue,
          };
        }
      })
      .filter(Boolean);

    return renderChanges(changes);
  },
  launchFunction: async ({ project, args }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const object_name = extractRequiredString(args, 'object_name');
    const behavior_name = extractRequiredString(args, 'behavior_name');
    const changedProperties =
      SafeExtractor.extractArrayProperty(args, 'changed_properties') || [];

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

    const allBehaviorSharedDataNames = layout
      .getAllBehaviorSharedDataNames()
      .toJSArray();

    let behaviorSharedData = null;
    let behaviorSharedDataProperties = null;
    if (allBehaviorSharedDataNames.includes(behavior_name)) {
      behaviorSharedData = layout.getBehaviorSharedData(behavior_name);
      behaviorSharedDataProperties = behaviorSharedData.getProperties();
    }

    const warnings = [];
    const changes = [];

    changedProperties.forEach(changed_property => {
      const propertyName = SafeExtractor.extractStringProperty(
        changed_property,
        'property_name'
      );
      const newValue = SafeExtractor.extractStringProperty(
        changed_property,
        'new_value'
      );
      if (propertyName === null || newValue === null) {
        warnings.push(
          `Missing "property_name" or "new_value" in an item of \`changed_properties\`: ${JSON.stringify(
            changed_property
          )}. It was ignored and not changed.`
        );
        return;
      }

      const behaviorPropertySearch = findPropertyByName({
        properties: behaviorProperties,
        name: propertyName,
      });

      const behaviorSharedDataPropertySearch = findPropertyByName({
        properties: behaviorSharedDataProperties,
        name: propertyName,
      });

      if (behaviorPropertySearch.foundPropertyName) {
        const { foundPropertyName, foundProperty } = behaviorPropertySearch;
        if (
          !behavior.updateProperty(
            foundPropertyName,
            sanitizePropertyNewValue(foundProperty, newValue)
          )
        ) {
          warnings.push(
            `Could not change property "${foundPropertyName}" of behavior "${behavior_name}". The value might be invalid, of the wrong type or not allowed.`
          );
          return;
        }

        changes.push(
          `Changed property "${foundPropertyName}" of behavior "${behavior_name}" to "${newValue}".`
        );
      } else if (
        behaviorSharedData &&
        behaviorSharedDataPropertySearch.foundPropertyName
      ) {
        const {
          foundPropertyName,
          foundProperty,
        } = behaviorSharedDataPropertySearch;
        if (
          !behaviorSharedData.updateProperty(
            foundPropertyName,
            sanitizePropertyNewValue(foundProperty, newValue)
          )
        ) {
          warnings.push(
            `Could not change shared property "${foundPropertyName}" of behavior "${behavior_name}". The value might be invalid, of the wrong type or not allowed.`
          );
          return;
        }

        changes.push(
          `Changed property "${foundPropertyName}" of behavior "${behavior_name}" (shared between all objects having this behavior) to "${newValue}".`
        );
      } else {
        warnings.push(
          `Property "${propertyName}" not found on behavior "${behavior_name}" of object "${object_name}".`
        );
      }
    });

    return makeMultipleChangesOutput(changes, warnings);
  },
};

/**
 * Lists all object instances in a scene
 */
const describeInstances: EditorFunction = {
  renderForEditor: ({ args, editorCallbacks }) => {
    const scene_name = extractRequiredString(args, 'scene_name');

    return {
      text: (
        <Trans>
          Inspecting instances of scene{' '}
          <Link
            href="#"
            onClick={() =>
              editorCallbacks.onOpenLayout(scene_name, {
                openEventsEditor: true,
                openSceneEditor: true,
                focusWhenOpened: 'scene',
              })
            }
          >
            {scene_name}.
          </Link>
        </Trans>
      ),
    };
  },
  launchFunction: async ({ project, args }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const filter_by_object_name =
      SafeExtractor.extractStringProperty(args, 'filter_by_object_name') || '';

    const objectNames = new Set(
      filter_by_object_name
        .split(',')
        .map(name => name.trim().toLowerCase())
        .filter(Boolean)
    );

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
          if (
            objectNames.size > 0 &&
            !objectNames.has(instance.getObjectName().toLowerCase())
          ) {
            return;
          }

          const serializedInstance = serializeToJSObject(instance);
          instances.push({
            ...serializedInstance,
            // Replace persistentUuid by id:
            persistentUuid: undefined,
            id: instance.getPersistentUuid().slice(0, 10),
            // For now, don't expose these:
            initialVariables: undefined,
            numberProperties: undefined,
            stringProperties: undefined,
          });
        }
      );
    });

    if (objectNames.size > 0) {
      return {
        success: true,
        instances: instances,
        instancesForSceneNamed: scene_name,
        instancesOnlyForObjectsNamed: [...objectNames].sort().join(','),
      };
    } else {
      return {
        success: true,
        instances: instances,
        instancesForSceneNamed: scene_name,
      };
    }
  },
};

const iterateOnInstances = (initialInstances, callback) => {
  const instanceGetter = new gd.InitialInstanceJSFunctor();
  // $FlowFixMe - invoke is not writable
  instanceGetter.invoke = instancePtr => {
    // $FlowFixMe - wrapPointer is not exposed
    const instance: gdInitialInstance = gd.wrapPointer(
      instancePtr,
      gd.InitialInstance
    );
    callback(instance);
  };
  // $FlowFixMe - JSFunctor is incompatible with Functor
  initialInstances.iterateOverInstances(instanceGetter);
  instanceGetter.delete();
};

/**
 * Places new instance(s), or move/erase existing instances, of an existing object onto a specified 2D layer
 * within a scene using a virtual brush at given X, Y coordinates.
 * Can also be used to resize, rotate, change opacity or Z order of existing 2D instance(s).
 * Existing instances identifiers can be found by calling `describe_instances` (`id` field for each instance).
 */
const put2dInstances: EditorFunction = {
  renderForEditor: ({ args }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const object_name = SafeExtractor.extractStringProperty(
      args,
      'object_name'
    );
    const layer_name = extractRequiredString(args, 'layer_name');
    const brush_kind = extractRequiredString(args, 'brush_kind');
    const brush_position = SafeExtractor.extractStringProperty(
      args,
      'brush_position'
    );
    const existing_instance_ids = SafeExtractor.extractStringProperty(
      args,
      'existing_instance_ids'
    );
    const existingInstanceIds = existing_instance_ids
      ? existing_instance_ids.split(',')
      : [];
    const new_instances_count = SafeExtractor.extractNumberProperty(
      args,
      'new_instances_count'
    );
    const newInstancesCount =
      !new_instances_count && existingInstanceIds.length === 0
        ? 1
        : new_instances_count;

    const existingInstanceCount = existing_instance_ids
      ? existing_instance_ids.split(',').length
      : 0;
    const brushPosition = brush_position
      ? brush_position.split(',').map(Number)
      : null;

    if (brush_kind === 'erase') {
      return {
        text: (
          <Trans>
            Erase {existingInstanceCount} instance(s) in scene {scene_name}.
          </Trans>
        ),
      };
    }

    if (existingInstanceIds.length === 0) {
      return {
        text: (
          <Trans>
            Add {newInstancesCount} instance(s) of object {object_name} at{' '}
            {brushPosition ? (
              brushPosition.join(', ')
            ) : (
              <Trans>scene center</Trans>
            )}{' '}
            (layer: {layer_name || 'base'}) in scene {scene_name}.
          </Trans>
        ),
      };
    } else if (newInstancesCount === 0) {
      return {
        text: (
          <Trans>
            Move {existingInstanceCount} instance(s) of object {object_name} to{' '}
            {brushPosition ? (
              brushPosition.join(', ')
            ) : (
              <Trans>scene center</Trans>
            )}{' '}
            (layer: {layer_name || 'base'}) in scene {scene_name}.
          </Trans>
        ),
      };
    } else {
      return {
        text: (
          <Trans>
            Add {newInstancesCount} instance(s) and move {existingInstanceCount}{' '}
            instance(s) of object {object_name} to{' '}
            {brushPosition ? (
              brushPosition.join(', ')
            ) : (
              <Trans>scene center</Trans>
            )}{' '}
            (layer: {layer_name || 'base'}) in scene {scene_name}.
          </Trans>
        ),
      };
    }
  },
  launchFunction: async ({
    project,
    args,
    onInstancesModifiedOutsideEditor,
  }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const object_name = SafeExtractor.extractStringProperty(
      args,
      'object_name'
    );
    const layer_name = extractRequiredString(args, 'layer_name');
    const brush_kind = extractRequiredString(args, 'brush_kind');
    const brush_position = SafeExtractor.extractStringProperty(
      args,
      'brush_position'
    );
    const brush_size = SafeExtractor.extractNumberProperty(args, 'brush_size');
    const brush_end_position = SafeExtractor.extractStringProperty(
      args,
      'brush_end_position'
    );
    const existing_instance_ids = SafeExtractor.extractStringProperty(
      args,
      'existing_instance_ids'
    );
    const new_instances_count = SafeExtractor.extractNumberProperty(
      args,
      'new_instances_count'
    );
    const instances_z_order = SafeExtractor.extractNumberProperty(
      args,
      'instances_z_order'
    );
    const instances_size = SafeExtractor.extractStringProperty(
      args,
      'instances_size'
    );

    if (!project.hasLayoutNamed(scene_name)) {
      return makeGenericFailure(`Scene not found: "${scene_name}".`);
    }

    const layout = project.getLayout(scene_name);
    const objectsContainer = layout.getObjects();

    // Check if layer exists (empty string is allowed for base layer)
    if (layer_name !== '' && !layout.hasLayerNamed(layer_name)) {
      return makeGenericFailure(
        `Layer not found: ${layer_name} in scene "${scene_name}".`
      );
    }

    const existingInstanceIds = existing_instance_ids
      ? existing_instance_ids.split(',')
      : [];

    const initialInstances = layout.getInitialInstances();

    if (brush_kind === 'erase') {
      const brushPosition: Array<number> | null = brush_position
        ? brush_position.split(',').map(Number)
        : null;
      const brushSize = brush_size || 0;

      // Iterate on existing instances and remove them, and/or those inside the brush radius.
      const instancesToDelete = new Set();
      const notFoundExistingInstanceIds = new Set<string>(existingInstanceIds);

      iterateOnInstances(initialInstances, instance => {
        const foundExistingInstanceId = existingInstanceIds.find(id =>
          instance.getPersistentUuid().startsWith(id)
        );
        if (foundExistingInstanceId) {
          instancesToDelete.add(instance);
          notFoundExistingInstanceIds.delete(foundExistingInstanceId);
          return;
        }

        if (instance.getObjectName() !== object_name) return;

        if (!brushPosition) return;
        if (instance.getLayer() !== layer_name) return; // Layer must be the same as specified when deleting instances with a brush.

        if (brushSize === 0) {
          if (
            instance.getX() === brushPosition[0] &&
            instance.getY() === brushPosition[1]
          ) {
            instancesToDelete.add(instance);
            return;
          }
        } else {
          const distance = Math.sqrt(
            Math.pow(instance.getX() - brushPosition[0], 2) +
              Math.pow(instance.getY() - brushPosition[1], 2)
          );
          if (distance <= brushSize) {
            instancesToDelete.add(instance);
            return;
          }
        }
      });

      instancesToDelete.forEach(instance => {
        initialInstances.removeInstance(instance);
      });

      // /!\ Tell the editor that some instances have potentially been modified (and even removed).
      // This will force the instances editor to destroy and mount again the
      // renderers to avoid keeping any references to existing instances, and also drop any selection.
      onInstancesModifiedOutsideEditor({
        scene: layout,
      });
      return makeGenericSuccess(
        [
          `Erased ${instancesToDelete.size} instance${
            instancesToDelete.size > 1 ? 's' : ''
          }.`,
          notFoundExistingInstanceIds.size > 0
            ? `Could not find these instances to erase:
        ${Array.from(notFoundExistingInstanceIds).join(
          ', '
        )}. Verify the ids and layer names are ALWAYS exact and correct.`
            : '',
        ]
          .filter(Boolean)
          .join(' ')
      );
    } else {
      const brushPosition: Array<number> = brush_position
        ? brush_position.split(',').map(Number)
        : [
            project.getGameResolutionWidth() / 2,
            project.getGameResolutionHeight() / 2,
          ];
      const brushSize = brush_size || 0;
      const brushEndPosition = brush_end_position
        ? brush_end_position.split(',').map(Number)
        : null;

      // Compute the number of instances to create.
      const rowCount = SafeExtractor.extractNumberProperty(args, 'row_count');
      const columnCount = SafeExtractor.extractNumberProperty(
        args,
        'column_count'
      );

      let newInstancesCount =
        new_instances_count !== null ? new_instances_count : 0;
      if (newInstancesCount === 0 && existingInstanceIds.length === 0) {
        newInstancesCount =
          rowCount && columnCount ? rowCount * columnCount : 1;
      }

      // Track changes for detailed success message
      const changes = [];

      if (newInstancesCount > 0 && !object_name) {
        changes.push(
          `You've specified to create ${newInstancesCount} instances, but you didn't specify the object name. Please specify the object name.`
        );
      }

      if (
        object_name &&
        !objectsContainer.hasObjectNamed(object_name) &&
        !project.getObjects().hasObjectNamed(object_name)
      ) {
        return makeGenericFailure(
          `Object not found: "${object_name}" in scene "${scene_name}". Please only specify the object name of an object existing in the scene (or create if before if necessary).`
        );
      }

      // Store original states of existing instances for comparison
      const existingInstanceStates = new Map();
      const notFoundExistingInstanceIds = new Set<string>(existingInstanceIds);

      // Create the array of existing instances to move/modify, and new instances to create.
      const modifiedAndCreatedInstances: Array<gdInitialInstance> = [];
      iterateOnInstances(initialInstances, instance => {
        const foundExistingInstanceId = existingInstanceIds.find(id =>
          instance.getPersistentUuid().startsWith(id)
        );

        if (foundExistingInstanceId) {
          notFoundExistingInstanceIds.delete(foundExistingInstanceId);

          // Store original state before modifications
          existingInstanceStates.set(instance, {
            originalLayer: instance.getLayer(),
            originalX: instance.getX(),
            originalY: instance.getY(),
            originalZOrder: instance.getZOrder(),
            originalRotation: instance.getAngle(),
            originalOpacity: instance.getOpacity(),
            originalCustomWidth: instance.hasCustomSize()
              ? instance.getCustomWidth()
              : null,
            originalCustomHeight: instance.hasCustomSize()
              ? instance.getCustomHeight()
              : null,
          });

          modifiedAndCreatedInstances.push(instance);
          // Take the opportunity to move to a new layer if specified.
          if (instance.getLayer() !== layer_name) {
            instance.setLayer(layer_name);
          }
        }
      });

      for (let i = 0; i < newInstancesCount; i++) {
        const instance = initialInstances.insertNewInitialInstance();
        instance.setObjectName(object_name || '');
        instance.setLayer(layer_name);
        modifiedAndCreatedInstances.push(instance);
      }

      // Paint the new/modified instances with the brush.
      if (brush_kind === 'line') {
        const instancesCount = modifiedAndCreatedInstances.length;

        if (brushPosition && brushEndPosition) {
          const deltaX =
            instancesCount > 1
              ? (brushEndPosition[0] - brushPosition[0]) / (instancesCount - 1)
              : 0;
          const deltaY =
            instancesCount > 1
              ? (brushEndPosition[1] - brushPosition[1]) / (instancesCount - 1)
              : 0;

          modifiedAndCreatedInstances.forEach((instance, i) => {
            instance.setX(brushPosition[0] + i * deltaX);
            instance.setY(brushPosition[1] + i * deltaY);
          });
        }
      } else if (brush_kind === 'grid') {
        const instancesCount = modifiedAndCreatedInstances.length;

        if (brushPosition && brushEndPosition) {
          // Naively auto-compute the grid column and row count if not specified.
          const gridRowCount =
            rowCount || Math.floor(Math.sqrt(instancesCount));
          const gridRowSize =
            (brushEndPosition[0] - brushPosition[0]) / gridRowCount;
          const gridColumnCount =
            columnCount || Math.ceil(instancesCount / gridRowCount);
          const gridColumnSize =
            (brushEndPosition[1] - brushPosition[1]) / gridColumnCount;

          modifiedAndCreatedInstances.forEach((instance, i) => {
            const row = Math.floor(i / gridColumnCount);
            const column = i % gridColumnCount;

            instance.setX(brushPosition[0] + column * gridColumnSize);
            instance.setY(brushPosition[1] + row * gridRowSize);
          });
        }
      } else if (brush_kind === 'random_in_circle') {
        modifiedAndCreatedInstances.forEach(instance => {
          const randomRadius = Math.random() * brushSize;
          const randomAngle = Math.random() * 2 * Math.PI;

          instance.setX(
            brushPosition[0] + randomRadius * Math.cos(randomAngle)
          );
          instance.setY(
            brushPosition[1] + randomRadius * Math.sin(randomAngle)
          );
        });
      } else if (brush_kind === 'point') {
        modifiedAndCreatedInstances.forEach(instance => {
          instance.setX(brushPosition[0]);
          instance.setY(brushPosition[1]);
        });
      } else {
        if (brush_kind !== 'none') {
          console.warn(
            `Unknown brush kind: ${brush_kind} - assuming it's "none" instead.`
          );
          changes.push(
            'The brush kind is unknown and was considered to be "none" instead.'
          );
        }
      }

      const instancesSize = instances_size
        ? instances_size.split(',').map(Number)
        : null;
      const instancesRotation = SafeExtractor.extractNumberProperty(
        args,
        'instances_rotation'
      );
      const instancesOpacity = SafeExtractor.extractNumberProperty(
        args,
        'instances_opacity'
      );

      modifiedAndCreatedInstances.forEach(instance => {
        if (instancesSize) {
          instance.setHasCustomSize(true);
          instance.setCustomWidth(instancesSize[0]);
          instance.setCustomHeight(instancesSize[1]);
        }
        if (instances_z_order !== null) {
          instance.setZOrder(instances_z_order);
        }
        if (instancesRotation !== null) {
          instance.setAngle(instancesRotation);
        }
        if (instancesOpacity !== null) {
          instance.setOpacity(instancesOpacity);
        }
      });

      // Track specific changes that were made
      if (newInstancesCount > 0) {
        changes.push(
          `Created ${newInstancesCount} new instance${
            newInstancesCount > 1 ? 's' : ''
          } of object "${object_name ||
            ''}" using ${brush_kind} brush at ${brushPosition.join(
            ', '
          )} on layer "${layer_name || 'base'}".`
        );
      }

      // Check what changed for existing instances
      let movedToLayerCount = 0;
      let movedPositionCount = 0;
      let resizedCount = 0;
      let rotatedCount = 0;
      let opacityChangedCount = 0;
      let zOrderChangedCount = 0;

      existingInstanceStates.forEach((originalState, instance) => {
        if (originalState.originalLayer !== instance.getLayer()) {
          movedToLayerCount++;
        }
        if (
          originalState.originalX !== instance.getX() ||
          originalState.originalY !== instance.getY()
        ) {
          movedPositionCount++;
        }
        if (
          instancesSize &&
          (originalState.originalCustomWidth !== instance.getCustomWidth() ||
            originalState.originalCustomHeight !== instance.getCustomHeight())
        ) {
          resizedCount++;
        }
        if (
          instancesRotation !== null &&
          originalState.originalRotation !== instance.getAngle()
        ) {
          rotatedCount++;
        }
        if (
          instancesOpacity !== null &&
          originalState.originalOpacity !== instance.getOpacity()
        ) {
          opacityChangedCount++;
        }
        if (
          instances_z_order !== null &&
          originalState.originalZOrder !== instance.getZOrder()
        ) {
          zOrderChangedCount++;
        }
      });

      if (movedToLayerCount > 0) {
        changes.push(
          `Moved ${movedToLayerCount} instance${
            movedToLayerCount > 1 ? 's' : ''
          } to layer "${layer_name || 'base'}".`
        );
      }

      if (movedPositionCount > 0) {
        changes.push(
          `Repositioned ${movedPositionCount} instance${
            movedPositionCount > 1 ? 's' : ''
          } using ${brush_kind} brush.`
        );
      }

      if (resizedCount > 0 && instancesSize) {
        changes.push(
          `Resized ${resizedCount} instance${resizedCount > 1 ? 's' : ''} to ${
            instancesSize[0]
          }x${instancesSize[1]}.`
        );
      }

      if (rotatedCount > 0 && instancesRotation !== null) {
        changes.push(
          `Rotated ${rotatedCount} instance${
            rotatedCount > 1 ? 's' : ''
          } to ${instancesRotation}°.`
        );
      }

      if (opacityChangedCount > 0 && instancesOpacity !== null) {
        changes.push(
          `Changed opacity of ${opacityChangedCount} instance${
            opacityChangedCount > 1 ? 's' : ''
          } to ${instancesOpacity}.`
        );
      }

      if (zOrderChangedCount > 0 && instances_z_order !== null) {
        changes.push(
          `Changed Z-order of ${zOrderChangedCount} instance${
            zOrderChangedCount > 1 ? 's' : ''
          } to ${instances_z_order}.`
        );
      }

      if (notFoundExistingInstanceIds.size > 0) {
        changes.push(
          `Could not find these existing instance ids to modify:
          ${Array.from(notFoundExistingInstanceIds).join(
            ', '
          )}. Verify the ids and layer names are ALWAYS exact and correct.`
        );
      }

      if (changes.length === 0) {
        return makeGenericSuccess(
          'No changes were made to instances. Please specify a brush kind, position and number of instances to create, or specify the exact ids of the instances to manipulate.'
        );
      }

      // /!\ Tell the editor that some instances have potentially been modified (and even removed).
      // This will force the instances editor to destroy and mount again the
      // renderers to avoid keeping any references to existing instances, and also drop any selection.
      onInstancesModifiedOutsideEditor({
        scene: layout,
      });
      return makeGenericSuccess(changes.join(' '));
    }
  },
};

/**
 * Places new instance(s), or move/erase existing instances, of an existing object
 * onto a specified 3D layer within a scene using a virtual brush at given X, Y, Z coordinates.
 * Can also be used to resize, rotate existing 3D instance(s).
 * Existing instances identifiers can be found by calling `describe_instances` (`id` field for each instance).
 */
const put3dInstances: EditorFunction = {
  renderForEditor: ({ args }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const object_name = SafeExtractor.extractStringProperty(
      args,
      'object_name'
    );
    const layer_name = extractRequiredString(args, 'layer_name');
    const brush_kind = extractRequiredString(args, 'brush_kind');
    const brush_position = SafeExtractor.extractStringProperty(
      args,
      'brush_position'
    );
    const existing_instance_ids = SafeExtractor.extractStringProperty(
      args,
      'existing_instance_ids'
    );
    const existingInstanceIds = existing_instance_ids
      ? existing_instance_ids.split(',')
      : [];
    const new_instances_count = SafeExtractor.extractNumberProperty(
      args,
      'new_instances_count'
    );
    const newInstancesCount =
      !new_instances_count && existingInstanceIds.length === 0
        ? 1
        : new_instances_count;

    const existingInstanceCount = existing_instance_ids
      ? existing_instance_ids.split(',').length
      : 0;
    const brushPosition = brush_position
      ? brush_position.split(',').map(Number)
      : null;

    if (brush_kind === 'erase') {
      return {
        text: (
          <Trans>
            Erase {existingInstanceCount} instance(s) in scene {scene_name}.
          </Trans>
        ),
      };
    }

    if (existingInstanceIds.length === 0) {
      return {
        text: (
          <Trans>
            Add {newInstancesCount} instance(s) of object {object_name} at{' '}
            {brushPosition ? (
              brushPosition.join(', ')
            ) : (
              <Trans>scene center</Trans>
            )}{' '}
            (layer: {layer_name || 'base'}) in scene {scene_name}.
          </Trans>
        ),
      };
    } else if (newInstancesCount === 0) {
      return {
        text: (
          <Trans>
            Move {existingInstanceCount} instance(s) of object {object_name} to{' '}
            {brushPosition ? (
              brushPosition.join(', ')
            ) : (
              <Trans>scene center</Trans>
            )}{' '}
            (layer: {layer_name || 'base'}) in scene {scene_name}.
          </Trans>
        ),
      };
    } else {
      return {
        text: (
          <Trans>
            Add {newInstancesCount} instance(s) and move {existingInstanceCount}{' '}
            instance(s) of object {object_name} to{' '}
            {brushPosition ? (
              brushPosition.join(', ')
            ) : (
              <Trans>scene center</Trans>
            )}{' '}
            (layer: {layer_name || 'base'}) in scene {scene_name}.
          </Trans>
        ),
      };
    }
  },
  launchFunction: async ({
    project,
    args,
    onInstancesModifiedOutsideEditor,
  }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const object_name = SafeExtractor.extractStringProperty(
      args,
      'object_name'
    );
    const layer_name = extractRequiredString(args, 'layer_name');
    const brush_kind = extractRequiredString(args, 'brush_kind');
    const brush_position = SafeExtractor.extractStringProperty(
      args,
      'brush_position'
    );
    const brush_size = SafeExtractor.extractNumberProperty(args, 'brush_size');
    const brush_end_position = SafeExtractor.extractStringProperty(
      args,
      'brush_end_position'
    );
    const existing_instance_ids = SafeExtractor.extractStringProperty(
      args,
      'existing_instance_ids'
    );
    const new_instances_count = SafeExtractor.extractNumberProperty(
      args,
      'new_instances_count'
    );
    const instances_size = SafeExtractor.extractStringProperty(
      args,
      'instances_size'
    );
    const instances_rotation = SafeExtractor.extractStringProperty(
      args,
      'instances_rotation'
    );

    if (!project.hasLayoutNamed(scene_name)) {
      return makeGenericFailure(`Scene not found: "${scene_name}".`);
    }

    const layout = project.getLayout(scene_name);
    const objectsContainer = layout.getObjects();

    // Check if layer exists (empty string is allowed for base layer)
    if (layer_name !== '' && !layout.hasLayerNamed(layer_name)) {
      return makeGenericFailure(
        `Layer not found: ${layer_name} in scene "${scene_name}".`
      );
    }

    const existingInstanceIds = existing_instance_ids
      ? existing_instance_ids.split(',')
      : [];

    const initialInstances = layout.getInitialInstances();

    if (brush_kind === 'erase') {
      const brushPosition: Array<number> | null = brush_position
        ? brush_position.split(',').map(Number)
        : null;
      const brushSize = brush_size || 0;

      // Iterate on existing instances and remove them, and/or those inside the brush radius.
      const instancesToDelete = new Set();
      const notFoundExistingInstanceIds = new Set<string>(existingInstanceIds);

      iterateOnInstances(initialInstances, instance => {
        const foundExistingInstanceId = existingInstanceIds.find(id =>
          instance.getPersistentUuid().startsWith(id)
        );
        if (foundExistingInstanceId) {
          instancesToDelete.add(instance);
          notFoundExistingInstanceIds.delete(foundExistingInstanceId);
          return;
        }

        if (instance.getObjectName() !== object_name) return;

        if (!brushPosition) return;
        if (instance.getLayer() !== layer_name) return; // Layer must be the same as specified when deleting instances with a brush.

        if (brushSize <= 0) {
          if (
            instance.getX() === brushPosition[0] &&
            instance.getY() === brushPosition[1] &&
            instance.getZ() === brushPosition[2]
          ) {
            instancesToDelete.add(instance);
            return;
          }
        } else {
          const distance = Math.sqrt(
            Math.pow(instance.getX() - brushPosition[0], 2) +
              Math.pow(instance.getY() - brushPosition[1], 2) +
              Math.pow(instance.getZ() - brushPosition[2], 2)
          );
          if (distance <= brushSize) {
            instancesToDelete.add(instance);
            return;
          }
        }
      });

      instancesToDelete.forEach(instance => {
        initialInstances.removeInstance(instance);
      });

      // /!\ Tell the editor that some instances have potentially been modified (and even removed).
      // This will force the instances editor to destroy and mount again the
      // renderers to avoid keeping any references to existing instances, and also drop any selection.
      onInstancesModifiedOutsideEditor({
        scene: layout,
      });
      return makeGenericSuccess(
        [
          `Erased ${instancesToDelete.size} instance${
            instancesToDelete.size > 1 ? 's' : ''
          }.`,
          notFoundExistingInstanceIds.size > 0
            ? `Could not find these instances to erase:
        ${Array.from(notFoundExistingInstanceIds).join(
          ', '
        )}. Verify the ids and layer names are ALWAYS exact and correct.`
            : '',
        ]
          .filter(Boolean)
          .join(' ')
      );
    } else {
      const brushPosition: Array<number> = brush_position
        ? brush_position.split(',').map(Number)
        : [
            project.getGameResolutionWidth() / 2,
            project.getGameResolutionHeight() / 2,
            0,
          ];
      const brushSize = brush_size || 0;
      const brushEndPosition: Array<number> | null = brush_end_position
        ? brush_end_position.split(',').map(Number)
        : null;

      let newInstancesCount =
        new_instances_count !== null ? new_instances_count : 0;
      if (newInstancesCount === 0 && existingInstanceIds.length === 0) {
        newInstancesCount = 1;
      }

      // Track changes for detailed success message
      const changes = [];

      if (newInstancesCount > 0 && !object_name) {
        changes.push(
          `You've specified to create ${newInstancesCount} instances, but you didn't specify the object name. Please specify the object name.`
        );
      }

      if (
        object_name &&
        !objectsContainer.hasObjectNamed(object_name) &&
        !project.getObjects().hasObjectNamed(object_name)
      ) {
        return makeGenericFailure(
          `Object not found: "${object_name}" in scene "${scene_name}". Please only specify the object name of an object existing in the scene (or create if before if necessary).`
        );
      }

      // Store original states of existing instances for comparison
      const existingInstanceStates = new Map();
      const notFoundExistingInstanceIds = new Set<string>(existingInstanceIds);

      // Create the array of existing instances to move/modify, and new instances to create.
      const modifiedAndCreatedInstances: Array<gdInitialInstance> = [];
      iterateOnInstances(initialInstances, instance => {
        const foundExistingInstanceId = existingInstanceIds.find(id =>
          instance.getPersistentUuid().startsWith(id)
        );
        if (foundExistingInstanceId) {
          notFoundExistingInstanceIds.delete(foundExistingInstanceId);

          // Store original state before modifications
          existingInstanceStates.set(instance, {
            originalLayer: instance.getLayer(),
            originalX: instance.getX(),
            originalY: instance.getY(),
            originalZ: instance.getZ(),
            originalRotationX: instance.getRotationX(),
            originalRotationY: instance.getRotationY(),
            originalRotationZ: instance.getAngle(),
            originalCustomWidth: instance.hasCustomSize()
              ? instance.getCustomWidth()
              : null,
            originalCustomHeight: instance.hasCustomSize()
              ? instance.getCustomHeight()
              : null,
            originalCustomDepth: instance.hasCustomDepth()
              ? instance.getCustomDepth()
              : null,
          });

          modifiedAndCreatedInstances.push(instance);
          // Take the opportunity to move to a new layer if specified.
          if (instance.getLayer() !== layer_name) {
            instance.setLayer(layer_name);
          }
        }
      });

      for (let i = 0; i < newInstancesCount; i++) {
        const instance = initialInstances.insertNewInitialInstance();
        instance.setObjectName(object_name || '');
        instance.setLayer(layer_name);
        modifiedAndCreatedInstances.push(instance);
      }

      // Paint the new/modified instances with the brush.
      if (brush_kind === 'line') {
        const instancesCount = modifiedAndCreatedInstances.length;

        if (brushPosition && brushEndPosition) {
          const deltaX =
            instancesCount > 1
              ? (brushEndPosition[0] - brushPosition[0]) / (instancesCount - 1)
              : 0;
          const deltaY =
            instancesCount > 1
              ? (brushEndPosition[1] - brushPosition[1]) / (instancesCount - 1)
              : 0;
          const deltaZ =
            instancesCount > 1
              ? (brushEndPosition[2] - brushPosition[2]) / (instancesCount - 1)
              : 0;

          modifiedAndCreatedInstances.forEach((instance, i) => {
            instance.setX(brushPosition[0] + i * deltaX);
            instance.setY(brushPosition[1] + i * deltaY);
            instance.setZ(brushPosition[2] + i * deltaZ);
          });
        }
      } else if (brush_kind === 'random_in_sphere') {
        modifiedAndCreatedInstances.forEach(instance => {
          if (!brushPosition) return;

          const randomRadius = Math.random() * brushSize;
          const randomTheta = Math.random() * 2 * Math.PI; // Azimuthal angle
          const randomPhi = Math.acos(2 * Math.random() - 1); // Polar angle

          instance.setX(
            brushPosition[0] +
              randomRadius * Math.sin(randomPhi) * Math.cos(randomTheta)
          );
          instance.setY(
            brushPosition[1] +
              randomRadius * Math.sin(randomPhi) * Math.sin(randomTheta)
          );
          instance.setZ(brushPosition[2] + randomRadius * Math.cos(randomPhi));
        });
      } else if (brush_kind === 'point') {
        modifiedAndCreatedInstances.forEach(instance => {
          if (!brushPosition) return;

          instance.setX(brushPosition[0]);
          instance.setY(brushPosition[1]);
          instance.setZ(brushPosition[2]);
        });
      } else {
        if (brush_kind !== 'none') {
          console.warn(
            `Unknown brush kind: ${brush_kind} - assuming it's "none" instead.`
          );
          changes.push(
            'The brush kind is unknown and was considered to be "none" instead.'
          );
        }
      }

      const instancesSizeArray = instances_size
        ? instances_size.split(',').map(Number)
        : null;
      const instancesRotationArray = instances_rotation
        ? instances_rotation.split(',').map(coord => parseFloat(coord) || 0)
        : null;

      modifiedAndCreatedInstances.forEach(instance => {
        if (instancesSizeArray && instancesSizeArray.length >= 3) {
          instance.setHasCustomSize(true);
          instance.setHasCustomDepth(true);
          instance.setCustomWidth(instancesSizeArray[0]);
          instance.setCustomHeight(instancesSizeArray[1]);
          instance.setCustomDepth(instancesSizeArray[2]);
        }
        if (instancesRotationArray && instancesRotationArray.length >= 3) {
          instance.setRotationX(instancesRotationArray[0]);
          instance.setRotationY(instancesRotationArray[1]);
          instance.setAngle(instancesRotationArray[2]);
        }
      });

      // Track specific changes that were made
      if (newInstancesCount > 0) {
        changes.push(
          `Created ${newInstancesCount} new instance${
            newInstancesCount > 1 ? 's' : ''
          } of object "${object_name ||
            ''}" using ${brush_kind} brush at ${brushPosition.join(
            ', '
          )} on layer "${layer_name || 'base'}".`
        );
      }

      // Check what changed for existing instances
      let movedToLayerCount = 0;
      let movedPositionCount = 0;
      let resizedCount = 0;
      let rotatedCount = 0;

      existingInstanceStates.forEach((originalState, instance) => {
        if (originalState.originalLayer !== instance.getLayer()) {
          movedToLayerCount++;
        }
        if (
          originalState.originalX !== instance.getX() ||
          originalState.originalY !== instance.getY() ||
          originalState.originalZ !== instance.getZ()
        ) {
          movedPositionCount++;
        }
        if (
          instancesSizeArray &&
          instancesSizeArray.length >= 3 &&
          (originalState.originalCustomWidth !== instance.getCustomWidth() ||
            originalState.originalCustomHeight !== instance.getCustomHeight() ||
            originalState.originalCustomDepth !== instance.getCustomDepth())
        ) {
          resizedCount++;
        }
        if (
          instancesRotationArray &&
          instancesRotationArray.length >= 3 &&
          (originalState.originalRotationX !== instance.getRotationX() ||
            originalState.originalRotationY !== instance.getRotationY() ||
            originalState.originalRotationZ !== instance.getAngle())
        ) {
          rotatedCount++;
        }
      });

      if (movedToLayerCount > 0) {
        changes.push(
          `Moved ${movedToLayerCount} instance${
            movedToLayerCount > 1 ? 's' : ''
          } to layer "${layer_name || 'base'}".`
        );
      }

      if (movedPositionCount > 0) {
        changes.push(
          `Repositioned ${movedPositionCount} instance${
            movedPositionCount > 1 ? 's' : ''
          } using ${brush_kind} brush.`
        );
      }

      if (resizedCount > 0 && instancesSizeArray) {
        changes.push(
          `Resized ${resizedCount} instance${resizedCount > 1 ? 's' : ''} to ${
            instancesSizeArray[0]
          }x${instancesSizeArray[1]}x${instancesSizeArray[2]}.`
        );
      }

      if (rotatedCount > 0 && instancesRotationArray) {
        changes.push(
          `Rotated ${rotatedCount} instance${rotatedCount > 1 ? 's' : ''} to (${
            instancesRotationArray[0]
          }°, ${instancesRotationArray[1]}°, ${instancesRotationArray[2]}°).`
        );
      }

      if (notFoundExistingInstanceIds.size > 0) {
        changes.push(
          `Could not find these existing instance ids to modify:
          ${Array.from(notFoundExistingInstanceIds).join(
            ', '
          )}. Verify the ids and layer names are ALWAYS exact and correct.`
        );
      }

      if (changes.length === 0) {
        return makeGenericSuccess('No changes were made to instances.');
      }

      // /!\ Tell the editor that some instances have potentially been modified (and even removed).
      // This will force the instances editor to destroy and mount again the
      // renderers to avoid keeping any references to existing instances, and also drop any selection.
      onInstancesModifiedOutsideEditor({
        scene: layout,
      });
      return makeGenericSuccess(changes.join(' '));
    }
  },
};

/**
 * Retrieves the event sheet structure for a scene
 */
const readSceneEvents: EditorFunction = {
  renderForEditor: ({ args, editorCallbacks }) => {
    const scene_name = extractRequiredString(args, 'scene_name');

    return {
      text: (
        <Trans>
          Inspecting event sheet of scene{' '}
          <Link
            href="#"
            onClick={() =>
              editorCallbacks.onOpenLayout(scene_name, {
                openEventsEditor: true,
                openSceneEditor: true,
                focusWhenOpened: 'events',
              })
            }
          >
            {scene_name}
          </Link>
          .
        </Trans>
      ),
    };
  },
  launchFunction: async ({ project, args }) => {
    const scene_name = extractRequiredString(args, 'scene_name');

    if (!project.hasLayoutNamed(scene_name)) {
      return makeGenericFailure(`Scene not found: "${scene_name}".`);
    }

    const scene = project.getLayout(scene_name);
    const events = scene.getEvents();

    const eventsAsText = renderNonTranslatedEventsAsText({
      eventsList: events,
    });

    return {
      success: true,
      eventsForSceneNamed: scene_name,
      eventsAsText,
    };
  },
};

/**
 * Adds a new event to a scene's event sheet
 */
const addSceneEvents: EditorFunction = {
  renderForEditor: ({ args, shouldShowDetails, editorCallbacks }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const eventsDescription = extractRequiredString(args, 'events_description');
    const objectsListArgument = SafeExtractor.extractStringProperty(
      args,
      'objects_list'
    );
    const objectsList = objectsListArgument === null ? '' : objectsListArgument;
    const placementHint =
      SafeExtractor.extractStringProperty(args, 'placement_hint') || '';

    const details = shouldShowDetails ? (
      <ColumnStackLayout noMargin>
        {eventsDescription && (
          <Text
            noMargin
            allowSelection
            color="secondary"
            style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
          >
            <b>
              <Trans>Description</Trans>
            </b>
            : {eventsDescription}
          </Text>
        )}
        {placementHint && (
          <Text
            noMargin
            allowSelection
            color="secondary"
            style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
          >
            <b>
              <Trans>Generation hint</Trans>
            </b>
            : {placementHint}
          </Text>
        )}
        {objectsList && (
          <Text
            noMargin
            allowSelection
            color="secondary"
            style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
          >
            <b>
              <Trans>Related objects</Trans>
            </b>
            : {objectsList}
          </Text>
        )}
      </ColumnStackLayout>
    ) : null;

    if (eventsDescription) {
      return {
        text: (
          <Trans>
            Add or rework{' '}
            <Link
              href="#"
              onClick={() =>
                editorCallbacks.onOpenLayout(scene_name, {
                  openEventsEditor: true,
                  openSceneEditor: true,
                  focusWhenOpened: 'events',
                })
              }
            >
              events of scene {scene_name}
            </Link>
            .
          </Trans>
        ),
        details,
        hasDetailsToShow: true,
      };
    } else if (placementHint) {
      return {
        text: (
          <Trans>
            Adapt{' '}
            <Link
              href="#"
              onClick={() =>
                editorCallbacks.onOpenLayout(scene_name, {
                  openEventsEditor: true,
                  openSceneEditor: true,
                  focusWhenOpened: 'events',
                })
              }
            >
              events of scene {scene_name}
            </Link>{' '}
            ("{placementHint}").
          </Trans>
        ),
        details,
        hasDetailsToShow: true,
      };
    } else {
      return {
        text: (
          <Trans>
            Modify{' '}
            <Link
              href="#"
              onClick={() =>
                editorCallbacks.onOpenLayout(scene_name, {
                  openEventsEditor: true,
                  openSceneEditor: true,
                  focusWhenOpened: 'events',
                })
              }
            >
              events of scene {scene_name}
            </Link>
            .
          </Trans>
        ),
        details,
        hasDetailsToShow: true,
      };
    }
  },
  launchFunction: async ({
    project,
    args,
    generateEvents,
    onSceneEventsModifiedOutsideEditor,
    ensureExtensionInstalled,
  }) => {
    const sceneName = extractRequiredString(args, 'scene_name');
    const eventsDescription = extractRequiredString(args, 'events_description');
    const extensionNamesList = extractRequiredString(
      args,
      'extension_names_list'
    );
    const objectsListArgument = SafeExtractor.extractStringProperty(
      args,
      'objects_list'
    );
    const objectsList = objectsListArgument === null ? '' : objectsListArgument;
    const placementHint =
      SafeExtractor.extractStringProperty(args, 'placement_hint') || '';

    if (!project.hasLayoutNamed(sceneName)) {
      return makeGenericFailure(`Scene not found: "${sceneName}".`);
    }
    const scene = project.getLayout(sceneName);
    const currentSceneEvents = scene.getEvents();

    const existingEventsAsText = renderNonTranslatedEventsAsText({
      eventsList: currentSceneEvents,
    });

    try {
      const eventsGenerationResult: EventsGenerationResult = await generateEvents(
        {
          sceneName,
          eventsDescription,
          extensionNamesList,
          objectsList,
          existingEventsAsText,
          placementHint,
        }
      );

      if (!eventsGenerationResult.generationCompleted) {
        return makeGenericFailure(
          `Infrastructure error when launching or completing events generation (${
            eventsGenerationResult.errorMessage
          }). Consider trying again or a different approach.`
        );
      }

      const aiGeneratedEvent = eventsGenerationResult.aiGeneratedEvent;

      const makeAiGeneratedEventFailure = (
        message: string,
        details?: {|
          generatedEventsErrorDiagnostics: string,
        |}
      ) => {
        return {
          success: false,
          message,
          aiGeneratedEventId: aiGeneratedEvent.id,
          ...details,
        };
      };

      if (aiGeneratedEvent.error) {
        return makeAiGeneratedEventFailure(
          `Infrastructure error when generating events (${
            aiGeneratedEvent.error.message
          }). Consider trying again or a different approach.`
        );
      }

      const changes = aiGeneratedEvent.changes;
      if (!changes || changes.length === 0) {
        const resultMessage =
          aiGeneratedEvent.resultMessage ||
          'No generated events found and no other information was given.';
        return makeAiGeneratedEventFailure(
          `Error when generating events: ${resultMessage}\nConsider trying again or a different approach.`
        );
      }

      if (
        changes.some(change => change.isEventsJsonValid === false) ||
        changes.some(change => change.areEventsValid === false)
      ) {
        const resultMessage =
          aiGeneratedEvent.resultMessage ||
          'This probably means what you asked for is not possible or does not work like this.';
        return makeAiGeneratedEventFailure(
          `Generated events are not valid: ${resultMessage}\nRead also the attached diagnostics to try to understand what went wrong and either try again differently or consider a different approach.`,
          {
            generatedEventsErrorDiagnostics: changes
              .map(change => change.diagnosticLines.join('\n'))
              .join('\n\n'),
          }
        );
      }

      try {
        const extensionNames = new Set();
        for (const change of changes) {
          for (const extensionName of change.extensionNames || []) {
            extensionNames.add(extensionName);
          }
        }
        for (const extensionName of extensionNames) {
          await ensureExtensionInstalled({ extensionName });
        }
      } catch (e) {
        return makeAiGeneratedEventFailure(
          `Error when installing extensions: ${
            e.message
          }. Consider trying again or a different approach.`
        );
      }
      try {
        for (const change of changes) {
          addUndeclaredVariables({
            project,
            scene,
            undeclaredVariables: change.undeclaredVariables,
          });

          const objectNamesWithUndeclaredVariables = Object.keys(
            change.undeclaredObjectVariables
          );
          for (const objectName of objectNamesWithUndeclaredVariables) {
            const undeclaredVariables =
              change.undeclaredObjectVariables[objectName];
            addObjectUndeclaredVariables({
              project,
              scene,
              objectName,
              undeclaredVariables,
            });
          }

          const objectNamesWithMissingBehavior = Object.keys(
            change.missingObjectBehaviors
          );
          for (const objectName of objectNamesWithMissingBehavior) {
            const missingBehaviors = change.missingObjectBehaviors[objectName];
            addMissingObjectBehaviors({
              project,
              scene,
              objectName,
              missingBehaviors,
            });
          }
        }

        applyEventsChanges(
          project,
          currentSceneEvents,
          changes,
          aiGeneratedEvent.id
        );
        onSceneEventsModifiedOutsideEditor({
          scene,
          newOrChangedAiGeneratedEventIds: new Set([aiGeneratedEvent.id]),
        });

        const resultMessage =
          aiGeneratedEvent.resultMessage ||
          'Properly modified or added new event(s).';
        return {
          success: true,
          message: resultMessage,
          aiGeneratedEventId: aiGeneratedEvent.id,
        };
      } catch (error) {
        console.error(
          `Unexpected error when adding events from an AI Generated Event (id: ${
            aiGeneratedEvent.id
          }):`,
          error
        );
        return makeAiGeneratedEventFailure(
          `An unexpected error happened in the GDevelop editor while adding generated events: ${
            error.message
          }. Consider a different approach.`
        );
      }
    } catch (error) {
      console.error(
        'Unexpected error when creating AI Generated Event:',
        error
      );
      return makeGenericFailure(
        `An unexpected error happened in the GDevelop editor while creating generated events: ${
          error.message
        }. Consider a different approach.`
      );
    }
  },
};

/**
 * Creates a new, empty scene
 */
const createScene: EditorFunction = {
  renderForEditor: ({ args, editorCallbacks }) => {
    const scene_name = extractRequiredString(args, 'scene_name');

    return {
      text: (
        <Trans>
          Create a new scene called <b>{scene_name}</b>.{' '}
          <Link
            href="#"
            onClick={() =>
              editorCallbacks.onOpenLayout(scene_name, {
                openEventsEditor: true,
                openSceneEditor: true,
                focusWhenOpened: 'scene',
              })
            }
          >
            Click to open it
          </Link>
          .
        </Trans>
      ),
    };
  },
  launchFunction: async ({ project, args }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const include_ui_layer = SafeExtractor.extractBooleanProperty(
      args,
      'include_ui_layer'
    );
    const background_color = SafeExtractor.extractStringProperty(
      args,
      'background_color'
    );

    if (project.hasLayoutNamed(scene_name)) {
      const scene = project.getLayout(scene_name);
      if (include_ui_layer && !scene.hasLayerNamed('UI')) {
        scene.insertNewLayer('UI', scene.getLayersCount());
        addDefaultLightToLayer(scene.getLayer('UI'));
        return makeGenericSuccess(
          `Scene with name "${scene_name}" already exists, no need to re-create it. A layer called "UI" was added to it.`
        );
      }

      return makeGenericSuccess(
        `Scene with name "${scene_name}" already exists, no need to re-create it.`
      );
    }

    const scenesCount = project.getLayoutsCount();
    const scene = project.insertNewLayout(scene_name, scenesCount);
    if (include_ui_layer) {
      scene.insertNewLayer('UI', scene.getLayersCount());
    }
    if (background_color) {
      const colorAsRgb = hexNumberToRGBArray(
        rgbOrHexToHexNumber(background_color)
      );
      scene.setBackgroundColor(colorAsRgb[0], colorAsRgb[1], colorAsRgb[2]);
    }
    addDefaultLightToAllLayers(scene);

    return {
      success: true,
      message: include_ui_layer
        ? `Created new scene "${scene_name}" with the base layer and a layer called "UI".`
        : `Created new scene "${scene_name}".`,
      meta: {
        newSceneNames: [scene_name],
      },
    };
  },
};

/**
 * Deletes an existing scene
 */
const deleteScene: EditorFunction = {
  renderForEditor: ({ args }) => {
    const scene_name = extractRequiredString(args, 'scene_name');

    return {
      text: <Trans>Delete scene {scene_name}.</Trans>,
    };
  },
  launchFunction: async ({ project, args }) => {
    const scene_name = extractRequiredString(args, 'scene_name');

    if (!project.hasLayoutNamed(scene_name)) {
      return makeGenericSuccess(
        `Scene is already non existent or deleted: "${scene_name}". No need to delete it.`
      );
    }

    project.removeLayout(scene_name);

    return makeGenericSuccess(`Deleted scene "${scene_name}".`);
  },
};

const serializeEffectProperties = (
  effect: gdEffect,
  effectMetadata: gdEffectMetadata
) => {
  const effectProperties = effectMetadata.getProperties();
  const propertyNames = effectProperties.keys().toJSArray();
  return propertyNames
    .map(name => {
      const propertyDescriptor = effectProperties.get(name);
      if (shouldHideProperty(propertyDescriptor)) return null;

      // Set the value of the property to what is stored in the effect.
      // If it's not set, none of these will be set and the "value" will be the default one
      // serialized by the property descriptor.
      let value = null;
      if (effect.hasDoubleParameter(name)) {
        value = effect.getDoubleParameter(name);
      } else if (effect.hasStringParameter(name)) {
        value = effect.getStringParameter(name);
      } else if (effect.hasBooleanParameter(name)) {
        value = effect.getBooleanParameter(name);
      }

      if (value === null) {
        return serializeNamedProperty(name, propertyDescriptor);
      }

      return {
        ...serializeNamedProperty(name, propertyDescriptor),
        value,
      };
    })
    .filter(Boolean);
};

const inspectScenePropertiesLayersEffects: EditorFunction = {
  renderForEditor: ({ args }) => {
    const scene_name = extractRequiredString(args, 'scene_name');

    return {
      text: (
        <Trans>
          Inspecting scene properties, layers and effects for scene {scene_name}
          .
        </Trans>
      ),
    };
  },
  launchFunction: async ({ project, args }) => {
    const scene_name = extractRequiredString(args, 'scene_name');

    if (!project.hasLayoutNamed(scene_name)) {
      return makeGenericFailure(`Scene not found: "${scene_name}".`);
    }

    const scene = project.getLayout(scene_name);
    const layersContainer = scene.getLayers();

    return {
      success: true,
      propertiesLayersEffectsForSceneNamed: scene.getName(),
      properties: {
        backgroundColor: rgbColorToHex(
          scene.getBackgroundColorRed(),
          scene.getBackgroundColorGreen(),
          scene.getBackgroundColorBlue()
        ),
        stopSoundsOnStartup: scene.stopSoundsOnStartup(),

        // Also include some project related properties:
        gameResolutionWidth: project.getGameResolutionWidth(),
        gameResolutionHeight: project.getGameResolutionHeight(),
        gameOrientation: project.getOrientation(),
        gameScaleMode: project.getScaleMode(),
        gameName: project.getName(),
      },
      layers: mapFor(0, layersContainer.getLayersCount(), i => {
        const layer = layersContainer.getLayerAt(i);
        const effectsContainer = layer.getEffects();
        return {
          name: layer.getName(),
          position: i,
          effects: mapFor(0, effectsContainer.getEffectsCount(), j => {
            const effect = effectsContainer.getEffectAt(j);
            const effectMetadata = gd.MetadataProvider.getEffectMetadata(
              project.getCurrentPlatform(),
              effect.getEffectType()
            );

            if (gd.MetadataProvider.isBadEffectMetadata(effectMetadata)) {
              return null;
            }

            return {
              effectName: effect.getName(),
              effectType: effect.getEffectType(),
              effectProperties: serializeEffectProperties(
                effect,
                effectMetadata
              ),
            };
          }).filter(Boolean),
        };
      }),
    };
  },
};

const isFuzzyMatch = (string1: string, string2: string) => {
  const simplifiedString1 = string1.toLowerCase().replace(/\s|_|-/g, '');
  const simplifiedString2 = string2.toLowerCase().replace(/\s|_|-/g, '');

  return simplifiedString1 === simplifiedString2;
};

const changeScenePropertiesLayersEffects: EditorFunction = {
  renderForEditor: ({ args, shouldShowDetails }) => {
    const scene_name = extractRequiredString(args, 'scene_name');

    const changed_properties = SafeExtractor.extractArrayProperty(
      args,
      'changed_properties'
    );
    const changed_layers = SafeExtractor.extractArrayProperty(
      args,
      'changed_layers'
    );
    const changed_layer_effects = SafeExtractor.extractArrayProperty(
      args,
      'changed_layer_effects'
    );

    const changedPropertiesCount =
      (changed_properties && changed_properties.length) || 0;
    const changedLayersCount = (changed_layers && changed_layers.length) || 0;
    const changedLayerEffectsCount =
      (changed_layer_effects && changed_layer_effects.length) || 0;

    return {
      text:
        changedPropertiesCount > 0 &&
        changedLayersCount > 0 &&
        changedLayerEffectsCount > 0 ? (
          <Trans>
            Changing some scene properties, layers and effects for scene{' '}
            {scene_name}.
          </Trans>
        ) : changedPropertiesCount > 0 && changedLayersCount > 0 ? (
          <Trans>
            Changing some scene properties and layers for scene {scene_name}.
          </Trans>
        ) : changedPropertiesCount > 0 && changedLayerEffectsCount > 0 ? (
          <Trans>
            Changing some scene properties and effects for scene {scene_name}.
          </Trans>
        ) : changedLayerEffectsCount > 0 && changedLayersCount > 0 ? (
          <Trans>
            Changing some scene effects and layers for scene {scene_name}.
          </Trans>
        ) : changedPropertiesCount > 0 ? (
          <Trans>Changing some scene properties for scene {scene_name}.</Trans>
        ) : changedLayersCount > 0 ? (
          <Trans>Changing some scene layers for scene {scene_name}.</Trans>
        ) : changedLayerEffectsCount > 0 ? (
          <Trans>Changing some scene effects for scene {scene_name}.</Trans>
        ) : (
          <Trans>Unknown changes attempted for scene {scene_name}.</Trans>
        ),
    };
  },
  launchFunction: async ({
    project,
    args,
    onInstancesModifiedOutsideEditor,
  }) => {
    const scene_name = extractRequiredString(args, 'scene_name');

    if (!project.hasLayoutNamed(scene_name)) {
      return makeGenericFailure(`Scene not found: "${scene_name}".`);
    }
    const scene = project.getLayout(scene_name);

    const changes = [];
    const warnings = [];

    const changed_properties = SafeExtractor.extractArrayProperty(
      args,
      'changed_properties'
    );
    const changed_layers = SafeExtractor.extractArrayProperty(
      args,
      'changed_layers'
    );
    const changed_layer_effects = SafeExtractor.extractArrayProperty(
      args,
      'changed_layer_effects'
    );

    if (changed_properties)
      changed_properties.forEach(changed_property => {
        const propertyName = SafeExtractor.extractStringProperty(
          changed_property,
          'property_name'
        );
        const newValue = SafeExtractor.extractStringProperty(
          changed_property,
          'new_value'
        );
        if (propertyName === null || newValue === null) {
          warnings.push(
            `Missing "property_name" or "new_value" in an item of \`changed_properties\`: ${JSON.stringify(
              changed_property
            )}. It was ignored and not changed.`
          );
          return;
        }

        if (isFuzzyMatch(propertyName, 'backgroundColor')) {
          const colorAsRgb = hexNumberToRGBArray(rgbOrHexToHexNumber(newValue));
          scene.setBackgroundColor(colorAsRgb[0], colorAsRgb[1], colorAsRgb[2]);
          changes.push('Modified the scene background color.');
        } else if (isFuzzyMatch(propertyName, 'gameResolutionWidth')) {
          project.setGameResolutionSize(
            parseInt(newValue),
            project.getGameResolutionHeight()
          );
          changes.push('Modified the game resolution width.');
        } else if (isFuzzyMatch(propertyName, 'stopSoundsOnStartup')) {
          scene.setStopSoundsOnStartup(newValue.toLowerCase() === 'true');
          changes.push(
            'Modified whether sounds should be stopped on scene startup.'
          );
        } else if (isFuzzyMatch(propertyName, 'gameResolutionHeight')) {
          project.setGameResolutionSize(
            project.getGameResolutionWidth(),
            parseInt(newValue)
          );
          changes.push('Modified the game resolution height.');
        } else if (isFuzzyMatch(propertyName, 'gameOrientation')) {
          project.setOrientation(newValue);
          changes.push('Modified the game orientation.');
        } else if (isFuzzyMatch(propertyName, 'gameScaleMode')) {
          project.setScaleMode(newValue);
          changes.push('Modified the game scale mode.');
        } else if (isFuzzyMatch(propertyName, 'gameName')) {
          project.setName(newValue);
          changes.push('Modified the game name.');
        } else {
          warnings.push(
            `Unknown property for the scene: "${propertyName}". It was ignored and not changed.`
          );
        }
      });

    if (changed_layers) {
      changed_layers.forEach(changed_layer => {
        const layerName = SafeExtractor.extractStringProperty(
          changed_layer,
          'layer_name'
        );
        if (layerName === null) {
          warnings.push(
            `Missing "layer_name" in an item of changed_layers. It was ignored and not changed.`
          );
          return;
        }

        const new_layer_name = SafeExtractor.extractStringProperty(
          changed_layer,
          'new_layer_name'
        );
        const new_layer_position = SafeExtractor.extractNumberProperty(
          changed_layer,
          'new_layer_position'
        );
        const delete_this_layer = SafeExtractor.extractBooleanProperty(
          changed_layer,
          'delete_this_layer'
        );
        const move_instances_to_layer = SafeExtractor.extractStringProperty(
          changed_layer,
          'move_instances_to_layer'
        );

        if (scene.hasLayerNamed(layerName)) {
          if (delete_this_layer) {
            if (move_instances_to_layer) {
              gd.WholeProjectRefactorer.mergeLayersInScene(
                project,
                scene,
                layerName,
                move_instances_to_layer
              );
            } else {
              // Note: some instances will be invalidated because of this.
              gd.WholeProjectRefactorer.removeLayerInScene(
                project,
                scene,
                layerName
              );
            }
            scene.getLayers().removeLayer(layerName);
            changes.push(
              `Removed layer "${layerName}" for scene "${scene.getName()}".`
            );
          } else {
            if (new_layer_name) {
              gd.WholeProjectRefactorer.renameLayerInScene(
                project,
                scene,
                layerName,
                new_layer_name
              );
              changes.push(
                `Renamed layer "${layerName}" to "${new_layer_name}" for scene "${scene.getName()}".`
              );
            }
          }
          if (new_layer_position !== null) {
            scene
              .getLayers()
              .moveLayer(
                scene.getLayers().getLayerPosition(layerName),
                new_layer_position
              );
            changes.push(
              `Moved layer "${layerName}" to position ${new_layer_position} for scene "${scene.getName()}".`
            );
          }

          // /!\ Tell the editor that some instances have potentially been modified (and even removed).
          // This will force the instances editor to destroy and mount again the
          // renderers to avoid keeping any references to existing instances, and also drop any selection.
          onInstancesModifiedOutsideEditor({
            scene,
          });
        } else {
          scene
            .getLayers()
            .insertNewLayer(
              new_layer_name || layerName,
              new_layer_position === null
                ? scene.getLayersCount()
                : new_layer_position
            );
          changes.push(
            `Created new layer "${new_layer_name ||
              layerName}" for scene "${scene.getName()}" at position ${new_layer_position ||
              0}.`
          );
        }
      });
    }

    if (changed_layer_effects) {
      changed_layer_effects.forEach(changed_layer_effect => {
        const layerName = SafeExtractor.extractStringProperty(
          changed_layer_effect,
          'layer_name'
        );
        if (layerName === null) {
          warnings.push(
            `Missing "layer_name" in an item of changed_layer_effects. It was ignored and not changed.`
          );
          return;
        }
        if (!scene.hasLayerNamed(layerName)) {
          warnings.push(
            `Layer not found: "${layerName}". It was ignored and no effects on it were changed.`
          );
          return;
        }
        const layer = scene.getLayers().getLayer(layerName);
        const effectsContainer = layer.getEffects();

        const effectName = SafeExtractor.extractStringProperty(
          changed_layer_effect,
          'effect_name'
        );
        if (effectName === null) {
          warnings.push(
            `Missing "effect_name" in an item of changed_layer_effects. It was ignored and not changed.`
          );
          return;
        }
        const effect_type = SafeExtractor.extractStringProperty(
          changed_layer_effect,
          'effect_type'
        );
        const new_effect_name = SafeExtractor.extractStringProperty(
          changed_layer_effect,
          'new_effect_name'
        );
        const new_effect_position = SafeExtractor.extractNumberProperty(
          changed_layer_effect,
          'new_effect_position'
        );
        const delete_this_effect = SafeExtractor.extractBooleanProperty(
          changed_layer_effect,
          'delete_this_effect'
        );
        let newlyCreatedEffect: gdEffect | null = null;

        if (effectsContainer.hasEffectNamed(effectName)) {
          const effect = effectsContainer.getEffect(effectName);
          if (delete_this_effect) {
            effectsContainer.removeEffect(effectName);
            changes.push(
              `Removed "${effectName}" effect on layer "${layerName}".`
            );
          } else {
            if (new_effect_name) {
              effect.setName(new_effect_name);
              changes.push(
                `Renamed the "${effectName}" effect on layer "${layerName}" to "${new_effect_name}".`
              );
            }
            if (new_effect_position !== null) {
              effectsContainer.moveEffect(
                effectsContainer.getEffectPosition(effectName),
                new_effect_position
              );
              changes.push(
                `Moved the "${effectName}" effect on layer "${layerName}" to position ${new_effect_position}.`
              );
            }
          }
        } else {
          if (effect_type) {
            const newEffectName = new_effect_name || effectName;
            const effectMetadata = gd.MetadataProvider.getEffectMetadata(
              project.getCurrentPlatform(),
              effect_type
            );
            if (gd.MetadataProvider.isBadEffectMetadata(effectMetadata)) {
              warnings.push(
                `Effect type "${effect_type}" is not a valid effect type. Effect "${newEffectName}" was NOT added.`
              );
            } else {
              newlyCreatedEffect = effectsContainer.insertNewEffect(
                newEffectName,
                new_effect_position || 0
              );
              newlyCreatedEffect.setEffectType(effect_type);
            }
          }
        }

        const changed_properties = SafeExtractor.extractArrayProperty(
          changed_layer_effect,
          'changed_properties'
        );
        if (changed_properties) {
          if (!effectsContainer.hasEffectNamed(effectName)) {
            warnings.push(
              `Effect not found: "${effectName}". It was ignored and not changed.`
            );
            return;
          }
          const effect = effectsContainer.getEffect(effectName);
          const effectMetadata = gd.MetadataProvider.getEffectMetadata(
            project.getCurrentPlatform(),
            effect.getEffectType()
          );

          if (gd.MetadataProvider.isBadEffectMetadata(effectMetadata)) {
            warnings.push(
              `Effect "${effectName}" is not a valid effect. It was ignored and not changed.`
            );
            return;
          }

          const effectProperties = effectMetadata.getProperties();

          changed_properties.forEach(changed_property => {
            const propertyName = SafeExtractor.extractStringProperty(
              changed_property,
              'property_name'
            );
            const newValue = SafeExtractor.extractStringProperty(
              changed_property,
              'new_value'
            );
            if (propertyName === null || newValue === null) {
              warnings.push(
                `Missing "property_name" or "new_value" in an item of \`changed_properties\`. It was ignored and not changed. Make sure you follow the exact format for changing effect properties.`
              );
              return;
            }

            const { foundProperty } = findPropertyByName({
              properties: effectProperties,
              name: propertyName,
            });
            if (!foundProperty) {
              warnings.push(
                `Property not found: "${propertyName}" in effect "${effectName}". It was ignored and not changed. Make sure you only change existing effect properties.`
              );
              return;
            }

            const lowercasedType = foundProperty.getType().toLowerCase();
            if (lowercasedType === 'number') {
              effect.setDoubleParameter(
                propertyName,
                parseFloat(newValue) || 0
              );
            } else if (lowercasedType === 'boolean') {
              effect.setBooleanParameter(
                propertyName,
                newValue.toLowerCase() === 'true'
              );
            } else {
              effect.setStringParameter(propertyName, newValue);
            }

            changes.push(
              `Modified "${propertyName}" property of the "${effectName}" effect to "${newValue}".`
            );
          });
        }

        if (newlyCreatedEffect) {
          const effectMetadata = gd.MetadataProvider.getEffectMetadata(
            project.getCurrentPlatform(),
            newlyCreatedEffect.getEffectType()
          );
          if (gd.MetadataProvider.isBadEffectMetadata(effectMetadata)) {
            // Should not happen.
          } else {
            changes.push(
              `Created new "${newlyCreatedEffect.getName()}" effect on layer "${layerName}" at position ${new_effect_position ||
                0}. It properties are: ${serializeEffectProperties(
                newlyCreatedEffect,
                effectMetadata
              )
                // This stringify might not give the prettiest output, this could be improved.
                .map(serializedProperty => JSON.stringify(serializedProperty))
                .join(', ')}.`
            );
          }
        }
      });
    }

    if (changes.length === 0 && warnings.length === 0) {
      return {
        success: false,
        message: 'No changes were made.',
      };
    } else if (changes.length === 0 && warnings.length > 0) {
      return {
        success: false,
        message:
          'No changes were made because of the issues listed in the warnings.',
        warnings: warnings.join('\n'),
      };
    } else if (changes.length > 0 && warnings.length === 0) {
      return {
        success: true,
        message: ['Successfully done the changes.', ...changes].join('\n'),
      };
    } else {
      return {
        success: true,
        message: [
          'Successfully done some changes but some issues were found - see the warnings.',
          ...changes,
        ].join('\n'),
        warnings: warnings.join('\n'),
      };
    }
  },
};

const addOrEditVariable: EditorFunction = {
  renderForEditor: ({ args, shouldShowDetails }) => {
    const variable_name_or_path = extractRequiredString(
      args,
      'variable_name_or_path'
    );
    const variable_scope = extractRequiredString(args, 'variable_scope');
    const value = extractRequiredString(args, 'value');
    const object_name = SafeExtractor.extractStringProperty(
      args,
      'object_name'
    );
    const scene_name = SafeExtractor.extractStringProperty(args, 'scene_name');

    const details = shouldShowDetails ? (
      <ColumnStackLayout noMargin>
        <Text noMargin allowSelection color="secondary">
          <b>
            <Trans>Value</Trans>
          </b>
          : {value}
        </Text>
      </ColumnStackLayout>
    ) : null;

    if (variable_scope === 'scene') {
      return {
        text: (
          <Trans>
            Add or edit scene variable {variable_name_or_path} in scene{' '}
            {scene_name}.
          </Trans>
        ),
        details,
        hasDetailsToShow: true,
      };
    } else if (variable_scope === 'object') {
      return {
        text: (
          <Trans>
            Add or edit object variable {variable_name_or_path} for object{' '}
            {object_name}.
          </Trans>
        ),
        details,
        hasDetailsToShow: true,
      };
    } else if (variable_scope === 'global') {
      return {
        text: (
          <Trans>Add or edit global variable {variable_name_or_path}.</Trans>
        ),
        details,
        hasDetailsToShow: true,
      };
    }

    return {
      text: <Trans>Add or edit variable {variable_name_or_path}.</Trans>,
    };
  },
  launchFunction: async ({ project, args }) => {
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
    const object_name = SafeExtractor.extractStringProperty(
      args,
      'object_name'
    );
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
      if (!object_name) {
        return makeGenericFailure(
          `Missing "object_name" argument, required to edit an object variable.`
        );
      }

      let objectsContainer;
      if (scene_name) {
        if (!project.hasLayoutNamed(scene_name)) {
          return makeGenericFailure(`Scene not found: "${scene_name}".`);
        }
        objectsContainer = project.getLayout(scene_name).getObjects();
        if (!objectsContainer.hasObjectNamed(object_name)) {
          return makeGenericFailure(
            `Object not found: "${object_name}" in scene "${scene_name}". Have you created it? For a global object, don't specify the scene name.`
          );
        }
      } else {
        objectsContainer = project.getObjects();
        if (!objectsContainer.hasObjectNamed(object_name)) {
          return makeGenericFailure(
            `Object not found: "${object_name}" in project. Have you created it or forgot to specify the scene name?`
          );
        }
      }

      variablesContainer = objectsContainer
        .getObject(object_name)
        .getVariables();
    } else if (variable_scope === 'global') {
      variablesContainer = project.getVariables();
    } else {
      return makeGenericFailure(
        `Invalid "variable_scope" argument: "${variable_scope}". Valid values are \`scene\`, \`object\` or \`global\`.`
      );
    }

    const { addedNewVariable, variableType } = applyVariableChange({
      variablePath: variable_name_or_path,
      forcedVariableType: variable_type,
      variablesContainer,
      value,
    });

    return makeGenericSuccess(
      addedNewVariable
        ? `Properly added variable "${variable_name_or_path}" of type "${variableType}".`
        : `Properly edited variable "${variable_name_or_path}".`
    );
  },
};

const initializeProject: EditorFunctionWithoutProject = {
  renderForEditor: ({ args }) => {
    const project_name = extractRequiredString(args, 'project_name');

    return {
      text: (
        <Trans>
          Initializing a new game project "{<b>{project_name}</b>}".
        </Trans>
      ),
    };
  },
  launchFunction: async ({ args, editorCallbacks }) => {
    const project_name = extractRequiredString(args, 'project_name');
    const template_slug = extractRequiredString(args, 'template_slug');
    const also_read_existing_events = SafeExtractor.extractBooleanProperty(
      args,
      'also_read_existing_events'
    );

    try {
      const requestedExampleSlug = ['', 'none', 'empty'].includes(
        template_slug.toLowerCase()
      )
        ? null
        : template_slug;
      const { exampleSlug, createdProject } = await retryIfFailed(
        { times: 2 },
        () =>
          editorCallbacks.onCreateProject({
            name: project_name,
            exampleSlug: requestedExampleSlug,
          })
      );

      if (!createdProject) {
        throw new Error('Unexpected null project after creation.');
      }

      const output: EditorFunctionGenericOutput = {
        success: true,
      };

      if (also_read_existing_events) {
        const eventsAsTextByScene = {};
        mapFor(0, createdProject.getLayoutsCount(), i => {
          const scene = createdProject.getLayoutAt(i);
          const events = scene.getEvents();
          eventsAsTextByScene[
            scene.getName()
          ] = renderNonTranslatedEventsAsText({
            eventsList: events,
          });
        });

        output.eventsAsTextByScene = eventsAsTextByScene;
      }

      if (exampleSlug) {
        output.message = `Initialized project using starter game template "${exampleSlug}".`;
        output.initializedProject = true;
        output.initializedFromTemplateSlug = exampleSlug;
      } else {
        if (template_slug) {
          output.message = `Initialized project but this is an empty project.`;
          output.initializedProject = true;
        } else {
          output.message = `Initialized empty project.`;
          output.initializedProject = true;
        }
      }
      output.meta = {
        newSceneNames: mapFor(0, createdProject.getLayoutsCount(), i =>
          createdProject.getLayoutAt(i).getName()
        ),
      };

      return output;
    } catch (error) {
      return makeGenericFailure(
        'Unable to initialize project. This might be because of a network error. Please try again.'
      );
    }
  },
};

export const editorFunctions: { [string]: EditorFunction } = {
  create_object: createOrReplaceObject,
  create_or_replace_object: createOrReplaceObject,
  inspect_object_properties: inspectObjectProperties,
  change_object_property: changeObjectProperty,
  add_behavior: addBehavior,
  remove_behavior: removeBehavior,
  inspect_behavior_properties: inspectBehaviorProperties,
  change_behavior_property: changeBehaviorProperty,
  describe_instances: describeInstances,
  put_2d_instances: put2dInstances,
  put_3d_instances: put3dInstances,
  read_scene_events: readSceneEvents,
  add_scene_events: addSceneEvents,
  create_scene: createScene,
  delete_scene: deleteScene,
  inspect_scene_properties_layers_effects: inspectScenePropertiesLayersEffects,
  change_scene_properties_layers_effects: changeScenePropertiesLayersEffects,
  add_or_edit_variable: addOrEditVariable,
};

export const editorFunctionsWithoutProject: {
  [string]: EditorFunctionWithoutProject,
} = {
  initialize_project: initializeProject,
};
