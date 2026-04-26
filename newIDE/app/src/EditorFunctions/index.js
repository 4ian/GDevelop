// @flow
import * as React from 'react';
import { getInstancesInLayoutForLayer } from '../Utils/Layout';
import { mapFor, mapVector } from '../Utils/MapFor';
import { SafeExtractor } from '../Utils/SafeExtractor';
import {
  serializeToJSObject,
  serializeToJSON,
  unserializeFromJSObject,
} from '../Utils/Serializer';
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
import { type I18n as I18nType } from '@lingui/core';
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
import { swapAsset } from '../AssetStore/AssetSwapper';
import { type EnsureExtensionInstalledOptions } from '../AiGeneration/UseEnsureExtensionInstalled';
import { getObjectFolderOrObjectWithContextFromObjectName } from '../SceneEditor/ObjectFolderOrObjectsSelection';
import { getObjectSizeInfo, type ObjectSizeInfo } from './Utils';

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
      didModifyProject?: true,
    |}
  | {|
      status: 'aborted',
      call_id: string,
    |};

export type ResourceSearchAndInstallOptions = {|
  resources: Array<{
    resourceName: string,
    resourceKind: string,
  }>,
|};

export type SingleResourceSearchAndInstallResult = {|
  resourceName: string,
  resourceKind: string,
  status:
    | 'resource-installed'
    | 'nothing-found'
    | 'resource-already-exists'
    | 'error',
  error?: string,
|};

export type ResourceSearchAndInstallResult = {|
  results: Array<SingleResourceSearchAndInstallResult>,
|};

export type EditorFunctionGenericOutput = {|
  success: boolean,
  meta?: {
    newSceneNames?: Array<string>,
    createdProject?: gdProject,
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
  errors?: Array<string>,

  initializedProject?: boolean,
  initializedFromTemplateSlug?: string,
  eventsAsTextByScene?: { [string]: string },

  // Used for de-duplication of outputs:
  eventsForSceneNamed?: string,
  instancesForSceneNamed?: string,
  instancesOnlyForObjectsNamed?: string, // Must be combined with `instancesForSceneNamed`.
  propertiesLayersEffectsForSceneNamed?: string,
  objectPropertiesDeduplicationKey?: string,

  // Used when new resources are added by a function call:
  newlyAddedResources?: Array<SingleResourceSearchAndInstallResult>,

  // Default size, origin and center of the object(s) being operated on, keyed by object name:
  objectSizeInfo?: { [string]: ObjectSizeInfo },

  // Set to true when the function call was aborted mid-execution (e.g. the AI
  // request was suspended while event generation was still polling).
  aborted?: true,
|};

export type EventsGenerationResult =
  | {|
      generationCompleted: true,
      aiGeneratedEvent: AiGeneratedEvent,
    |}
  | {|
      generationCompleted: false,
      errorMessage: string,
    |}
  | {|
      generationAborted: true,
    |};

export type EventsGenerationOptions = {|
  sceneName: string,
  eventsDescription: string,
  extensionNamesList: string,
  objectsList: string,
  existingEventsAsText: string,
  existingEventsJson: string | null,
  placementHint: string,
  relatedAiRequestId: string,
  estimatedComplexity: number | null,
|};

export type AssetSearchAndInstallResult = {|
  status: 'asset-installed' | 'nothing-found' | 'error',
  message: string,
  createdObjects: Array<gdObject>,
  assetShortHeader: AssetShortHeader | null,
  isTheFirstOfItsTypeInProject: boolean,
|};

export type AssetSearchAndInstallOptions = {|
  objectsContainer: gdObjectsContainer,
  objectName: string,
  objectType: string | null,
  searchTerms: string,
  description: string,
  twoDimensionalViewKind: string,
  exactOrPartialAssetId?: string | null,
  relatedAiRequestId?: string | null,
  lastUserMessage?: string | null,
  lastAssistantMessages?: string[],
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

export type ObjectsOutsideEditorChanges = {|
  scene: gdLayout,
  isNewObjectTypeUsed: boolean,
|};

export type ObjectGroupsOutsideEditorChanges = {|
  scene: gdLayout,
|};

export type ToolOptions = {
  includeEventsJson?: boolean,
  ...
};

type RenderForEditorOptions = {|
  project: ?gdProject,
  args: any,
  editorCallbacks: EditorCallbacks,
  shouldShowDetails: boolean,
  editorFunctionCallResultOutput: any,
|};

export type RelatedAiRequestLastMessages = {|
  lastUserMessage: string | null,
  lastAssistantMessages: string[],
|};

type LaunchFunctionOptionsWithoutProject = {|
  PixiResourcesLoader: any,
  args: any,
  editorCallbacks: EditorCallbacks,
  toolOptions: ToolOptions | null,
  i18n: I18nType,
  relatedAiRequestId: string | null,
  getRelatedAiRequestLastMessages: () => RelatedAiRequestLastMessages,
  generateEvents: (
    options: EventsGenerationOptions
  ) => Promise<EventsGenerationResult>,
  onSceneEventsModifiedOutsideEditor: (
    changes: SceneEventsOutsideEditorChanges
  ) => void,
  onInstancesModifiedOutsideEditor: (
    changes: InstancesOutsideEditorChanges
  ) => void,
  onObjectsModifiedOutsideEditor: (
    changes: ObjectsOutsideEditorChanges
  ) => void,
  onObjectGroupsModifiedOutsideEditor: (
    changes: ObjectGroupsOutsideEditorChanges
  ) => void,
  ensureExtensionInstalled: (
    options: EnsureExtensionInstalledOptions
  ) => Promise<void>,
  onWillInstallExtension: (extensionNames: Array<string>) => void,
  onExtensionInstalled: (extensionNames: Array<string>) => void,
  searchAndInstallAsset: (
    options: AssetSearchAndInstallOptions
  ) => Promise<AssetSearchAndInstallResult>,
  searchAndInstallResources: (
    options: ResourceSearchAndInstallOptions
  ) => Promise<ResourceSearchAndInstallResult>,
|};

export type LaunchFunctionOptionsWithProject = {|
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
  /** True if this function modifies the project (triggers unsaved changes tracking). */
  modifiesProject: boolean,
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
  /** True if this function modifies the project (triggers unsaved changes tracking). */
  modifiesProject: boolean,
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
      message: 'No changes.',
    };
  } else if (changes.length === 0 && warnings.length > 0) {
    return {
      success: false,
      message: ['No changes. Issues:', ...warnings].join('\n'),
    };
  } else if (changes.length > 0 && warnings.length === 0) {
    return {
      success: true,
      message: ['Done.', ...changes].join('\n'),
    };
  }

  return {
    success: true,
    message: [
      'Done with warnings.',
      ...changes,
      'Warnings:',
      ...warnings,
    ].join('\n'),
  };
};

const TRUNCATION_LIMIT = 200;
const truncateValue = (value: string, limit: number = TRUNCATION_LIMIT) => {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit)}[...truncated - ${value.length -
    limit} more characters]`;
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

  // $FlowFixMe[missing-local-annot]
  const normalizeName = name => name.toLowerCase().replace(/\s|_|-/g, '');
  const normalizedName = normalizeName(name);

  const propertyNames = properties.keys().toJSArray();
  const foundPropertyName =
    propertyNames.find(
      propertyName =>
        normalizeName(propertyName.toLowerCase()) === normalizedName
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

export const getPropertyValue = ({
  properties,
  propertyName,
}: {|
  properties: gdMapStringPropertyDescriptor | null,
  propertyName: string,
|}): string | null => {
  if (!properties) return null;

  const { foundProperty } = findPropertyByName({
    properties,
    name: propertyName,
  });

  if (!foundProperty) return null;

  return foundProperty.getValue();
};

const verifyPropertyChange = ({
  propertyNameWithLocation,
  newProperties,
  propertyName,
  requestedNewValue,
}: {|
  propertyNameWithLocation: string,
  newProperties: gdMapStringPropertyDescriptor,
  propertyName: string,
  requestedNewValue: string,
|}): {|
  propertyWarnings: Array<string>,
  propertyChanges: Array<string>,
|} => {
  const { foundProperty } = findPropertyByName({
    properties: newProperties,
    name: propertyName,
  });

  if (!foundProperty) {
    return {
      propertyWarnings: [],
      propertyChanges: [
        `Set ${propertyNameWithLocation} but property not found afterwards - double-check the values.`,
      ],
    };
  }

  const propertyWarnings = [];
  const propertyChanges = [];

  const actualNewValue = foundProperty.getValue();

  if (foundProperty.getType().toLowerCase() === 'boolean') {
    // Like in sanitizePropertyNewValue, we need to handle the boolean values in an usual "0" or "1" format.
    const requestedNewValueAsBooleanString =
      requestedNewValue === '1'
        ? 'true'
        : requestedNewValue === '0'
        ? 'false'
        : requestedNewValue;
    if (requestedNewValueAsBooleanString !== actualNewValue) {
      propertyWarnings.push(
        `${propertyNameWithLocation}: actual "${actualNewValue}" ≠ requested "${requestedNewValueAsBooleanString}".`
      );
    }
  } else {
    if (
      actualNewValue.toLowerCase().trim() !==
      requestedNewValue.toLowerCase().trim()
    ) {
      if (foundProperty.getType().toLowerCase() === 'number') {
        const sizeLikeRegex = /^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?)\s*([,;xX*×])\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?)\s*(?:\2\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+)(?:[eE][+-]?\d+)?)\s*)?$/;
        if (sizeLikeRegex.test(requestedNewValue)) {
          propertyWarnings.push(
            `${propertyNameWithLocation} = "${actualNewValue}", but requested "${requestedNewValue}" looks multi-dimensional; only a single number is allowed.`
          );
        }
      } else {
        propertyWarnings.push(
          `${propertyNameWithLocation}: actual "${actualNewValue}" ≠ requested "${requestedNewValue}".`
        );
      }
    }
  }

  propertyChanges.push(
    `Set ${propertyNameWithLocation} = "${actualNewValue}".`
  );

  return {
    propertyWarnings,
    propertyChanges,
  };
};

// Compact unit string: prefer the short symbol (e.g. "px", "deg") if it's
// shorter than the full unit name (e.g. "Pixel", "DegreeAngle"). Returns null
// if the property has no unit.
const getShortMeasurementUnit = (
  measurementUnit: gdMeasurementUnit
): string | null => {
  if (measurementUnit.isUndefined()) return null;
  const name = measurementUnit.getName();
  let shortLabel = '';
  try {
    const elementsCount = measurementUnit.getElementsCount();
    for (let i = 0; i < elementsCount; i++) {
      const baseUnit = measurementUnit.getElementBaseUnit(i);
      const power = measurementUnit.getElementPower(i);
      const symbol = baseUnit.getSymbol();
      if (!symbol) continue;
      shortLabel +=
        (shortLabel ? '·' : '') +
        symbol +
        (power === 1 ? '' : `^${power}`);
    }
  } catch (_) {
    // Defensive: if anything goes wrong, fall back to the name.
    return name;
  }
  if (!shortLabel) return name;
  return shortLabel.length < name.length ? shortLabel : name;
};

const getPropertyChoices = (
  property: gdPropertyDescriptor
): Array<string> | null => {
  if (property.getType().toLowerCase() !== 'choice') return null;
  return [
    ...mapVector(property.getChoices(), choice => choice.getValue()),
    // TODO Remove this once we made sure no built-in extension still use `addExtraInfo` instead of `addChoice`.
    ...property.getExtraInfo().toJSArray(),
  ];
};

// Builds a compact textual listing of properties optimized for LLM consumption:
// - Boolean values omit the type tag (the value already implies it).
// - Empty-valued properties are grouped at the end ("Empty: a, b (resource), c (string)").
// - Number units use a short symbol ("px") when shorter than the full name ("Pixel").
const formatPropertiesList = (
  properties: gdMapStringPropertyDescriptor
): string => {
  const propertyNames = properties.keys().toJSArray();

  const nonEmptyParts: Array<string> = [];
  const emptyByType: Map<string, Array<string>> = new Map();

  for (const name of propertyNames) {
    const property = properties.get(name);
    if (shouldHideProperty(property)) continue;

    const rawType = property.getType();
    const type = rawType.toLowerCase();
    const value = property.getValue();
    const unit = getShortMeasurementUnit(property.getMeasurementUnit());
    const choices = getPropertyChoices(property);

    // Booleans are always "true"/"false" - never grouped as empty.
    if (type === 'boolean') {
      nonEmptyParts.push(`${name}: ${value || 'false'}`);
      continue;
    }

    if (value === '' || value === null || value === undefined) {
      // Group empty properties by their descriptor (type + optional unit/choices).
      const choicesText = choices
        ? `one of: [${choices.map(c => `"${c}"`).join(', ')}]`
        : null;
      const tag = [type, choicesText, unit].filter(Boolean).join(', ');
      const list = emptyByType.get(tag) || [];
      list.push(name);
      emptyByType.set(tag, list);
      continue;
    }

    if (type === 'number') {
      nonEmptyParts.push(unit ? `${name}: ${value} (${unit})` : `${name}: ${value}`);
      continue;
    }

    const information = [
      type,
      choices ? `one of: [${choices.map(c => `"${c}"`).join(', ')}]` : null,
      unit,
    ]
      .filter(Boolean)
      .join(', ');
    nonEmptyParts.push(
      information ? `${name}: ${value} (${information})` : `${name}: ${value}`
    );
  }

  const emptyParts: Array<string> = [];
  for (const [tag, names] of emptyByType.entries()) {
    emptyParts.push(tag ? `${names.join(', ')} (${tag})` : names.join(', '));
  }

  const segments = [];
  if (nonEmptyParts.length > 0) segments.push(nonEmptyParts.join(', '));
  if (emptyParts.length > 0) segments.push(`Empty: ${emptyParts.join(', ')}`);

  return segments.join('. ');
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
 * Creates a new object (in the specified scene or globally), or replaces an existing one, or duplicates an existing one.
 */
const createOrReplaceObject: EditorFunction = {
  renderForEditor: ({ args, editorCallbacks }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const object_name = extractRequiredString(args, 'object_name');
    const replaceExistingObject = SafeExtractor.extractBooleanProperty(
      args,
      'replace_existing_object'
    );
    const duplicatedObjectName = SafeExtractor.extractStringProperty(
      args,
      'duplicated_object_name'
    );

    return {
      text: replaceExistingObject ? (
        <Trans>
          Replace <b>{object_name}</b> in scene{' '}
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
      ) : duplicatedObjectName ? (
        <Trans>
          Duplicate <b>{duplicatedObjectName}</b> as <b>{object_name}</b> in
          scene{' '}
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
          Add <b>{object_name}</b> to scene{' '}
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
    relatedAiRequestId,
    getRelatedAiRequestLastMessages,
    ensureExtensionInstalled,
    searchAndInstallAsset,
    onObjectsModifiedOutsideEditor,
    onWillInstallExtension,
    onExtensionInstalled,
    PixiResourcesLoader,
  }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const object_type = SafeExtractor.extractStringProperty(
      args,
      'object_type'
    );
    const targetObjectName = extractRequiredString(args, 'object_name');
    const target_object_scope = SafeExtractor.extractStringProperty(
      args,
      'target_object_scope'
    );
    const shouldReplaceExistingObject = SafeExtractor.extractBooleanProperty(
      args,
      'replace_existing_object'
    );
    const duplicatedObjectName = SafeExtractor.extractStringProperty(
      args,
      'duplicated_object_name'
    );
    const duplicatedObjectScene = SafeExtractor.extractStringProperty(
      args,
      'duplicated_object_scene'
    );
    const description = SafeExtractor.extractStringProperty(
      args,
      'description'
    );
    const search_terms = SafeExtractor.extractStringProperty(
      args,
      'search_terms'
    );
    const asset_id = SafeExtractor.extractStringProperty(args, 'asset_id');
    const two_dimensional_view_kind = SafeExtractor.extractStringProperty(
      args,
      'two_dimensional_view_kind'
    );

    if (!project.hasLayoutNamed(scene_name)) {
      return makeGenericFailure(`Scene not found: "${scene_name}".`);
    }

    const layout = project.getLayout(scene_name);
    const layoutObjects = layout.getObjects();
    const globalObjects = project.getObjects();

    const getPropertiesText = (object: gdObject): string => {
      const properties = object.getConfiguration().getProperties();
      return `Properties: ${formatPropertiesList(properties)}.`;
    };

    // Check if target object already exists.
    let existingTargetObject: gdObject | null = null;
    let isTargetObjectGlobal = false;

    if (layoutObjects.hasObjectNamed(targetObjectName)) {
      existingTargetObject = layoutObjects.getObject(targetObjectName);
    } else if (globalObjects.hasObjectNamed(targetObjectName)) {
      existingTargetObject = globalObjects.getObject(targetObjectName);
      isTargetObjectGlobal = true;
    }

    let existingObjectShouldBeMoved = false;
    if (existingTargetObject) {
      if (target_object_scope === 'global' && !isTargetObjectGlobal) {
        existingObjectShouldBeMoved = true;
      } else if (target_object_scope === 'scene' && isTargetObjectGlobal) {
        existingObjectShouldBeMoved = true;
      }
    }

    // Compute the effective object type from the explicit argument or, as a
    // fallback, the type of any object that already exists with the target
    // name. Both sources (when provided) must agree - otherwise the request
    // is inconsistent and we reject it before touching the project.
    const existingTargetObjectType = existingTargetObject
      ? existingTargetObject.getType()
      : null;
    if (
      object_type &&
      existingTargetObjectType &&
      existingTargetObjectType !== object_type
    ) {
      return makeGenericFailure(
        `Object "${targetObjectName}" already exists ${
          isTargetObjectGlobal ? 'globally' : `in scene "${scene_name}"`
        } with type "${existingTargetObjectType}". Cannot (re)create as type "${object_type}".`
      );
    }
    const candidateType = object_type || existingTargetObjectType || null;

    const createNewObject = async () => {
      if (existingTargetObject) {
        // Type mismatch was already rejected above.
        // /!\ Tell the editor that some objects have potentially been modified (and even removed).
        // This will force the objects panel to refresh.
        onObjectsModifiedOutsideEditor({
          scene: layout,
          isNewObjectTypeUsed: false, // No object was actually added.
        });
        return makeGenericSuccess(
          `Object "${targetObjectName}" already exists.`
        );
      }

      const targetObjectsContainer =
        target_object_scope === 'global' ? globalObjects : layoutObjects;

      if (candidateType && !search_terms && !asset_id) {
        // Do nothing: there is nothing given apart from an object type,
        // which we can still use to fallback to create from scratch.
      } else {
        if (!search_terms && !asset_id) {
          return makeGenericFailure(
            `No search_terms or asset_id provided for "${targetObjectName}". Not created.`
          );
        }

        // First try to search and install an object from the asset store.
        try {
          const {
            status,
            message,
            createdObjects,
            assetShortHeader,
            isTheFirstOfItsTypeInProject,
          } = await searchAndInstallAsset({
            objectsContainer: targetObjectsContainer,
            objectName: targetObjectName,
            objectType: candidateType,
            searchTerms: search_terms || '',
            description: description || '',
            twoDimensionalViewKind: two_dimensional_view_kind || '',
            exactOrPartialAssetId: asset_id || null,
            relatedAiRequestId,
            ...getRelatedAiRequestLastMessages(),
          });

          if (status === 'error') {
            return makeGenericFailure(
              `Unable to search/install object (${message}).`
            );
          } else if (status === 'asset-installed') {
            // Update behaviors shared data for the scene where the object was created.
            // Assets from the store can come with behaviors that have shared data.
            if (target_object_scope === 'global') {
              gd.WholeProjectRefactorer.updateBehaviorsSharedData(project);
            } else {
              layout.updateBehaviorsSharedData(project);
            }

            // /!\ Tell the editor that some objects have potentially been modified (and even removed).
            // This will force the objects panel to refresh.
            onObjectsModifiedOutsideEditor({
              scene: layout,
              isNewObjectTypeUsed: isTheFirstOfItsTypeInProject,
            });

            if (createdObjects.length === 1) {
              const object = createdObjects[0];
              const result: EditorFunctionGenericOutput = {
                success: true,
                message: [
                  `Created object "${object.getName()}" (type "${object.getType()}", scene "${scene_name}") from asset store.`,
                  getPropertiesText(object),
                ].join(' '),
                objectSizeInfo: {
                  [object.getName()]: getObjectSizeInfo(
                    object,
                    project,
                    PixiResourcesLoader,
                    assetShortHeader
                  ),
                },
              };
              return result;
            }

            return makeGenericSuccess(
              `Created from asset store in scene "${scene_name}": ${createdObjects
                .map(
                  object =>
                    `"${object.getName()}" (type "${object.getType()}")`
                )
                .join(', ')}.`
            );
          } else {
            if (asset_id) {
              return makeGenericFailure(
                `No asset found with id "${asset_id}". Object not created.`
              );
            }

            // No asset found - we'll create an object from scratch.
          }
        } catch (error) {
          return makeGenericFailure(
            `Unexpected error while searching/installing object (${
              error.message
            }).`
          );
        }
      }

      // Create an object from scratch: this requires a known object type.
      if (!candidateType) {
        return makeGenericFailure(
          `Could not install asset for "${targetObjectName}", and no "object_type" provided to create from scratch.`
        );
      }
      // Ensure the extension for this object type is installed.
      if (candidateType.includes('::')) {
        const extensionName = candidateType.split('::')[0];
        try {
          await ensureExtensionInstalled({
            extensionName,
            onWillInstallExtension,
            onExtensionInstalled,
          });
        } catch (error) {
          console.error(
            `Could not get extension "${extensionName}" installed:`,
            error
          );
          return makeGenericFailure(
            `Could not install extension "${extensionName}" - try a different object type?`
          );
        }
      }

      // Ensure the object type is valid.
      const objectMetadata = gd.MetadataProvider.getObjectMetadata(
        project.getCurrentPlatform(),
        candidateType
      );
      if (gd.MetadataProvider.isBadObjectMetadata(objectMetadata)) {
        return makeGenericFailure(
          `Object type "${candidateType}" does not exist.`
        );
      }

      const isTheFirstOfItsTypeInProject = !gd.UsedObjectTypeFinder.scanProject(
        project,
        candidateType
      );
      const object = targetObjectsContainer.insertNewObject(
        project,
        candidateType,
        targetObjectName,
        targetObjectsContainer.getObjectsCount()
      );
      // /!\ Tell the editor that some objects have potentially been modified (and even removed).
      // This will force the objects panel to refresh.
      onObjectsModifiedOutsideEditor({
        scene: layout,
        isNewObjectTypeUsed: isTheFirstOfItsTypeInProject,
      });

      const scratchResult: EditorFunctionGenericOutput = {
        success: true,
        message: [
          `Created object "${targetObjectName}" (type "${candidateType}", scene "${scene_name}") from scratch.`,
          getPropertiesText(object),
        ].join(' '),
      };
      scratchResult.objectSizeInfo = {
        [targetObjectName]: getObjectSizeInfo(
          object,
          project,
          PixiResourcesLoader
        ),
      };
      return scratchResult;
    };

    const replaceExistingObject = async () => {
      if (!existingTargetObject) {
        // No existing object to replace, create a new one.
        return createNewObject();
      }

      // Type mismatch between `object_type` and the existing object's type was
      // already rejected above - here `candidateType` is the existing type.

      if (
        !search_terms &&
        !description &&
        !two_dimensional_view_kind &&
        !asset_id
      ) {
        return makeGenericFailure(
          `No search_terms/description/asset_id provided for "${existingTargetObject.getName()}". Not replaced.`
        );
      }

      const objectsContainerWhereObjectWasFound = isTargetObjectGlobal
        ? globalObjects
        : layoutObjects;
      const targetObjectsContainer =
        target_object_scope === 'global'
          ? globalObjects
          : objectsContainerWhereObjectWasFound;

      // First try to search and install an object from the asset store.
      try {
        const replacementObjectName = newNameGenerator(
          targetObjectName + 'Replacement',
          name => targetObjectsContainer.hasObjectNamed(name)
        );
        const {
          status,
          message,
          createdObjects,
          assetShortHeader,
        } = await searchAndInstallAsset({
          objectsContainer: targetObjectsContainer,
          objectName: replacementObjectName,
          objectType: existingTargetObject.getType(),
          searchTerms: search_terms || '',
          description: description || '',
          twoDimensionalViewKind: two_dimensional_view_kind || '',
          exactOrPartialAssetId: asset_id || null,
          relatedAiRequestId,
          ...getRelatedAiRequestLastMessages(),
        });

        if (status === 'error') {
          // TODO
          return makeGenericFailure(
            `Unable to search/install object (${message}).`
          );
        } else if (
          status === 'asset-installed' &&
          createdObjects.length > 0 &&
          assetShortHeader
        ) {
          swapAsset(
            project,
            PixiResourcesLoader,
            existingTargetObject,
            createdObjects[0],
            assetShortHeader
          );

          for (const createdObject of createdObjects) {
            targetObjectsContainer.removeObject(createdObject.getName());
          }

          // /!\ Tell the editor that some objects have potentially been modified (and even removed).
          // This will force the objects panel to refresh.
          onObjectsModifiedOutsideEditor({
            scene: layout,
            isNewObjectTypeUsed: false, // The object type was not changed.
          });
          return makeGenericSuccess(
            `Replaced "${existingTargetObject.getName()}" with asset store object (same type "${existingTargetObject.getType()}").`
          );
        } else {
          // No asset found.
        }
      } catch (error) {
        return makeGenericFailure(
          `Unexpected error while searching/installing object (${
            error.message
          }).`
        );
      }

      return makeGenericFailure(
        `No asset store match for "${targetObjectName}" in scene "${scene_name}". Instead, inspect and modify the object's properties to match what you need.`
      );
    };

    const duplicateExistingObject = (
      duplicatedObjectName: string,
      duplicatedObjectSceneName: string | null
    ) => {
      if (
        duplicatedObjectSceneName &&
        !project.hasLayoutNamed(duplicatedObjectSceneName)
      ) {
        return makeGenericFailure(
          `Scene not found: "${duplicatedObjectSceneName}". Not duplicated.`
        );
      }

      const duplicatedObjectScene = duplicatedObjectSceneName
        ? project.getLayout(duplicatedObjectSceneName)
        : layout;
      const duplicatedObjectSceneObjects = duplicatedObjectScene.getObjects();

      let isDuplicatedObjectGlobal = false;
      let duplicatedObject: gdObject | null = null;
      if (duplicatedObjectSceneObjects.hasObjectNamed(duplicatedObjectName)) {
        duplicatedObject = duplicatedObjectSceneObjects.getObject(
          duplicatedObjectName
        );
      } else if (globalObjects.hasObjectNamed(duplicatedObjectName)) {
        duplicatedObject = globalObjects.getObject(duplicatedObjectName);
        isDuplicatedObjectGlobal = true;
      }

      if (!duplicatedObject) {
        return makeGenericFailure(
          `Object "${duplicatedObjectName}" not found in scene "${duplicatedObjectScene.getName()}" nor globally. Not duplicated.`
        );
      }

      const targetObjectsContainer =
        target_object_scope === 'global' ? globalObjects : layoutObjects;

      const serializedObject = serializeToJSObject(duplicatedObject);
      const newObject = targetObjectsContainer.insertNewObject(
        project,
        duplicatedObject.getType(),
        targetObjectName,
        targetObjectsContainer.getObjectsCount()
      );
      unserializeFromJSObject(
        newObject,
        serializedObject,
        'unserializeFrom',
        project
      );
      newObject.setName(targetObjectName); // Unserialization has overwritten the name.
      newObject.resetPersistentUuid();

      // Update behaviors shared data for the scene where the object was duplicated.
      if (target_object_scope === 'global') {
        gd.WholeProjectRefactorer.updateBehaviorsSharedData(project);
      } else {
        layout.updateBehaviorsSharedData(project);
      }

      // /!\ Tell the editor that some objects have potentially been modified (and even removed).
      // This will force the objects panel to refresh.
      onObjectsModifiedOutsideEditor({
        scene: layout,
        isNewObjectTypeUsed: false, // The object type can't be new because it is duplicated.
      });

      const fromText = isDuplicatedObjectGlobal
        ? 'global objects'
        : `scene "${duplicatedObjectScene.getName()}"`;
      const toText =
        target_object_scope === 'global'
          ? 'global objects'
          : `scene "${scene_name}"`;
      return makeGenericSuccess(
        `Duplicated "${duplicatedObjectName}" (${fromText}) as "${newObject.getName()}" (${toText}); same type/behaviors/properties/effects.`
      );
    };

    const moveExistingObject = () => {
      const existingTargetObjectFolderOrObject = getObjectFolderOrObjectWithContextFromObjectName(
        globalObjects,
        layoutObjects,
        existingTargetObject ? existingTargetObject.getName() : ''
      );
      if (!existingTargetObjectFolderOrObject || !existingTargetObject) {
        throw new Error(
          "Internal error: can't locate the existing object to be moved."
        );
      }

      if (target_object_scope === 'global' && !isTargetObjectGlobal) {
        if (globalObjects.hasObjectNamed(existingTargetObject.getName())) {
          return makeGenericFailure(
            `Object "${existingTargetObject.getName()}" already exists globally. No change.`
          );
        }

        layoutObjects.moveObjectFolderOrObjectToAnotherContainerInFolder(
          existingTargetObjectFolderOrObject.objectFolderOrObject,
          globalObjects,
          globalObjects.getRootFolder(),
          0
        );

        gd.WholeProjectRefactorer.updateBehaviorsSharedData(project);

        // /!\ Tell the editor that some objects have potentially been modified (and even removed).
        // This will force the objects panel to refresh.
        onObjectsModifiedOutsideEditor({
          scene: layout,
          isNewObjectTypeUsed: false, // The object type was not changed.
        });

        return makeGenericSuccess(
          `Moved "${existingTargetObject.getName()}" to global objects; type/behaviors/properties/effects unchanged.`
        );
      } else if (target_object_scope === 'scene' && isTargetObjectGlobal) {
        return makeGenericFailure(
          `"${existingTargetObject.getName()}" is global; global objects cannot be moved to scene "${scene_name}".`
        );
      }

      return makeGenericFailure(
        `Unrecognized move for "${existingTargetObject.getName()}". No change.`
      );
    };

    if (existingObjectShouldBeMoved) {
      return moveExistingObject();
    } else if (shouldReplaceExistingObject) {
      return replaceExistingObject();
    } else if (duplicatedObjectName) {
      return duplicateExistingObject(
        duplicatedObjectName,
        duplicatedObjectScene
      );
    } else {
      return createNewObject();
    }
  },
  modifiesProject: true,
};

/**
 * Retrieves the properties of a specific object (global or in a scene)
 */
const inspectObjectProperties: EditorFunction = {
  renderForEditor: ({ args, editorCallbacks }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const object_name = extractRequiredString(args, 'object_name');

    return {
      text: (
        <Trans>
          Read <b>{object_name}</b>'s properties in scene{' '}
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
  launchFunction: async ({ project, args, PixiResourcesLoader }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const object_name = extractRequiredString(args, 'object_name');

    if (!project.hasLayoutNamed(scene_name)) {
      return makeGenericFailure(`Scene not found: "${scene_name}".`);
    }

    const layout = project.getLayout(scene_name);
    const layoutObjects = layout.getObjects();
    const globalObjects = project.getObjects();

    let object: gdObject | null = null;

    if (layoutObjects.hasObjectNamed(object_name)) {
      object = layoutObjects.getObject(object_name);
    } else if (globalObjects.hasObjectNamed(object_name)) {
      object = globalObjects.getObject(object_name);
    }

    if (!object) {
      return makeGenericFailure(
        `Object not found: "${object_name}" in scene "${scene_name}" nor globally.`
      );
    }

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
        if (!object) return null;
        const behavior = object.getBehavior(behaviorName);
        return {
          behaviorName: behaviorName,
          behaviorType: behavior.getTypeName(),
        };
      })
      .filter(Boolean);

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
      objectSizeInfo: {
        [object_name]: getObjectSizeInfo(object, project, PixiResourcesLoader),
      },
    };
    if (animationNames.length > 0) {
      output.animationNames = animationNames.join(', ');
    }

    return output;
  },
  modifiesProject: false,
};

const isPropertyForChangingObjectName = (propertyName: string): boolean => {
  return (
    propertyName.toLowerCase() === 'name' ||
    propertyName.toLowerCase().replace(/-|_| /, '') === 'objectname'
  );
};

/**
 * Changes a property of a specific object (global or in a scene)
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
                Rename <b>{object_name}</b> to <b>{newValue}</b> (in scene{' '}
                {scene_name}).
              </Trans>
            ) : (
              <Trans>
                Update <b>{label}</b> of <b>{object_name}</b> (in scene{' '}
                {scene_name}) to <b>{newValue}</b>.
              </Trans>
            ),
        };
      }

      return {
        text: (
          <Trans>
            Update {changes.length} properties of <b>{object_name}</b> (in scene{' '}
            {scene_name}).
          </Trans>
        ),
        hasDetailsToShow: true,
        details: shouldShowDetails ? (
          <ColumnStackLayout noMargin>
            {changes.map(change =>
              change.label === 'name' ? (
                <Text key={change.label} noMargin size="body-small">
                  <Trans>Renamed object to {change.newValue}.</Trans>
                </Text>
              ) : (
                <Text key={change.label} noMargin size="body-small">
                  <Trans>
                    <b>{change.label}</b> set to {change.newValue}.
                  </Trans>
                </Text>
              )
            )}
          </ColumnStackLayout>
        ) : null,
      };
    };

    if (!project || !project.hasLayoutNamed(scene_name)) {
      // $FlowFixMe[incompatible-type]
      return renderChanges(
        listLabelAndValuesFromChangedProperties(changed_properties)
      );
    }

    const layout = project.getLayout(scene_name);
    const layoutObjects = layout.getObjects();
    const globalObjects = project.getObjects();

    let object: gdObject | null = null;

    if (layoutObjects.hasObjectNamed(object_name)) {
      object = layoutObjects.getObject(object_name);
    } else if (globalObjects.hasObjectNamed(object_name)) {
      object = globalObjects.getObject(object_name);
    }

    if (!object) {
      // $FlowFixMe[incompatible-type]
      return renderChanges(
        listLabelAndValuesFromChangedProperties(changed_properties)
      );
    }

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

    // $FlowFixMe[incompatible-type]
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
    const layoutObjects = layout.getObjects();
    const globalObjects = project.getObjects();

    let object: gdObject | null = null;
    let isGlobalObject = false;

    if (layoutObjects.hasObjectNamed(object_name)) {
      object = layoutObjects.getObject(object_name);
    } else if (globalObjects.hasObjectNamed(object_name)) {
      object = globalObjects.getObject(object_name);
      isGlobalObject = true;
    }

    if (!object) {
      return makeGenericFailure(
        `Object not found: "${object_name}" in scene "${scene_name}" nor globally.`
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
          `Missing "property_name" or "new_value" in changed_properties item: ${JSON.stringify(
            changed_property
          )}. Skipped.`
        );
        return;
      }

      // Renaming an object is a special case by using a property called "name".
      if (isPropertyForChangingObjectName(propertyName)) {
        if (object.getName() === newValue) {
          changes.push(
            `Object "${object_name}" already named "${newValue}".`
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
          `Renamed object "${object_name}" to "${newName}" (events and references updated).`
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

      if (!foundPropertyName || !foundProperty) {
        warnings.push(
          `Property "${propertyName}" not found on object "${object_name}".`
        );
        return;
      }

      const sanitizedNewValue = sanitizePropertyNewValue(
        foundProperty,
        newValue
      );

      if (foundProperty.getType() === 'resource') {
        if (!project.getResourcesManager().hasResource(sanitizedNewValue)) {
          warnings.push(
            `"${foundPropertyName}" on "${object_name}" -> "${newValue}": resource "${sanitizedNewValue}" does not exist. New resources cannot be added just by name; use \`create_or_replace_object\` to import assets from the asset store (preserving properties/behaviors/events).`
          );
          return;
        }
        const resource = project
          .getResourcesManager()
          .getResource(sanitizedNewValue);

        // Check the new resource is of the expected kind.
        const extraInfos = foundProperty.getExtraInfo().toJSArray();
        const expectedResourceKind = (extraInfos[0] || '').toLowerCase();
        if (
          expectedResourceKind &&
          resource.getKind().toLowerCase() !== expectedResourceKind
        ) {
          warnings.push(
            `"${foundPropertyName}" on "${object_name}" -> "${newValue}": resource "${sanitizedNewValue}" has kind "${resource.getKind()}" but expected "${expectedResourceKind}".`
          );
          return;
        }
      }

      if (
        !objectConfiguration.updateProperty(
          foundPropertyName,
          sanitizedNewValue
        )
      ) {
        warnings.push(
          `Could not set "${foundPropertyName}" on "${object_name}": invalid value or type.`
        );
        return;
      }

      const { propertyWarnings, propertyChanges } = verifyPropertyChange({
        propertyNameWithLocation: `"${foundPropertyName}" on "${object_name}"`,
        newProperties: objectConfiguration.getProperties(),
        propertyName: foundPropertyName,
        requestedNewValue: sanitizedNewValue,
      });
      warnings.push(...propertyWarnings);
      changes.push(...propertyChanges);
    });

    return makeMultipleChangesOutput(changes, warnings);
  },
  modifiesProject: true,
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
            Add {behaviorName} (<b>{behaviorTypeLabel}</b>) behavior to{' '}
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
      // $FlowFixMe[incompatible-type]
      return makeText(behavior_type);
    }

    const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
      project.getCurrentPlatform(),
      behavior_type
    );
    if (gd.MetadataProvider.isBadBehaviorMetadata(behaviorMetadata)) {
      // $FlowFixMe[incompatible-type]
      return makeText(behavior_type);
    }

    // In almost all cases, we should use the behavior default name (especially because it
    // allows to share the same behavior shared data between objects).
    const behaviorName =
      optionalBehaviorName || behaviorMetadata.getDefaultName();

    // $FlowFixMe[incompatible-type]
    return makeText(behaviorMetadata.getFullName());
  },
  launchFunction: async ({
    project,
    args,
    ensureExtensionInstalled,
    onWillInstallExtension,
    onExtensionInstalled,
  }) => {
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
    const layoutObjects = layout.getObjects();
    const globalObjects = project.getObjects();

    let object: gdObject | null = null;

    if (layoutObjects.hasObjectNamed(object_name)) {
      object = layoutObjects.getObject(object_name);
    } else if (globalObjects.hasObjectNamed(object_name)) {
      object = globalObjects.getObject(object_name);
    }

    if (!object) {
      return makeGenericFailure(
        `Object not found: "${object_name}" in scene "${scene_name}" nor globally.`
      );
    }

    // Ensure the extension for this behavior is installed.
    if (behavior_type.includes('::')) {
      const extensionName = behavior_type.split('::')[0];
      try {
        await ensureExtensionInstalled({
          extensionName,
          onWillInstallExtension,
          onExtensionInstalled,
        });
      } catch (error) {
        console.error(
          `Could not get extension "${extensionName}" installed:`,
          error
        );
        return makeGenericFailure(
          `Could not install extension "${extensionName}" - try a different behavior type?`
        );
      }
    }

    const behaviorMetadata = gd.MetadataProvider.getBehaviorMetadata(
      project.getCurrentPlatform(),
      behavior_type
    );
    if (gd.MetadataProvider.isBadBehaviorMetadata(behaviorMetadata)) {
      return makeGenericFailure(
        `Behavior type "${behavior_type}" does not exist.`
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
          `Behavior "${behaviorName}" already on "${object_name}" with different type ("${behavior_type}").`
        );
      }

      return makeGenericSuccess(
        `Behavior "${behaviorName}" already on "${object_name}".`
      );
    }

    if (isBehaviorDefaultCapability(behaviorMetadata)) {
      const alreadyHasDefaultCapability = object
        .getAllBehaviorNames()
        .toJSArray()
        .some(behaviorName => {
          if (!object) return false;
          const behavior = object.getBehavior(behaviorName);
          return behavior.getTypeName() === behavior_type;
        });
      if (alreadyHasDefaultCapability) {
        return makeGenericSuccess(
          `Behavior "${behaviorName}" (type "${behavior_type}") is a default capability already on "${object_name}".`
        );
      }

      return makeGenericFailure(
        `Behavior "${behaviorName}" (type "${behavior_type}") is a default capability; cannot be added to "${object_name}".`
      );
    }

    if (
      behaviorMetadata.getObjectType() &&
      behaviorMetadata.getObjectType() !== object.getType()
    ) {
      return makeGenericFailure(
        `Behavior "${behaviorName}" (type "${behavior_type}") requires object type "${behaviorMetadata.getObjectType()}"; "${object_name}" is not.`
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
        `Unexpected error: behavior "${behaviorName}" not added to "${object_name}".`
      );
    }
    layout.updateBehaviorsSharedData(project);

    const behavior = object.getBehavior(behaviorName);
    const propertiesText = `Properties: ${formatPropertiesList(
      behavior.getProperties()
    )}.`;

    return makeGenericSuccess(
      [
        `Added behavior "${behaviorName}" (type "${behavior_type}") to "${object_name}".`,
        propertiesText,
      ].join(' ')
    );
  },
  modifiesProject: true,
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
          Remove <b>{behavior_name}</b> behavior from <b>{object_name}</b> in
          scene {scene_name}.
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
    const layoutObjects = layout.getObjects();
    const globalObjects = project.getObjects();

    let object: gdObject | null = null;

    if (layoutObjects.hasObjectNamed(object_name)) {
      object = layoutObjects.getObject(object_name);
    } else if (globalObjects.hasObjectNamed(object_name)) {
      object = globalObjects.getObject(object_name);
    }

    if (!object) {
      return makeGenericFailure(
        `Object not found: "${object_name}" in scene "${scene_name}" nor globally.`
      );
    }

    if (!object.hasBehaviorNamed(behavior_name)) {
      return makeGenericFailure(
        `Behavior "${behavior_name}" not on "${object_name}". Not removed.`
      );
    }

    const dependentBehaviors = gd.WholeProjectRefactorer.findDependentBehaviorNames(
      project,
      object,
      behavior_name
    ).toJSArray();

    // Remove the behavior
    object.removeBehavior(behavior_name);
    dependentBehaviors.forEach(name => {
      if (!object) return;
      object.removeBehavior(name);
    });

    return makeGenericSuccess(
      dependentBehaviors.length > 0
        ? `Removed behavior "${behavior_name}" from "${object_name}" (also removed dependents: ${dependentBehaviors.join(
            ', '
          )}).`
        : `Removed behavior "${behavior_name}" from "${object_name}".`
    );
  },
  modifiesProject: true,
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
          Read <b>{behavior_name}</b>'s settings on <b>{object_name}</b> in
          scene {scene_name}.
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
    const layoutObjects = layout.getObjects();
    const globalObjects = project.getObjects();

    let object: gdObject | null = null;

    if (layoutObjects.hasObjectNamed(object_name)) {
      object = layoutObjects.getObject(object_name);
    } else if (globalObjects.hasObjectNamed(object_name)) {
      object = globalObjects.getObject(object_name);
    }

    if (!object) {
      return makeGenericFailure(
        `Object not found: "${object_name}" in scene "${scene_name}" nor globally.`
      );
    }

    if (!object.hasBehaviorNamed(behavior_name)) {
      return makeGenericFailure(
        `Behavior "${behavior_name}" not on "${object_name}".`
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
      // $FlowFixMe[incompatible-type]
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
  modifiesProject: false,
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
              Update <b>{label}</b> of behavior {behavior_name} on object{' '}
              <b>{object_name}</b> (in scene{' '}
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
            Update {changes.length} settings of behavior {behavior_name} on
            object {object_name} (in scene {scene_name}).
          </Trans>
        ),
        hasDetailsToShow: true,
        details: shouldShowDetails ? (
          <ColumnStackLayout noMargin>
            {changes.map(change => (
              <Text key={change.label} noMargin size="body-small">
                <Trans>
                  <b>{change.label}</b> set to {change.newValue}.
                </Trans>
              </Text>
            ))}
          </ColumnStackLayout>
        ) : null,
      };
    };

    if (!project || !project.hasLayoutNamed(scene_name)) {
      // $FlowFixMe[incompatible-type]
      return renderChanges(
        listLabelAndValuesFromChangedProperties(changed_properties)
      );
    }

    const layout = project.getLayout(scene_name);
    const layoutObjects = layout.getObjects();
    const globalObjects = project.getObjects();

    let object: gdObject | null = null;

    if (layoutObjects.hasObjectNamed(object_name)) {
      object = layoutObjects.getObject(object_name);
    } else if (globalObjects.hasObjectNamed(object_name)) {
      object = globalObjects.getObject(object_name);
    }

    if (!object) {
      // $FlowFixMe[incompatible-type]
      return renderChanges(
        listLabelAndValuesFromChangedProperties(changed_properties)
      );
    }

    if (!object.hasBehaviorNamed(behavior_name)) {
      // $FlowFixMe[incompatible-type]
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

    // $FlowFixMe[incompatible-type]
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
    const layoutObjects = layout.getObjects();
    const globalObjects = project.getObjects();

    let object: gdObject | null = null;

    if (layoutObjects.hasObjectNamed(object_name)) {
      object = layoutObjects.getObject(object_name);
    } else if (globalObjects.hasObjectNamed(object_name)) {
      object = globalObjects.getObject(object_name);
    }

    if (!object) {
      return makeGenericFailure(
        `Object not found: "${object_name}" in scene "${scene_name}" nor globally.`
      );
    }

    if (!object.hasBehaviorNamed(behavior_name)) {
      return makeGenericFailure(
        `Behavior "${behavior_name}" not on "${object_name}".`
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
    // $FlowFixMe[missing-empty-array-annot]
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
          `Missing "property_name" or "new_value" in changed_properties item: ${JSON.stringify(
            changed_property
          )}. Skipped.`
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
        const sanitizedNewValue = sanitizePropertyNewValue(
          foundProperty,
          newValue
        );
        if (!behavior.updateProperty(foundPropertyName, sanitizedNewValue)) {
          warnings.push(
            `Could not set "${foundPropertyName}" on behavior "${behavior_name}": invalid value or type.`
          );
          return;
        }

        const { propertyWarnings, propertyChanges } = verifyPropertyChange({
          propertyNameWithLocation: `"${foundPropertyName}" on behavior "${behavior_name}"`,
          newProperties: behavior.getProperties(),
          propertyName: foundPropertyName,
          requestedNewValue: sanitizedNewValue,
        });
        warnings.push(...propertyWarnings);
        // $FlowFixMe[incompatible-type]
        changes.push(...propertyChanges);
      } else if (
        behaviorSharedData &&
        behaviorSharedDataPropertySearch.foundPropertyName
      ) {
        const {
          foundPropertyName,
          foundProperty,
        } = behaviorSharedDataPropertySearch;
        const sanitizedNewValue = sanitizePropertyNewValue(
          foundProperty,
          newValue
        );
        if (
          !behaviorSharedData.updateProperty(
            foundPropertyName,
            sanitizedNewValue
          )
        ) {
          warnings.push(
            `Could not set shared "${foundPropertyName}" on behavior "${behavior_name}": invalid value or type.`
          );
          return;
        }

        const { propertyWarnings, propertyChanges } = verifyPropertyChange({
          propertyNameWithLocation: `"${foundPropertyName}" on shared behavior "${behavior_name}"`,
          newProperties: behavior.getProperties(),
          propertyName: foundPropertyName,
          requestedNewValue: sanitizedNewValue,
        });
        warnings.push(...propertyWarnings);
        // $FlowFixMe[incompatible-type]
        changes.push(...propertyChanges);
      } else {
        warnings.push(
          `Property "${propertyName}" not on behavior "${behavior_name}" of "${object_name}".`
        );
      }
    });

    // $FlowFixMe[incompatible-type]
    return makeMultipleChangesOutput(changes, warnings);
  },
  modifiesProject: true,
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
          Read instances in scene{' '}
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
  launchFunction: async ({ project, args, PixiResourcesLoader }) => {
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
    const layoutObjects = layout.getObjects();
    const globalObjects = project.getObjects();
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

          const objectName = instance.getObjectName();
          let object = null;
          if (layoutObjects.hasObjectNamed(objectName)) {
            object = layoutObjects.getObject(objectName);
          } else if (globalObjects.hasObjectNamed(objectName)) {
            object = globalObjects.getObject(objectName);
          }

          const defaultSize = object
            ? getObjectSizeInfo(object, project, PixiResourcesLoader)
            : { width: 0, height: 0, depth: 0 };

          const width = instance.hasCustomSize()
            ? instance.getCustomWidth()
            : defaultSize.width;
          const height = instance.hasCustomSize()
            ? instance.getCustomHeight()
            : defaultSize.height;
          const depth = instance.hasCustomDepth()
            ? instance.getCustomDepth()
            : defaultSize.depth;

          const serializedInstance = serializeToJSObject(instance);
          instances.push({
            ...serializedInstance,
            // Replace persistentUuid by id:
            persistentUuid: undefined,
            id: instance.getPersistentUuid().slice(0, 10),
            // Actual computed dimensions (accounting for default size when no custom size is set):
            width,
            height,
            depth,
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
  modifiesProject: false,
};

const iterateOnInstances = (
  initialInstances: gdInitialInstancesContainer,
  callback: gdInitialInstance => void
) => {
  const instanceGetter = new gd.InitialInstanceJSFunctor();
  // $FlowFixMe[cannot-write]
  instanceGetter.invoke = instancePtr => {
    const instance: gdInitialInstance = gd.wrapPointer(
      // $FlowFixMe[incompatible-type]
      instancePtr,
      gd.InitialInstance
    );
    callback(instance);
  };
  // $FlowFixMe[incompatible-type]
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
            Place {newInstancesCount} <b>{object_name}</b> instance(s) at{' '}
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
            Move {existingInstanceCount} <b>{object_name}</b> instance(s) to{' '}
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
            Place {newInstancesCount} and move {existingInstanceCount}{' '}
            <b>{object_name}</b> instance(s) to{' '}
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
    PixiResourcesLoader,
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
    const globalObjects = project.getObjects();

    let namedObject: gdObject | null = null;
    if (object_name) {
      if (objectsContainer.hasObjectNamed(object_name)) {
        namedObject = objectsContainer.getObject(object_name);
      } else if (globalObjects.hasObjectNamed(object_name)) {
        namedObject = globalObjects.getObject(object_name);
      }
    }
    const objectSizeInfo = namedObject
      ? getObjectSizeInfo(namedObject, project, PixiResourcesLoader)
      : null;

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
      const instancesToDelete = new Set<gdInitialInstance>();
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
      const eraseResult: EditorFunctionGenericOutput = {
        success: true,
        message: [
          `Erased ${instancesToDelete.size} instance${
            instancesToDelete.size > 1 ? 's' : ''
          }.`,
          notFoundExistingInstanceIds.size > 0
            ? `Instance ids not found: ${Array.from(
                notFoundExistingInstanceIds
              ).join(', ')}. Verify ids and layer names.`
            : '',
        ]
          .filter(Boolean)
          .join(' '),
      };
      if (object_name && objectSizeInfo)
        eraseResult.objectSizeInfo = { [object_name]: objectSizeInfo };
      return eraseResult;
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
          `Specified ${newInstancesCount} instances but no object_name. Specify object_name.`
        );
      }

      if (
        object_name &&
        !objectsContainer.hasObjectNamed(object_name) &&
        !project.getObjects().hasObjectNamed(object_name)
      ) {
        return makeGenericFailure(
          `Object "${object_name}" not in scene "${scene_name}". Use only existing objects (create them first if needed).`
        );
      }

      // Store original states of existing instances for comparison
      // $FlowFixMe[underconstrained-implicit-instantiation]
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
        const attrs = [];
        if (instancesSize)
          attrs.push(`size ${instancesSize[0]}x${instancesSize[1]}`);
        if (instancesRotation !== null)
          attrs.push(`rotation ${instancesRotation}°`);
        if (instancesOpacity !== null)
          attrs.push(`opacity ${instancesOpacity}`);
        if (instances_z_order !== null)
          attrs.push(`z-order ${instances_z_order}`);
        changes.push(
          `Created ${newInstancesCount} new instance${
            newInstancesCount > 1 ? 's' : ''
          } of object "${object_name ||
            ''}" using ${brush_kind} brush at ${brushPosition.join(
            ', '
          )} on layer "${layer_name || 'base'}"${
            attrs.length > 0 ? ` (${attrs.join(', ')})` : ''
          }.`
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
          `Instance ids not found: ${Array.from(
            notFoundExistingInstanceIds
          ).join(', ')}. Verify ids and layer names.`
        );
      }

      if (changes.length === 0) {
        return makeGenericSuccess(
          'No instance changes. Specify brush kind/position/count, or exact instance ids to manipulate.'
        );
      }

      // /!\ Tell the editor that some instances have potentially been modified (and even removed).
      // This will force the instances editor to destroy and mount again the
      // renderers to avoid keeping any references to existing instances, and also drop any selection.
      onInstancesModifiedOutsideEditor({
        scene: layout,
      });
      const put2dResult: EditorFunctionGenericOutput = {
        success: true,
        message: changes.join(' '),
      };
      if (object_name && objectSizeInfo)
        put2dResult.objectSizeInfo = { [object_name]: objectSizeInfo };
      return put2dResult;
    }
  },
  modifiesProject: true,
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
            Place {newInstancesCount} <b>{object_name}</b> instance(s) at{' '}
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
            Move {existingInstanceCount} <b>{object_name}</b> instance(s) to{' '}
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
            Place {newInstancesCount} and move {existingInstanceCount}{' '}
            <b>{object_name}</b> instance(s) to{' '}
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
    PixiResourcesLoader,
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
    const globalObjects = project.getObjects();

    let namedObject: gdObject | null = null;
    if (object_name) {
      if (objectsContainer.hasObjectNamed(object_name)) {
        namedObject = objectsContainer.getObject(object_name);
      } else if (globalObjects.hasObjectNamed(object_name)) {
        namedObject = globalObjects.getObject(object_name);
      }
    }
    const objectSizeInfo = namedObject
      ? getObjectSizeInfo(namedObject, project, PixiResourcesLoader)
      : null;

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
      const instancesToDelete = new Set<gdInitialInstance>();
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
      const eraseResult: EditorFunctionGenericOutput = {
        success: true,
        message: [
          `Erased ${instancesToDelete.size} instance${
            instancesToDelete.size > 1 ? 's' : ''
          }.`,
          notFoundExistingInstanceIds.size > 0
            ? `Instance ids not found: ${Array.from(
                notFoundExistingInstanceIds
              ).join(', ')}. Verify ids and layer names.`
            : '',
        ]
          .filter(Boolean)
          .join(' '),
      };
      if (object_name && objectSizeInfo)
        eraseResult.objectSizeInfo = { [object_name]: objectSizeInfo };
      return eraseResult;
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
          `Specified ${newInstancesCount} instances but no object_name. Specify object_name.`
        );
      }

      if (
        object_name &&
        !objectsContainer.hasObjectNamed(object_name) &&
        !project.getObjects().hasObjectNamed(object_name)
      ) {
        return makeGenericFailure(
          `Object "${object_name}" not in scene "${scene_name}". Use only existing objects (create them first if needed).`
        );
      }

      // Store original states of existing instances for comparison
      // $FlowFixMe[underconstrained-implicit-instantiation]
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
        const attrs = [];
        if (instancesSizeArray && instancesSizeArray.length >= 3)
          attrs.push(
            `size ${instancesSizeArray[0]}x${instancesSizeArray[1]}x${
              instancesSizeArray[2]
            }`
          );
        if (instancesRotationArray && instancesRotationArray.length >= 3)
          attrs.push(
            `rotation (${instancesRotationArray[0]}°, ${
              instancesRotationArray[1]
            }°, ${instancesRotationArray[2]}°)`
          );
        changes.push(
          `Created ${newInstancesCount} new instance${
            newInstancesCount > 1 ? 's' : ''
          } of object "${object_name ||
            ''}" using ${brush_kind} brush at ${brushPosition.join(
            ', '
          )} on layer "${layer_name || 'base'}"${
            attrs.length > 0 ? ` (${attrs.join(', ')})` : ''
          }.`
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
          `Instance ids not found: ${Array.from(
            notFoundExistingInstanceIds
          ).join(', ')}. Verify ids and layer names.`
        );
      }

      if (changes.length === 0) {
        return makeGenericSuccess('No instance changes.');
      }

      // /!\ Tell the editor that some instances have potentially been modified (and even removed).
      // This will force the instances editor to destroy and mount again the
      // renderers to avoid keeping any references to existing instances, and also drop any selection.
      onInstancesModifiedOutsideEditor({
        scene: layout,
      });
      const put3dResult: EditorFunctionGenericOutput = {
        success: true,
        message: changes.join(' '),
      };
      if (object_name && objectSizeInfo)
        put3dResult.objectSizeInfo = { [object_name]: objectSizeInfo };
      return put3dResult;
    }
  },
  modifiesProject: true,
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
          Read events in scene{' '}
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
  modifiesProject: false,
};

/**
 * Adds a new event to a scene's event sheet
 */
const addSceneEvents: EditorFunction = {
  renderForEditor: ({
    args,
    shouldShowDetails,
    editorCallbacks,
    editorFunctionCallResultOutput,
  }) => {
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
            size="body-small"
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
            size="body-small"
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
            size="body-small"
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
            Write events for scene{' '}
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
        details,
        hasDetailsToShow: true,
      };
    } else if (placementHint) {
      return {
        text: (
          <Trans>
            Adapt events in scene{' '}
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
            Update events in scene{' '}
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
        details,
        hasDetailsToShow: true,
      };
    }
  },
  launchFunction: async ({
    project,
    args,
    toolOptions,
    relatedAiRequestId,
    generateEvents,
    onSceneEventsModifiedOutsideEditor,
    ensureExtensionInstalled,
    onWillInstallExtension,
    onExtensionInstalled,
    searchAndInstallResources,
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
    const estimatedComplexity = SafeExtractor.extractNumberProperty(
      args,
      'estimated_complexity'
    );
    const objectsList = objectsListArgument === null ? '' : objectsListArgument;
    const placementHint =
      SafeExtractor.extractStringProperty(args, 'placement_hint') || '';

    if (!project.hasLayoutNamed(sceneName)) {
      return makeGenericFailure(`Scene not found: "${sceneName}".`);
    }
    if (!relatedAiRequestId) {
      return makeGenericFailure(
        'No related AI request ID found for events generation.'
      );
    }
    const scene = project.getLayout(sceneName);
    const currentSceneEvents = scene.getEvents();

    const existingEventsAsText = renderNonTranslatedEventsAsText({
      eventsList: currentSceneEvents,
    });
    const existingEventsJson =
      toolOptions && toolOptions.includeEventsJson
        ? serializeToJSON(currentSceneEvents)
        : null;

    try {
      const eventsGenerationResult: EventsGenerationResult = await generateEvents(
        {
          sceneName,
          eventsDescription,
          extensionNamesList,
          objectsList,
          existingEventsAsText,
          existingEventsJson,
          placementHint,
          relatedAiRequestId,
          estimatedComplexity,
        }
      );

      if (eventsGenerationResult.generationAborted) {
        return { success: false, aborted: true };
      }

      if (!eventsGenerationResult.generationCompleted) {
        return makeGenericFailure(
          `Infrastructure error during events generation (${
            eventsGenerationResult.errorMessage
          }). Try again or a different approach.`
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
        // $FlowFixMe[incompatible-type]
        return makeAiGeneratedEventFailure(
          `Infrastructure error generating events (${
            aiGeneratedEvent.error.message
          }). Try again or a different approach.`
        );
      }

      const changes = aiGeneratedEvent.changes;
      if (!changes || changes.length === 0) {
        const resultMessage =
          aiGeneratedEvent.resultMessage ||
          'No generated events and no other info given.';
        // $FlowFixMe[incompatible-type]
        return makeAiGeneratedEventFailure(
          `Error generating events: ${resultMessage}\nTry again or a different approach.`
        );
      }

      if (
        changes.some(change => change.isEventsJsonValid === false) ||
        changes.some(change => change.areEventsValid === false)
      ) {
        const resultMessage =
          aiGeneratedEvent.resultMessage ||
          'Likely the request is not possible.';
        // $FlowFixMe[incompatible-type]
        return makeAiGeneratedEventFailure(
          `Generated events invalid: ${resultMessage}\nSee diagnostics; retry differently or use a different approach.`,
          {
            generatedEventsErrorDiagnostics: changes
              .map(change => change.diagnosticLines.join('\n'))
              .join('\n\n'),
          }
        );
      }

      try {
        const extensionNames = new Set<string>();
        for (const change of changes) {
          for (const extensionName of change.extensionNames || []) {
            extensionNames.add(extensionName);
          }
        }
        for (const extensionName of extensionNames) {
          await ensureExtensionInstalled({
            extensionName,
            onWillInstallExtension,
            onExtensionInstalled,
          });
        }
      } catch (e) {
        // $FlowFixMe[incompatible-type]
        return makeAiGeneratedEventFailure(
          `Error installing extensions: ${e.message}. Try again or a different approach.`
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

        const { applied, errors } = applyEventsChanges(
          project,
          currentSceneEvents,
          changes,
          aiGeneratedEvent.id
        );

        if (applied === 0) {
          return {
            success: false,
            message: `Events generated but not applied. Generation output:

${aiGeneratedEvent.resultMessage || '(none)'}

No project changes; see errors.`,
            errors,
          };
        }

        onSceneEventsModifiedOutsideEditor({
          scene,
          newOrChangedAiGeneratedEventIds: new Set([aiGeneratedEvent.id]),
        });

        // Search and install missing resources if any
        const allMissingResources = changes.flatMap(
          change => change.missingResources || []
        );
        const {
          results: newlyAddedResources,
        } = await searchAndInstallResources({
          resources: allMissingResources,
        });

        const resultMessage =
          errors.length > 0
            ? `Events generated but some applies failed. Generation output:

${aiGeneratedEvent.resultMessage || '(none)'}

See errors; verify event contents if needed.`
            : aiGeneratedEvent.resultMessage ||
              'Modified or added event(s).';
        return {
          success: true,
          message: resultMessage,
          aiGeneratedEventId: aiGeneratedEvent.id,
          newlyAddedResources,
          ...(errors.length > 0 ? { errors } : undefined),
        };
      } catch (error) {
        console.error(
          `Unexpected error when adding events from an AI Generated Event (id: ${
            aiGeneratedEvent.id
          }):`,
          error
        );
        // $FlowFixMe[incompatible-type]
        return makeAiGeneratedEventFailure(
          `Unexpected error adding generated events: ${error.message}. Try a different approach.`
        );
      }
    } catch (error) {
      console.error(
        'Unexpected error when creating AI Generated Event:',
        error
      );
      return makeGenericFailure(
        `Unexpected error creating generated events: ${error.message}. Try a different approach.`
      );
    }
  },
  modifiesProject: true,
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
          Create scene <b>{scene_name}</b>.{' '}
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
          `Scene "${scene_name}" already exists; added "UI" layer.`
        );
      }

      return makeGenericSuccess(
        `Scene "${scene_name}" already exists.`
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
        ? `Created scene "${scene_name}" with base layer + "UI" layer.`
        : `Created scene "${scene_name}".`,
      meta: {
        newSceneNames: [scene_name],
      },
    };
  },
  modifiesProject: true,
};

/**
 * Deletes an existing scene
 */
const deleteScene: EditorFunction = {
  renderForEditor: ({ args }) => {
    const scene_name = extractRequiredString(args, 'scene_name');

    return {
      text: (
        <Trans>
          Remove scene <b>{scene_name}</b>.
        </Trans>
      ),
    };
  },
  launchFunction: async ({ project, args }) => {
    const scene_name = extractRequiredString(args, 'scene_name');

    if (!project.hasLayoutNamed(scene_name)) {
      return makeGenericSuccess(
        `Scene "${scene_name}" already absent.`
      );
    }

    project.removeLayout(scene_name);

    return makeGenericSuccess(`Deleted scene "${scene_name}".`);
  },
  modifiesProject: true,
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
          Read <b>{scene_name}</b>'s scene settings.
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
  modifiesProject: false,
};

const isFuzzyMatch = (string1: string, string2: string) => {
  const simplifiedString1 = string1.toLowerCase().replace(/\s|_|-/g, '');
  const simplifiedString2 = string2.toLowerCase().replace(/\s|_|-/g, '');

  return simplifiedString1 === simplifiedString2;
};

const changeScenePropertiesLayersEffectsGroups: EditorFunction = {
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
    const changed_groups = SafeExtractor.extractArrayProperty(
      args,
      'changed_groups'
    );

    const changedPropertiesCount =
      (changed_properties && changed_properties.length) || 0;
    const changedLayersCount = (changed_layers && changed_layers.length) || 0;
    const changedLayerEffectsCount =
      (changed_layer_effects && changed_layer_effects.length) || 0;
    const changedGroupsCount = (changed_groups && changed_groups.length) || 0;

    return {
      text:
        changedPropertiesCount > 0 &&
        changedLayersCount > 0 &&
        changedLayerEffectsCount > 0 &&
        changedGroupsCount > 0 ? (
          <Trans>
            Update some scene properties, layers, effects and groups for scene{' '}
            {scene_name}.
          </Trans>
        ) : changedPropertiesCount > 0 &&
          changedLayersCount > 0 &&
          changedGroupsCount > 0 ? (
          <Trans>
            Update some scene properties, layers and groups for scene{' '}
            {scene_name}.
          </Trans>
        ) : changedPropertiesCount > 0 &&
          changedLayerEffectsCount > 0 &&
          changedGroupsCount > 0 ? (
          <Trans>
            Update some scene properties, effects and groups for scene{' '}
            {scene_name}.
          </Trans>
        ) : changedLayerEffectsCount > 0 &&
          changedLayersCount > 0 &&
          changedGroupsCount > 0 ? (
          <Trans>
            Update some scene effects, layers and groups for scene {scene_name}.
          </Trans>
        ) : changedPropertiesCount > 0 && changedGroupsCount > 0 ? (
          <Trans>
            Update some scene properties and groups for scene {scene_name}.
          </Trans>
        ) : changedLayersCount > 0 && changedGroupsCount > 0 ? (
          <Trans>
            Update some scene layers and groups for scene {scene_name}.
          </Trans>
        ) : changedLayerEffectsCount > 0 && changedGroupsCount > 0 ? (
          <Trans>
            Update some scene effects and groups for scene {scene_name}.
          </Trans>
        ) : changedPropertiesCount > 0 && changedLayersCount > 0 ? (
          <Trans>
            Update some scene properties and layers for scene {scene_name}.
          </Trans>
        ) : changedPropertiesCount > 0 && changedLayerEffectsCount > 0 ? (
          <Trans>
            Update some scene properties and effects for scene {scene_name}.
          </Trans>
        ) : changedLayerEffectsCount > 0 && changedLayersCount > 0 ? (
          <Trans>
            Update some scene effects and layers for scene {scene_name}.
          </Trans>
        ) : changedPropertiesCount > 0 ? (
          <Trans>Update some scene properties for scene {scene_name}.</Trans>
        ) : changedLayersCount > 0 ? (
          <Trans>Update some scene layers for scene {scene_name}.</Trans>
        ) : changedLayerEffectsCount > 0 ? (
          <Trans>Update some scene effects for scene {scene_name}.</Trans>
        ) : changedGroupsCount > 0 ? (
          <Trans>Update some scene groups for scene {scene_name}.</Trans>
        ) : (
          <Trans>Unknown changes attempted for scene {scene_name}.</Trans>
        ),
    };
  },
  launchFunction: async ({
    project,
    args,
    onInstancesModifiedOutsideEditor,
    onObjectGroupsModifiedOutsideEditor,
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
    const changed_groups = SafeExtractor.extractArrayProperty(
      args,
      'changed_groups'
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
            `Missing "property_name" or "new_value" in changed_properties item: ${JSON.stringify(
              changed_property
            )}. Skipped.`
          );
          return;
        }

        if (isFuzzyMatch(propertyName, 'backgroundColor')) {
          const colorAsRgb = hexNumberToRGBArray(rgbOrHexToHexNumber(newValue));
          scene.setBackgroundColor(colorAsRgb[0], colorAsRgb[1], colorAsRgb[2]);
          changes.push('Set scene background color.');
        } else if (isFuzzyMatch(propertyName, 'gameResolutionWidth')) {
          project.setGameResolutionSize(
            parseInt(newValue),
            project.getGameResolutionHeight()
          );
          changes.push('Set game resolution width.');
        } else if (isFuzzyMatch(propertyName, 'stopSoundsOnStartup')) {
          scene.setStopSoundsOnStartup(newValue.toLowerCase() === 'true');
          changes.push('Set stopSoundsOnStartup.');
        } else if (isFuzzyMatch(propertyName, 'gameResolutionHeight')) {
          project.setGameResolutionSize(
            project.getGameResolutionWidth(),
            parseInt(newValue)
          );
          changes.push('Set game resolution height.');
        } else if (isFuzzyMatch(propertyName, 'gameOrientation')) {
          project.setOrientation(newValue);
          changes.push('Set game orientation.');
        } else if (isFuzzyMatch(propertyName, 'gameScaleMode')) {
          project.setScaleMode(newValue);
          changes.push('Set game scale mode.');
        } else if (isFuzzyMatch(propertyName, 'gameName')) {
          project.setName(newValue);
          changes.push('Set game name.');
        } else {
          warnings.push(
            `Unknown scene property: "${propertyName}". Skipped.`
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
            `Missing "layer_name" in changed_layers item. Skipped.`
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
            `Missing "layer_name" in changed_layer_effects item. Skipped.`
          );
          return;
        }
        if (!scene.hasLayerNamed(layerName)) {
          warnings.push(
            `Layer "${layerName}" not found. Effects skipped.`
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
            `Missing "effect_name" in changed_layer_effects item. Skipped.`
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
              `Effect "${effectName}" not found. Skipped.`
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
              `Effect "${effectName}" invalid. Skipped.`
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
                `Missing "property_name" or "new_value" in changed_properties item. Skipped.`
              );
              return;
            }

            const { foundProperty } = findPropertyByName({
              properties: effectProperties,
              name: propertyName,
            });
            if (!foundProperty) {
              warnings.push(
                `Property "${propertyName}" not on effect "${effectName}". Skipped.`
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

    if (changed_groups) {
      const groups = scene.getObjects().getObjectGroups();
      changed_groups.forEach(changed_group => {
        const groupName = SafeExtractor.extractStringProperty(
          changed_group,
          'group_name'
        );
        const newGroupName = SafeExtractor.extractStringProperty(
          changed_group,
          'new_group_name'
        );
        const deleteThisGroup = SafeExtractor.extractBooleanProperty(
          changed_group,
          'delete_this_group'
        );
        const objects = SafeExtractor.extractArrayProperty(
          changed_group,
          'objects'
        );
        if (groupName === null) {
          warnings.push(
            `Missing "group_name" in changed_groups item. Skipped.`
          );
          return;
        }

        let foundGroup: gdObjectGroup;
        if (!groups.has(groupName)) {
          // Create the group if it does not exist yet.
          foundGroup = groups.insertNew(groupName, groups.count());
        } else {
          foundGroup = groups.get(groupName);
        }

        if (deleteThisGroup) {
          groups.remove(groupName);
          changes.push(
            `Deleted group "${groupName}" from scene "${scene_name}".`
          );
        } else {
          if (newGroupName) {
            gd.WholeProjectRefactorer.objectOrGroupRenamedInScene(
              project,
              scene,
              foundGroup.getName(),
              newGroupName,
              /* isObjectGroup=*/ true
            );
            foundGroup.setName(newGroupName);
            changes.push(
              `Renamed group "${groupName}" to "${newGroupName}" in scene "${scene_name}".`
            );
          }
          if (objects) {
            const newObjectNames = objects
              .map(object =>
                SafeExtractor.extractStringProperty(object, 'object_name')
              )
              .filter(Boolean);
            // Remove objects that are not in the list, and add new objects.
            const currentObjectNames = foundGroup
              .getAllObjectsNames()
              .toJSArray();
            currentObjectNames.forEach(objectName => {
              if (!newObjectNames.includes(objectName)) {
                foundGroup.removeObject(objectName);
              }
            });
            const globalObjects = project.getObjects();
            const sceneObjects = scene.getObjects();
            newObjectNames.forEach(objectName => {
              if (!currentObjectNames.includes(objectName)) {
                if (
                  sceneObjects.hasObjectNamed(objectName) ||
                  globalObjects.hasObjectNamed(objectName)
                ) {
                  foundGroup.addObject(objectName);
                } else {
                  warnings.push(
                    `Object "${objectName}" not found in scene "${scene_name}", so it was not added to group "${groupName}".`
                  );
                }
              }
            });
            changes.push(
              `Modified objects of group "${groupName}" in scene "${scene_name}".`
            );
          }
        }
      });

      // Notify the editor that object groups have been modified
      onObjectGroupsModifiedOutsideEditor({
        scene,
      });
    }

    if (changes.length === 0 && warnings.length === 0) {
      return {
        success: false,
        message: 'No changes.',
      };
    } else if (changes.length === 0 && warnings.length > 0) {
      return {
        success: false,
        message: 'No changes. See warnings.',
        warnings: warnings.join('\n'),
      };
    } else if (changes.length > 0 && warnings.length === 0) {
      return {
        success: true,
        message: ['Done.', ...changes].join('\n'),
      };
    } else {
      return {
        success: true,
        message: ['Done with warnings.', ...changes].join('\n'),
        warnings: warnings.join('\n'),
      };
    }
  },
  modifiesProject: true,
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
        <Text noMargin allowSelection color="secondary" size="body-small">
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
            Set scene variable <b>{variable_name_or_path}</b> in scene{' '}
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
            Set <b>{object_name}</b>'s variable <b>{variable_name_or_path}</b>.
          </Trans>
        ),
        details,
        hasDetailsToShow: true,
      };
    } else if (variable_scope === 'global') {
      return {
        text: (
          <Trans>
            Set global variable <b>{variable_name_or_path}</b>.
          </Trans>
        ),
        details,
        hasDetailsToShow: true,
      };
    }

    return {
      text: (
        <Trans>
          Set variable <b>{variable_name_or_path}</b>.
        </Trans>
      ),
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
    let scopeDescription;
    if (variable_scope === 'scene') {
      if (!scene_name) {
        return makeGenericFailure(
          `Missing "scene_name" (required for scene variable).`
        );
      }
      if (!project.hasLayoutNamed(scene_name)) {
        return makeGenericFailure(`Scene not found: "${scene_name}".`);
      }
      variablesContainer = project.getLayout(scene_name).getVariables();
      scopeDescription = `scene "${scene_name}"`;
    } else if (variable_scope === 'object') {
      if (!object_name) {
        return makeGenericFailure(
          `Missing "object_name" (required for object variable).`
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
            `Object "${object_name}" not in scene "${scene_name}". For a global object, omit scene_name.`
          );
        }
        scopeDescription = `scene "${scene_name}" object "${object_name}"`;
      } else {
        objectsContainer = project.getObjects();
        if (!objectsContainer.hasObjectNamed(object_name)) {
          return makeGenericFailure(
            `Object "${object_name}" not found globally. Did you forget to specify scene_name?`
          );
        }
        scopeDescription = `global object "${object_name}"`;
      }

      variablesContainer = objectsContainer
        .getObject(object_name)
        .getVariables();
    } else if (variable_scope === 'global') {
      variablesContainer = project.getVariables();
      scopeDescription = 'global';
    } else {
      return makeGenericFailure(
        `Invalid "variable_scope": "${variable_scope}". Use \`scene\`, \`object\` or \`global\`.`
      );
    }

    const { addedNewVariable, variableType } = applyVariableChange({
      variablePath: variable_name_or_path,
      forcedVariableType: variable_type,
      variablesContainer,
      value,
    });

    const truncatedValue = truncateValue(value);
    return makeGenericSuccess(
      addedNewVariable
        ? `Added ${scopeDescription} variable "${variable_name_or_path}" (${variableType}) = ${truncatedValue}`
        : `Edited ${scopeDescription} variable "${variable_name_or_path}" = ${truncatedValue}`
    );
  },
  modifiesProject: true,
};

const createOrUpdatePlan: EditorFunction = {
  renderForEditor: ({ args }) => {
    return {
      text: <Trans>Update the plan.</Trans>,
    };
  },
  launchFunction: async ({ args }) => {
    return makeGenericFailure(
      `Unable to create or update plan - this is handled server-side.`
    );
  },
  modifiesProject: false,
};

const readFullDocs: EditorFunction = {
  renderForEditor: ({ args }) => {
    const extension_names = SafeExtractor.extractStringProperty(
      args,
      'extension_names'
    );

    return {
      text: <Trans>Read docs for {extension_names}.</Trans>,
    };
  },
  launchFunction: async ({ args }) => {
    return makeGenericFailure(
      `Unable to read full documentation - continue with your existing GDevelop knowledge.`
    );
  },
  modifiesProject: false,
};

const initializeProject: EditorFunctionWithoutProject = {
  renderForEditor: ({ args }) => {
    const project_name = extractRequiredString(args, 'project_name');

    return {
      text: (
        <Trans>
          Set up the base for your project <b>{project_name}</b>.
        </Trans>
      ),
    };
  },
  launchFunction: async ({ args, editorCallbacks, i18n }) => {
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
            // $FlowFixMe[prop-missing]
            scene.getName()
          ] = renderNonTranslatedEventsAsText({
            eventsList: events,
          });
        });

        output.eventsAsTextByScene = eventsAsTextByScene;
      }

      if (exampleSlug) {
        output.message = `Initialized project from template "${exampleSlug}".`;
        output.initializedProject = true;
        output.initializedFromTemplateSlug = exampleSlug;
      } else {
        if (template_slug) {
          output.message = `Initialized empty project (1 scene).`;
          output.initializedProject = true;
        } else {
          output.message = `Initialized empty project (1 scene).`;
          output.initializedProject = true;
        }
      }
      output.meta = {
        // Do not include the scene names, as the project will automatically
        // open the scenes.
        createdProject,
      };

      return output;
    } catch (error) {
      return makeGenericFailure(
        'Unable to initialize project (possibly a network error). Try again.'
      );
    }
  },
  modifiesProject: true,
};

const runExplorerAgent: EditorFunction = {
  renderForEditor: ({ args }) => {
    return {
      text: <Trans>Exploring the game.</Trans>,
    };
  },
  launchFunction: async ({ args }) => {
    return makeGenericFailure(
      `Unable to run project explorer agent - this is handled server-side.`
    );
  },
  modifiesProject: false,
};

const runEditAgent: EditorFunction = {
  renderForEditor: ({ args }) => {
    return {
      text: <Trans>Editing the game.</Trans>,
    };
  },
  launchFunction: async ({ args }) => {
    return makeGenericFailure(
      `Unable to run project edit agent - this is handled server-side.`
    );
  },
  modifiesProject: true,
};

const readGameProjectJson: EditorFunction = {
  renderForEditor: ({ args }) => {
    return {
      text: <Trans>Inspect the game structure.</Trans>,
    };
  },
  launchFunction: async ({ args }) => {
    return makeGenericFailure(
      `Unable to get game project JSON - this is handled server-side.`
    );
  },
  modifiesProject: false,
};

const searchObjectAssetStore: EditorFunction = {
  renderForEditor: ({ args }) => {
    return {
      text: <Trans>Searching the asset store.</Trans>,
    };
  },
  launchFunction: async ({ args }) => {
    return makeGenericFailure(
      `Unable to search the asset store - this is handled server-side.`
    );
  },
  modifiesProject: false,
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
  change_scene_properties_layers_effects_groups: changeScenePropertiesLayersEffectsGroups,
  add_or_edit_variable: addOrEditVariable,
  read_full_docs: readFullDocs,

  create_or_update_plan: createOrUpdatePlan,

  run_explorer_agent: runExplorerAgent,
  run_edit_agent: runEditAgent,
  read_game_project_json: readGameProjectJson,
  search_object_asset_store: searchObjectAssetStore,
};

export const editorFunctionsWithoutProject: {
  [string]: EditorFunctionWithoutProject,
} = {
  initialize_project: initializeProject,
};
