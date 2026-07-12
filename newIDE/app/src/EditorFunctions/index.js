// @flow
import * as React from 'react';
import {
  getInstancesInLayoutForLayer,
  renameLayoutInProject,
} from '../Utils/Layout';
import { mapFor, mapVector } from '../Utils/MapFor';
import { SafeExtractor } from '../Utils/SafeExtractor';
import {
  serializeToJSObject,
  serializeToJSON,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { type AiGeneratedEvent } from '../Utils/GDevelopServices/Generation';
import {
  renderNonTranslatedEventsAsText,
  renderNonTranslatedEventsAsTextWithErrors,
  eventsTextRenderingErrorText,
  type EventsTextRenderingError,
} from '../EventsSheet/EventsTree/TextRenderer';
import {
  addMissingObjectBehaviors,
  addObjectUndeclaredVariables,
  addUndeclaredVariables,
  applyEventsChanges,
} from './ApplyEventsChanges';
import { isBehaviorDefaultCapability } from '../BehaviorsEditor/EnumerateBehaviorsMetadata';
import { renameResourcesInProject } from '../ResourcesList/ResourceUtils';
import { Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import Link from '../UI/Link';
import {
  hexNumberToRGBArray,
  rgbColorToHex,
  rgbOrHexToHexNumber,
} from '../Utils/ColorTransformer';
import {
  type SimplifiedBehavior,
  type SimplifiedVariable,
  getSimplifiedVariable,
  getSimplifiedVariablesContainer,
  getVariableTypeAsString,
} from './SimplifiedProject/SimplifiedProject';
import { ColumnStackLayout } from '../UI/Layout';
import Text from '../UI/Text';
import {
  applyVariableChange,
  applyVariableDeletion,
  getVariableAtPath,
} from './ApplyVariableChange';
import {
  addDefaultLightToAllLayers,
  addDefaultLightToLayer,
} from '../ProjectCreation/CreateProject';
import { retryIfFailed } from '../Utils/RetryIfFailed';
import newNameGenerator from '../Utils/NewNameGenerator';
import getObjectByName from '../Utils/GetObjectByName';
import { getAllVisibleBehaviorNames } from '../Utils/Behavior';
import type {
  SceneEventsOutsideEditorChanges,
  InstancesOutsideEditorChanges,
  ObjectsOutsideEditorChanges,
  ObjectGroupsOutsideEditorChanges,
  ProjectItemRenamedOutsideEditorChanges,
  WillDeleteSceneChanges,
  WillDeleteObjectChanges,
} from './OutsideEditorChanges';
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import { swapAsset } from '../AssetStore/AssetSwapper';
import { type EnsureExtensionInstalledOptions } from '../AiGeneration/UseEnsureExtensionInstalled';
import { getObjectFolderOrObjectWithContextFromObjectName } from '../SceneEditor/ObjectFolderOrObjectsSelection';
import {
  getObjectSizeInfo,
  getObjectSizeInfoHints,
  type ObjectSizeInfo,
} from './Utils';

export type HintEntry = {|
  code: string,
  message: string,
  objectNames: Array<string>,
|};

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
  // Per-event/instruction rendering failures (the rest still rendered).
  eventsRenderingErrors?: Array<EventsTextRenderingError>,
  objectName?: string,
  behaviorName?: string,
  properties?: any,
  sharedProperties?: any,
  instances?: any,
  layers?: any,
  effects?: any,
  sceneNames?: Array<string>,
  resources?: any,
  resourcesSummary?: any,
  behaviors?: Array<SimplifiedBehavior>,
  variables?: Array<SimplifiedVariable>,
  reminder?: string,
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
  objectSizeInfo?: { [string]: ObjectSizeInfo | null },

  // Explanation of the coordinate semantics of `instances` positions:
  positionSemantics?: string,

  hints?: Array<HintEntry>,

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

export type EventBatch = {|
  eventsDescription: string,
  eventsScript: string | null,
  placementRelation: string,
  placementTargetEventId: string | null,
  placementExpectedParentEventId: string | null,
  placementRationale: string | null,
|};

export type EventsGenerationOptions = {|
  sceneName: string,
  eventsDescription: string | null,
  eventBatches: Array<EventBatch> | null,
  extensionNamesList: string,
  objectsList: string,
  existingEventsAsText: string,
  existingEventsJson: string | null,
  placementHint: string | null,
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
  // Loaded examples from the example store, when available, so a function can
  // resolve a template slug to its display name. May be null while still loading.
  exampleShortHeaders?: ?Array<ExampleShortHeader>,
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
  onProjectItemRenamedOutsideEditor: (
    changes: ProjectItemRenamedOutsideEditorChanges
  ) => void,
  onWillDeleteScene: (changes: WillDeleteSceneChanges) => Promise<void>,
  onWillDeleteObject: (changes: WillDeleteObjectChanges) => void,
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
  /**
   * Returns the asset store tag for a given object type, when the type is
   * mainly meant to be picked from the asset store (e.g. premade UI objects).
   * Reads from the remote objects registry so it works even before the
   * underlying extension is installed. Returns null if no tag is set or if
   * the registry is not loaded yet.
   */
  getAssetStoreTagForNewObject: (objectType: string) => string | null,
|};

export type LaunchFunctionOptionsWithProject = {|
  ...LaunchFunctionOptionsWithoutProject,
  project: gdProject,
|};

/**
 * A function that does something in the editor on the given project.
 */
export type EditorFunction = {|
  // Optional: a function with no renderForEditor renders nothing in the chat
  // (e.g. backend-only tools, or the plan shown separately). Such calls are
  // skipped in ChatMessages so they don't create an empty bubble.
  renderForEditor?: (
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
  // Optional: a function with no renderForEditor renders nothing in the chat
  // (e.g. backend-only tools, or the plan shown separately). Such calls are
  // skipped in ChatMessages so they don't create an empty bubble.
  renderForEditor?: (
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

const getSceneNotFoundMessage = (
  project: gdProject,
  sceneName: string
): string => {
  const sceneNames = mapFor(
    0,
    project.getLayoutsCount(),
    i => `"${project.getLayoutAt(i).getName()}"`
  );
  return (
    `Scene not found: "${sceneName}". ` +
    (sceneNames.length > 0
      ? `Scenes in this project: ${sceneNames.join(', ')}.`
      : 'The project has no scenes.')
  );
};

const makeSceneNotFoundFailure = (
  project: gdProject,
  sceneName: string
): EditorFunctionGenericOutput =>
  makeGenericFailure(getSceneNotFoundMessage(project, sceneName));

const injectObjectSizeInfo = (
  output: EditorFunctionGenericOutput,
  objectSizeInfoByName: { [string]: ObjectSizeInfo | null }
): EditorFunctionGenericOutput => {
  output.objectSizeInfo = objectSizeInfoByName;
  const hints = getObjectSizeInfoHints(objectSizeInfoByName);
  if (hints.length > 0) {
    output.hints = output.hints ? [...output.hints, ...hints] : hints;
  }
  return output;
};

const INSTANCE_POSITION_SEMANTICS_MESSAGE =
  'Each instance x;y;z is its origin, NOT its center. Unless `objectSizeInfo` indicates a custom origin, the origin is the minimum corner: an instance occupies x to x+width, y to y+height and (in 3D) z to z+depth, so its center is at position + size/2. To center an instance A on top of an instance B: A.x = B.x + (B.width - A.width)/2, A.y = B.y + (B.height - A.height)/2, A.z = B.z + B.depth.';

const getOccupiedSpaceDescription = (
  position: $ReadOnlyArray<number>,
  size: $ReadOnlyArray<number>,
  objectSizeInfo: ObjectSizeInfo | null
): string => {
  const round = (value: number) => Math.round(value * 100) / 100;
  const axes = ['X', 'Y', 'Z'];
  const originOffsets = [0, 0, 0];
  if (objectSizeInfo) {
    const defaultSizes = [
      objectSizeInfo.width,
      objectSizeInfo.height,
      objectSizeInfo.depth,
    ];
    const origins = [
      objectSizeInfo.originX,
      objectSizeInfo.originY,
      objectSizeInfo.originZ,
    ];
    for (let i = 0; i < size.length; i++) {
      const defaultSize = defaultSizes[i];
      const origin = origins[i];
      // Origin offsets are given for the default size - scale them to the actual size.
      if (origin && defaultSize) {
        originOffsets[i] = origin * (size[i] / defaultSize);
      }
    }
  }
  return size
    .map((sizeOnAxis, i) => {
      const min = position[i] - originOffsets[i];
      return `${axes[i]} ${round(min)} to ${round(min + sizeOnAxis)}`;
    })
    .join(', ');
};

const makeGenericSuccess = (message: string): EditorFunctionGenericOutput => ({
  success: true,
  message,
});

// Always tell the AI which asset was chosen, so it can verify the result
// matches the user's request without extra inspection calls. The animations
// count is only real information for sprites and 3D models: other asset types
// have a constant count, or none at all for particle emitters.
const getUsedAssetText = (
  assetShortHeader: AssetShortHeader | null
): string => {
  if (!assetShortHeader) return '';

  const hasMeaningfulAnimationsCount =
    (assetShortHeader.objectType === 'sprite' ||
      assetShortHeader.objectType === 'Scene3D::Model3DObject') &&
    typeof assetShortHeader.animationsCount === 'number';
  const animationsText = hasMeaningfulAnimationsCount
    ? ` (${assetShortHeader.animationsCount} animation(s))`
    : '';
  return ` Used asset "${assetShortHeader.name}"${animationsText}.`;
};

// The base layer's real name is the empty string: never display it as "base"
// in tool results, as this teaches the AI a layer name that does not exist.
const getLayerNameForMessage = (layerName: string): string =>
  layerName === '' ? 'the base layer ("")' : `layer "${layerName}"`;

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
    message: ['Done with warnings.', ...changes, 'Warnings:', ...warnings].join(
      '\n'
    ),
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

// List the (visible) property names so a "property not found" warning lets
// the caller immediately pick the right name instead of guessing again.
// Emitted at most once per call: if a previous warning already lists the
// properties (e.g. several unknown properties in the same call), returns "".
const getAvailablePropertyNamesText = (
  properties: gdMapStringPropertyDescriptor | null,
  existingWarnings: Array<string>
): string => {
  if (
    existingWarnings.some(warning => warning.includes('Available properties:'))
  )
    return '';
  if (!properties) return '';
  const names = properties
    .keys()
    .toJSArray()
    .filter(name => !shouldHideProperty(properties.get(name)));
  if (names.length === 0) return '';
  const maxCount = 25;
  return ` Available properties: ${names.slice(0, maxCount).join(', ')}${
    names.length > maxCount ? `, … (${names.length - maxCount} more)` : ''
  }.`;
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

  const normalizeName = (name: string) =>
    name.toLowerCase().replace(/\s|_|-/g, '');
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
        (shortLabel ? '·' : '') + symbol + (power === 1 ? '' : `^${power}`);
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

    if (value === '' || value === undefined) {
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
      nonEmptyParts.push(
        unit ? `${name}: ${value} (${unit})` : `${name}: ${value}`
      );
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
    getAssetStoreTagForNewObject,
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
      return makeSceneNotFoundFailure(project, scene_name);
    }

    const layout = project.getLayout(scene_name);
    const layoutObjects = layout.getObjects();
    const globalObjects = project.getObjects();

    const getPropertiesText = (object: gdObject): string => {
      const properties = object.getConfiguration().getProperties();
      const propertiesList = formatPropertiesList(properties);
      return propertiesList
        ? `Properties: ${propertiesList}.`
        : 'This object type has no editable object properties.';
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
          `Object "${targetObjectName}" already exists - nothing was changed. Set replace_existing_object to true to replace its assets from the asset store.`
        );
      }

      const targetObjectsContainer =
        target_object_scope === 'global' ? globalObjects : layoutObjects;
      const targetScopeText =
        target_object_scope === 'global' ? 'global' : `scene "${scene_name}"`;

      // If no search_terms or asset_id were provided but the object type has
      // an `assetStoreTag` (i.e. the type is mainly meant to be picked from
      // the asset store, e.g. premade UI objects), use the tag as default
      // search terms.
      let effectiveSearchTerms = search_terms;
      let assetSearchMissed = false;
      let assetStoreTag: string | null = null;
      if (candidateType && !effectiveSearchTerms && !asset_id) {
        assetStoreTag = getAssetStoreTagForNewObject(candidateType);
        if (assetStoreTag) {
          effectiveSearchTerms = `${assetStoreTag}, default`;
        }
      }

      if (candidateType && !effectiveSearchTerms && !asset_id) {
        // Nothing given apart from an object type without an assetStoreTag:
        // fall back to creating from scratch.
      } else {
        if (!effectiveSearchTerms && !asset_id) {
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
            searchTerms: effectiveSearchTerms || '',
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
              const renamedNotice =
                object.getName() !== targetObjectName
                  ? ` (requested name "${targetObjectName}" was taken; use "${object.getName()}" from now on)`
                  : '';
              const result: EditorFunctionGenericOutput = {
                success: true,
                message: [
                  `Created object "${object.getName()}" (type "${object.getType()}", ${targetScopeText}) from asset store.${renamedNotice}${getUsedAssetText(
                    assetShortHeader
                  )}`,
                  getPropertiesText(object),
                ].join(' '),
              };
              return injectObjectSizeInfo(result, {
                [object.getName()]: getObjectSizeInfo(
                  object,
                  project,
                  PixiResourcesLoader,
                  assetShortHeader
                ),
              });
            }

            return makeGenericSuccess(
              `Created from asset store in ${targetScopeText}: ${createdObjects
                .map(
                  object => `"${object.getName()}" (type "${object.getType()}")`
                )
                .join(', ')}.${getUsedAssetText(assetShortHeader)}`
            );
          } else {
            if (asset_id) {
              return makeGenericFailure(
                `No asset found with id "${asset_id}". Object not created.`
              );
            }

            if (assetStoreTag) {
              console.warn(
                `No asset found from store for object type "${candidateType ||
                  ''}" (assetStoreTag: "${assetStoreTag}"). Falling back to creating "${targetObjectName}" from scratch.`
              );
            }

            // No asset found - we'll create an object from scratch.
            assetSearchMissed = true;
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
            `Could not install extension "${extensionName}": ${error.message}`
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

      const scratchNotice = assetSearchMissed
        ? ` No asset matched "${effectiveSearchTerms ||
            ''}", so this object was created with no resource (no texture/3D model/font/etc...).`
        : '';
      const scratchResult: EditorFunctionGenericOutput = {
        success: true,
        message: [
          `Created object "${targetObjectName}" (type "${candidateType}", ${targetScopeText}) from scratch.${scratchNotice}`,
          getPropertiesText(object),
        ].join(' '),
      };
      return injectObjectSizeInfo(scratchResult, {
        [targetObjectName]: getObjectSizeInfo(
          object,
          project,
          PixiResourcesLoader
        ),
      });
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
            `Replaced ${
              isTargetObjectGlobal ? 'global' : `scene "${scene_name}"`
            } object "${existingTargetObject.getName()}" with asset store object (same type "${existingTargetObject.getType()}").${getUsedAssetText(
              assetShortHeader
            )}`
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
          `${getSceneNotFoundMessage(
            project,
            duplicatedObjectSceneName
          )} Not duplicated.`
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
const isPropertyForChangingObjectName = (propertyName: string): boolean => {
  return (
    propertyName.toLowerCase() === 'name' ||
    propertyName.toLowerCase().replace(/-|_| /, '') === 'objectname'
  );
};

const objectSupportsEffects = (object: gdObject): boolean =>
  object
    .getAllBehaviorNames()
    .toJSArray()
    .some(behaviorName => {
      if (!object) return false;
      return (
        object.getBehavior(behaviorName).getTypeName() ===
        'EffectCapability::EffectBehavior'
      );
    });

/**
 * Applies a single property change (or the special "name" rename) to an
 * object. Shared between the property and effects loops of
 * `change_object_properties_effects`.
 */
const applyObjectPropertyChange = ({
  project,
  layout,
  object,
  isGlobalObject,
  object_name,
  changedProperty,
  changes,
  warnings,
}: {
  project: gdProject,
  layout: gdLayout,
  object: gdObject,
  isGlobalObject: boolean,
  object_name: string,
  changedProperty: Object,
  changes: Array<string>,
  warnings: Array<string>,
}) => {
  const propertyName = SafeExtractor.extractStringProperty(
    changedProperty,
    'property_name'
  );
  const newValue = SafeExtractor.extractStringProperty(
    changedProperty,
    'new_value'
  );
  if (propertyName === null || newValue === null) {
    warnings.push(
      `Missing "property_name" or "new_value" in changed_properties item: ${JSON.stringify(
        changedProperty
      )}. Skipped.`
    );
    return;
  }

  // Renaming an object is a special case by using a property called "name".
  if (isPropertyForChangingObjectName(propertyName)) {
    if (object.getName() === newValue) {
      changes.push(`Object "${object_name}" already named "${newValue}".`);
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
    // Position, rotation, opacity, z-order and layer are per-instance
    // placement attributes, not object properties. A frequent mistake is to
    // try to set them here; redirect to the right tool instead of a generic
    // "not found".
    const normalizedPropertyName = propertyName
      .toLowerCase()
      .replace(/\s|_|-/g, '');
    const instanceOnlyAttributes = [
      'x',
      'y',
      'z',
      'position',
      'rotation',
      'rotationx',
      'rotationy',
      'rotationz',
      'angle',
      'opacity',
      'zorder',
      'layer',
    ];
    if (instanceOnlyAttributes.includes(normalizedPropertyName)) {
      warnings.push(
        `"${propertyName}" is a per-instance attribute, not a property of object "${object_name}". Use \`put_2d_instances\`/\`put_3d_instances\` to change it.`
      );
      return;
    }
    warnings.push(
      `Property "${propertyName}" not found on object "${object_name}".${getAvailablePropertyNamesText(
        objectProperties,
        warnings
      )}`
    );
    return;
  }

  let sanitizedNewValue = sanitizePropertyNewValue(foundProperty, newValue);

  if (foundProperty.getType() === 'resource') {
    if (!project.getResourcesManager().hasResource(sanitizedNewValue)) {
      // Resource names can contain backslashes (e.g. "assets\\Player.glb"):
      // tolerate a name given with the wrong slashes or casing, and suggest
      // close candidates otherwise.
      const normalizeResourceName = (resourceName: string) =>
        resourceName.replace(/\\/g, '/').toLowerCase();
      const allResourceNames = project
        .getResourcesManager()
        .getAllResourceNames()
        .toJSArray();
      const normalizedNewValue = normalizeResourceName(sanitizedNewValue);
      const matchingResourceNames = allResourceNames.filter(
        resourceName =>
          normalizeResourceName(resourceName) === normalizedNewValue
      );
      if (matchingResourceNames.length === 1) {
        sanitizedNewValue = matchingResourceNames[0];
      } else {
        const requestedBaseName = normalizedNewValue.split('/').pop() || '';
        const closeResourceNames = requestedBaseName
          ? allResourceNames
              .filter(resourceName =>
                normalizeResourceName(resourceName).endsWith(requestedBaseName)
              )
              .slice(0, 5)
          : [];
        warnings.push(
          `"${foundPropertyName}" on "${object_name}" -> "${newValue}": resource "${sanitizedNewValue}" does not exist.${
            closeResourceNames.length > 0
              ? ` Did you mean: ${closeResourceNames
                  .map(resourceName => `"${resourceName}"`)
                  .join(', ')}?`
              : ''
          } New resources cannot be added just by name; use \`create_or_replace_object\` to import assets from the asset store (preserving properties/behaviors/events).`
        );
        return;
      }
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
    !objectConfiguration.updateProperty(foundPropertyName, sanitizedNewValue)
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

  // Resizing an object that keeps its aspect ratio can visually do nothing
  // (the rendered size is clamped to the model aspect ratio) even though the
  // stored property changed — so `verifyPropertyChange` cannot catch it.
  if (['width', 'height', 'depth'].includes(foundPropertyName.toLowerCase())) {
    const keepAspectRatioValue = getPropertyValue({
      properties: objectConfiguration.getProperties(),
      propertyName: 'keepAspectRatio',
    });
    if (keepAspectRatioValue === 'true') {
      warnings.push(
        `"${object_name}" has "keepAspectRatio" enabled: the rendered size keeps the model's aspect ratio, so this change may have no visible effect. Set "keepAspectRatio" to false first to control each dimension exactly.`
      );
    }
  }
};

/**
 * Retrieves the properties, behaviors and effects of a specific object
 * (global or in a scene). An object has its own effects container, just
 * like a layer does — effects are only listed if the object type supports
 * them (see `objectSupportsEffects`).
 */
const inspectObjectPropertiesEffects: EditorFunction = {
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
      return makeSceneNotFoundFailure(project, scene_name);
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

    const variableCount = object.getVariables().count();
    const behaviorCount = behaviors.length;
    const inspectParts = [];
    if (variableCount > 0) {
      inspectParts.push(
        `${variableCount} variable(s) (inspect with \`inspect_variables\`)`
      );
    }
    if (behaviorCount > 0) {
      inspectParts.push(
        `${behaviorCount} behavior(s) (inspect with \`inspect_behavior_properties\`)`
      );
    }

    const output: EditorFunctionGenericOutput = {
      success: true,
      objectName: object_name,
      properties,
      behaviors,
      objectPropertiesDeduplicationKey: [scene_name, object_name]
        .filter(Boolean)
        .join('-'),
    };
    if (inspectParts.length > 0) {
      output.reminder = `This object also has ${inspectParts.join(' and ')}.`;
    }
    injectObjectSizeInfo(output, {
      [object_name]: getObjectSizeInfo(object, project, PixiResourcesLoader),
    });
    if (animationNames.length > 0) {
      output.animationNames = animationNames.join(', ');
    }

    if (objectSupportsEffects(object)) {
      const effectsContainer = object.getEffects();
      output.effects = mapFor(0, effectsContainer.getEffectsCount(), i => {
        const effect = effectsContainer.getEffectAt(i);
        const effectMetadata = gd.MetadataProvider.getEffectMetadata(
          project.getCurrentPlatform(),
          effect.getEffectType()
        );
        if (gd.MetadataProvider.isBadEffectMetadata(effectMetadata))
          return null;

        return {
          effectName: effect.getName(),
          effectType: effect.getEffectType(),
          effectProperties: serializeEffectProperties(effect, effectMetadata),
        };
      }).filter(Boolean);
    }

    return output;
  },
  modifiesProject: false,
};

/**
 * Changes properties and/or effects of a specific object (global or in a
 * scene). Effects are only applied if the object type supports them (see
 * `objectSupportsEffects`).
 */
const changeObjectPropertiesEffects: EditorFunction = {
  renderForEditor: ({ project, shouldShowDetails, args, editorCallbacks }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const object_name = extractRequiredString(args, 'object_name');

    const deleteThisObject = SafeExtractor.extractBooleanProperty(
      args,
      'delete_this_object'
    );
    if (deleteThisObject) {
      return {
        text: (
          <Trans>
            Remove object <b>{object_name}</b> (in scene {scene_name}).
          </Trans>
        ),
      };
    }

    const changed_properties =
      SafeExtractor.extractArrayProperty(args, 'changed_properties') || [];
    const changed_effects =
      SafeExtractor.extractArrayProperty(args, 'changed_effects') || [];

    if (changed_effects.length > 0) {
      return {
        text:
          changed_properties.length > 0 ? (
            <Trans>
              Update properties and effects of <b>{object_name}</b> (in scene{' '}
              {scene_name}).
            </Trans>
          ) : (
            <Trans>
              Update effects of <b>{object_name}</b> (in scene {scene_name}).
            </Trans>
          ),
      };
    }

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
  launchFunction: async ({
    project,
    args,
    onObjectsModifiedOutsideEditor,
    onInstancesModifiedOutsideEditor,
    onWillDeleteObject,
  }) => {
    const scene_name = extractRequiredString(args, 'scene_name');
    const object_name = extractRequiredString(args, 'object_name');
    const changed_properties =
      SafeExtractor.extractArrayProperty(args, 'changed_properties') || [];
    const changed_effects =
      SafeExtractor.extractArrayProperty(args, 'changed_effects') || [];

    if (!project.hasLayoutNamed(scene_name)) {
      return makeSceneNotFoundFailure(project, scene_name);
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

    const deleteThisObject = SafeExtractor.extractBooleanProperty(
      args,
      'delete_this_object'
    );
    if (deleteThisObject) {
      // Let editors close any dialog referring to this object BEFORE it's
      // actually removed, while it's still safe to read it.
      onWillDeleteObject({ scene: layout, objectName: object_name });

      if (isGlobalObject) {
        gd.WholeProjectRefactorer.globalObjectRemoved(project, object_name);
        globalObjects.removeObject(object_name);
      } else {
        gd.WholeProjectRefactorer.objectRemovedInScene(
          project,
          layout,
          object_name
        );
        layoutObjects.removeObject(object_name);
      }

      // Refresh instances/objects lists AFTER the removal, so they reflect
      // the final state (the instances hot-reload payload in particular is
      // built synchronously from current data when this is called).
      onInstancesModifiedOutsideEditor({ scene: layout });
      onObjectsModifiedOutsideEditor({
        scene: layout,
        isNewObjectTypeUsed: false,
      });

      return makeGenericSuccess(`Deleted object "${object_name}".`);
    }

    const warnings: Array<string> = [];
    const changes: Array<string> = [];

    changed_properties.forEach(changed_property => {
      if (!object) return;
      applyObjectPropertyChange({
        project,
        layout,
        object,
        isGlobalObject,
        object_name,
        changedProperty: changed_property,
        changes,
        warnings,
      });
    });

    if (changed_effects.length > 0) {
      if (!objectSupportsEffects(object)) {
        warnings.push(
          `Object "${object_name}" does not support effects (its type has no effect capability). Effects were NOT changed.`
        );
      } else {
        const effectsContainer = object.getEffects();
        changed_effects.forEach(changed_effect => {
          applyEffectChange({
            project,
            effectsContainer,
            changedEffect: changed_effect,
            targetLabel: `object "${object_name}"`,
            changes,
            warnings,
          });
        });
      }
    }

    return makeMultipleChangesOutput(changes, warnings);
  },
  modifiesProject: true,
};

/**
 * Resolve a name to the object(s) it refers to.
 *
 * Returns `null` when no object nor group with this name exists. For a group,
 * `objects` contains all its (resolvable) member objects and `group` is set.
 */
const resolveObjectsFromContextAndName = ({
  project,
  layout,
  objectOrGroupName,
}: {|
  project: gdProject,
  layout: gdLayout,
  objectOrGroupName: string,
|}): {|
  objects: Array<gdObject>,
  group: gdObjectGroup | null,
|} | null => {
  const layoutObjects = layout.getObjects();
  const globalObjects = project.getObjects();

  const object = getObjectByName(
    globalObjects,
    layoutObjects,
    objectOrGroupName
  );
  if (object) {
    return { objects: [object], group: null };
  }

  const sceneGroups = layoutObjects.getObjectGroups();
  const globalGroups = globalObjects.getObjectGroups();
  const group = sceneGroups.has(objectOrGroupName)
    ? sceneGroups.get(objectOrGroupName)
    : globalGroups.has(objectOrGroupName)
    ? globalGroups.get(objectOrGroupName)
    : null;
  if (group) {
    const objects = group
      .getAllObjectsNames()
      .toJSArray()
      .map(objectName =>
        getObjectByName(globalObjects, layoutObjects, objectName)
      )
      .filter(Boolean);
    return { objects, group };
  }

  return null;
};

/**
 * Adds a behavior to an object (or to all objects of a group) in a scene.
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
      return makeSceneNotFoundFailure(project, scene_name);
    }

    const layout = project.getLayout(scene_name);

    // `object_name` can designate an object or a group (in which case the
    // behavior is added to every object of the group).
    const concerned = resolveObjectsFromContextAndName({
      project,
      layout,
      objectOrGroupName: object_name,
    });
    if (!concerned) {
      return makeGenericFailure(
        `Object or group not found: "${object_name}" in scene "${scene_name}" nor globally.`
      );
    }
    if (concerned.objects.length === 0) {
      return makeGenericFailure(
        `Group "${object_name}" has no object, so the behavior was not added.`
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
          `Could not install extension "${extensionName}": ${error.message}`
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
    const isDefaultCapability = isBehaviorDefaultCapability(behaviorMetadata);

    const changes = [];
    const warnings = [];
    for (const object of concerned.objects) {
      const objectName = object.getName();

      // Check if behavior with this name already exists
      if (object.hasBehaviorNamed(behaviorName)) {
        const behavior = object.getBehavior(behaviorName);
        if (behavior.getTypeName() !== behavior_type) {
          warnings.push(
            `Behavior "${behaviorName}" already on "${objectName}" with different type ("${behavior_type}").`
          );
        } else {
          changes.push(
            `Behavior "${behaviorName}" already on "${objectName}".`
          );
        }
        continue;
      }

      if (isDefaultCapability) {
        const alreadyHasDefaultCapability = object
          .getAllBehaviorNames()
          .toJSArray()
          .some(
            name => object.getBehavior(name).getTypeName() === behavior_type
          );
        if (alreadyHasDefaultCapability) {
          changes.push(
            `Behavior "${behaviorName}" (type "${behavior_type}") is a default capability already on "${objectName}".`
          );
        } else {
          warnings.push(
            `Behavior "${behaviorName}" (type "${behavior_type}") is a default capability; cannot be added to "${objectName}".`
          );
        }
        continue;
      }

      if (
        behaviorMetadata.getObjectType() &&
        behaviorMetadata.getObjectType() !== object.getType()
      ) {
        warnings.push(
          `Behavior "${behaviorName}" (type "${behavior_type}") requires object type "${behaviorMetadata.getObjectType()}"; "${objectName}" is not.`
        );
        continue;
      }

      // Add the behavior
      gd.WholeProjectRefactorer.addBehaviorAndRequiredBehaviors(
        project,
        object,
        behavior_type,
        behaviorName
      );
      if (!object.hasBehaviorNamed(behaviorName)) {
        warnings.push(
          `Unexpected error: behavior "${behaviorName}" not added to "${objectName}".`
        );
        continue;
      }

      const behavior = object.getBehavior(behaviorName);
      changes.push(
        `Added behavior "${behaviorName}" (type "${behavior_type}") to "${objectName}". Properties: ${formatPropertiesList(
          behavior.getProperties()
        )}.`
      );
    }
    layout.updateBehaviorsSharedData(project);

    return makeMultipleChangesOutput(changes, warnings);
  },
  modifiesProject: true,
};

/**
 * Removes a behavior from an object (or from all objects of a group) in a scene.
 * Not offered to the AI anymore since toolsVersion v6 (see `delete_this_behavior`
 * in `changeBehaviorProperty`), kept only for older toolsVersions.
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
      return makeSceneNotFoundFailure(project, scene_name);
    }

    const layout = project.getLayout(scene_name);

    // `object_name` can designate an object or a group (in which case the
    // behavior is removed from every object of the group that has it).
    const concerned = resolveObjectsFromContextAndName({
      project,
      layout,
      objectOrGroupName: object_name,
    });
    if (!concerned) {
      return makeGenericFailure(
        `Object or group not found: "${object_name}" in scene "${scene_name}" nor globally.`
      );
    }

    const changes = [];
    const warnings = [];
    for (const object of concerned.objects) {
      const objectName = object.getName();
      if (!object.hasBehaviorNamed(behavior_name)) {
        warnings.push(
          `Behavior "${behavior_name}" not on "${objectName}". Not removed.`
        );
        continue;
      }

      const dependentBehaviors = gd.WholeProjectRefactorer.findDependentBehaviorNames(
        project,
        object,
        behavior_name
      ).toJSArray();

      // Remove the behavior
      object.removeBehavior(behavior_name);
      dependentBehaviors.forEach(name => {
        object.removeBehavior(name);
      });

      changes.push(
        dependentBehaviors.length > 0
          ? `Removed behavior "${behavior_name}" from "${objectName}" (also removed dependents: ${dependentBehaviors.join(
              ', '
            )}).`
          : `Removed behavior "${behavior_name}" from "${objectName}".`
      );
    }

    return makeMultipleChangesOutput(changes, warnings);
  },
  modifiesProject: true,
};

/**
 * Retrieves the properties of a specific behavior attached to an object (or to
 * the objects of a group).
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
      return makeSceneNotFoundFailure(project, scene_name);
    }

    const layout = project.getLayout(scene_name);

    // `object_name` can designate an object or a group. For a group, the
    // behavior is shared in common by all its objects, so any of them can be
    // inspected: use the first object that has the behavior.
    const concerned = resolveObjectsFromContextAndName({
      project,
      layout,
      objectOrGroupName: object_name,
    });
    if (!concerned) {
      return makeGenericFailure(
        `Object or group not found: "${object_name}" in scene "${scene_name}" nor globally.`
      );
    }

    const object = concerned.objects.find(object =>
      object.hasBehaviorNamed(behavior_name)
    );
    if (!object) {
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

    const deleteThisBehavior = SafeExtractor.extractBooleanProperty(
      args,
      'delete_this_behavior'
    );
    if (deleteThisBehavior) {
      return {
        text: (
          <Trans>
            Remove <b>{behavior_name}</b> behavior from <b>{object_name}</b> in
            scene {scene_name}.
          </Trans>
        ),
      };
    }

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

    // `object_name` can designate an object or a group (which shares the
    // behavior in common): use any object having the behavior to read labels.
    const concerned = resolveObjectsFromContextAndName({
      project,
      layout,
      objectOrGroupName: object_name,
    });
    const object = concerned
      ? concerned.objects.find(object => object.hasBehaviorNamed(behavior_name))
      : null;

    if (!object) {
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
      return makeSceneNotFoundFailure(project, scene_name);
    }

    const layout = project.getLayout(scene_name);

    // `object_name` can designate an object or a group (in which case the
    // property is changed on the behavior of every object of the group).
    const concerned = resolveObjectsFromContextAndName({
      project,
      layout,
      objectOrGroupName: object_name,
    });
    if (!concerned) {
      return makeGenericFailure(
        `Object or group not found: "${object_name}" in scene "${scene_name}" nor globally.`
      );
    }

    const deleteThisBehavior = SafeExtractor.extractBooleanProperty(
      args,
      'delete_this_behavior'
    );
    if (deleteThisBehavior) {
      const changes = [];
      const warnings = [];
      for (const object of concerned.objects) {
        const objectName = object.getName();
        if (!object.hasBehaviorNamed(behavior_name)) {
          warnings.push(
            `Behavior "${behavior_name}" not on "${objectName}". Not removed.`
          );
          continue;
        }

        const dependentBehaviors = gd.WholeProjectRefactorer.findDependentBehaviorNames(
          project,
          object,
          behavior_name
        ).toJSArray();

        object.removeBehavior(behavior_name);
        dependentBehaviors.forEach(name => {
          object.removeBehavior(name);
        });

        changes.push(
          dependentBehaviors.length > 0
            ? `Removed behavior "${behavior_name}" from "${objectName}" (also removed dependents: ${dependentBehaviors.join(
                ', '
              )}).`
            : `Removed behavior "${behavior_name}" from "${objectName}".`
        );
      }

      return makeMultipleChangesOutput(changes, warnings);
    }

    const objectsWithBehavior = concerned.objects.filter(object =>
      object.hasBehaviorNamed(behavior_name)
    );
    if (objectsWithBehavior.length === 0) {
      return makeGenericFailure(
        `Behavior "${behavior_name}" not on "${object_name}".`
      );
    }

    // The behavior is shared in common, so any object's behavior can be used
    // to look up properties; changes are then applied to all of them.
    const behavior = objectsWithBehavior[0].getBehavior(behavior_name);
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

    // Warn about group members that do not have the behavior (they are skipped),
    // mirroring remove_behavior's per-object reporting.
    for (const object of concerned.objects) {
      if (!object.hasBehaviorNamed(behavior_name)) {
        warnings.push(
          `Behavior "${behavior_name}" not on "${object.getName()}". Not changed.`
        );
      }
    }

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
        let couldUpdate = true;
        for (const object of objectsWithBehavior) {
          if (
            !object
              .getBehavior(behavior_name)
              .updateProperty(foundPropertyName, sanitizedNewValue)
          ) {
            couldUpdate = false;
          }
        }
        if (!couldUpdate) {
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
          `Property "${propertyName}" not on behavior "${behavior_name}" of "${object_name}".${getAvailablePropertyNamesText(
            behaviorProperties,
            warnings
          )}`
        );
      }
    });

    // $FlowFixMe[incompatible-type]
    return makeMultipleChangesOutput(changes, warnings);
  },
  modifiesProject: true,
};

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
      return makeSceneNotFoundFailure(project, scene_name);
    }

    const layout = project.getLayout(scene_name);
    const layoutObjects = layout.getObjects();
    const globalObjects = project.getObjects();
    const initialInstances = layout.getInitialInstances();

    const instances = [];
    const objectSizeInfoByName: { [string]: ObjectSizeInfo | null } = {};

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

          const sizeInfo = object
            ? getObjectSizeInfo(object, project, PixiResourcesLoader)
            : null;
          if (object && !(objectName in objectSizeInfoByName)) {
            objectSizeInfoByName[objectName] = sizeInfo;
          }

          const defaultSize = object
            ? sizeInfo
            : { width: 0, height: 0, depth: 0 };

          const width = instance.hasCustomSize()
            ? instance.getCustomWidth()
            : defaultSize
            ? defaultSize.width
            : null;
          const height = instance.hasCustomSize()
            ? instance.getCustomHeight()
            : defaultSize
            ? defaultSize.height
            : null;
          const depth = instance.hasCustomDepth()
            ? instance.getCustomDepth()
            : defaultSize
            ? defaultSize.depth
            : null;

          const serializedInstance = serializeToJSObject(instance);
          instances.push({
            ...serializedInstance,
            // Replace persistentUuid by id:
            persistentUuid: undefined,
            id: instance.getPersistentUuid().slice(0, 10),
            // The serializer omits z when it's 0 - always expose it for 3D objects:
            z: depth !== null ? instance.getZ() : undefined,
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

    const result: EditorFunctionGenericOutput = {
      success: true,
      instances: instances,
      instancesForSceneNamed: scene_name,
      positionSemantics: INSTANCE_POSITION_SEMANTICS_MESSAGE,
    };
    if (objectNames.size > 0) {
      result.instancesOnlyForObjectsNamed = [...objectNames].sort().join(',');
    }
    return injectObjectSizeInfo(result, objectSizeInfoByName);
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
      new_instances_count === null && existingInstanceIds.length === 0
        ? 1
        : new_instances_count;

    const existingInstanceCount = existing_instance_ids
      ? existing_instance_ids.split(',').length
      : 0;
    const brushPosition = SafeExtractor.parseCommaSeparatedTwoFiniteNumbers(
      brush_position
    );

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
      return makeSceneNotFoundFailure(project, scene_name);
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

    // Accept the frequent mistake of calling the base layer "base" (its real
    // name is the empty string) when no layer with that literal name exists.
    const layerName =
      layer_name !== '' &&
      layer_name.trim().toLowerCase() === 'base' &&
      !layout.hasLayerNamed(layer_name)
        ? ''
        : layer_name;

    // Check if layer exists (empty string is allowed for base layer)
    if (layerName !== '' && !layout.hasLayerNamed(layerName)) {
      return makeGenericFailure(
        `Layer not found: ${layerName} in scene "${scene_name}".`
      );
    }

    const existingInstanceIds = existing_instance_ids
      ? existing_instance_ids.split(',')
      : [];

    const initialInstances = layout.getInitialInstances();

    if (brush_kind === 'erase') {
      const brushPosition = SafeExtractor.parseCommaSeparatedTwoFiniteNumbers(
        brush_position
      );
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
        if (instance.getLayer() !== layerName) return; // Layer must be the same as specified when deleting instances with a brush.

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

      // An erase call that removed nothing is a failure: return a real error
      // signal instead of a misleading "Erased 0 instances." success that
      // could make the agent retry the same call in a loop, or believe the
      // instances are gone.
      if (instancesToDelete.size === 0) {
        return makeGenericFailure(
          [
            'No instance was erased.',
            notFoundExistingInstanceIds.size > 0
              ? `None of the specified instance ids were found: ${Array.from(
                  notFoundExistingInstanceIds
                ).join(', ')}.`
              : 'No instance matched the brush (check `object_name`, the layer and the brush position/size).',
            'Call `describe_instances` to get valid ids (the `id` field of each instance), and check the scene and layer names.',
          ].join(' ')
        );
      }

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
        injectObjectSizeInfo(eraseResult, { [object_name]: objectSizeInfo });
      return eraseResult;
    } else {
      // An explicit `new_instances_count: 0` with no instances to modify means
      // the call has nothing to do. Fail instead of silently creating one
      // instance, which would end up as an unwanted duplicate.
      if (new_instances_count === 0 && existingInstanceIds.length === 0) {
        return makeGenericFailure(
          'Nothing to do: `new_instances_count` is 0 and no `existing_instance_ids` were given. Pass `new_instances_count` greater than 0 to create instances, or `existing_instance_ids` (from `describe_instances`) to modify existing ones.'
        );
      }

      const parsedBrushPosition = brush_position
        ? SafeExtractor.parseCommaSeparatedTwoFiniteNumbers(brush_position)
        : null;
      const brushSize = brush_size || 0;
      const brushEndPosition = SafeExtractor.parseCommaSeparatedTwoFiniteNumbers(
        brush_end_position
      );

      // The `line` and `grid` brushes need an end position to spread instances.
      // Fail early (before creating any instance) so the caller retries with a
      // valid request, instead of silently leaving every instance at the origin.
      if (
        (brush_kind === 'line' || brush_kind === 'grid') &&
        !brushEndPosition
      ) {
        return makeGenericFailure(
          `The "${brush_kind}" brush requires brush_end_position (the end of the ${brush_kind}). Provide it, or use the "point" brush to place instances at a single position.`
        );
      }

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

      // Only brushes that give a position to instances can create new ones:
      // the "none" brush (or an unknown one) would silently pile up new
      // instances at a default position.
      const isPlacementBrush =
        brush_kind === 'point' ||
        brush_kind === 'line' ||
        brush_kind === 'grid' ||
        brush_kind === 'random_in_circle';
      if (newInstancesCount > 0 && !isPlacementBrush) {
        return makeGenericFailure(
          `The "${brush_kind}" brush only modifies existing instances and cannot create new ones. To create instances, use the "point" brush (or "line"/"grid") with \`brush_position\`. To modify existing instances without moving them, use the "none" brush with \`existing_instance_ids\` (from \`describe_instances\`).`
        );
      }

      // As stated in the tool description, `brush_position` can only be
      // omitted when modifying existing instances with the "none" brush. Fail
      // instead of silently using a default position (like the scene center):
      // a call without a position is usually a modification that forgot
      // `existing_instance_ids`, or would drop every new instance at a
      // meaningless position.
      if (
        !parsedBrushPosition &&
        !(brush_kind === 'none' && newInstancesCount === 0)
      ) {
        return makeGenericFailure(
          newInstancesCount > 0
            ? `A valid \`brush_position\` is required to create ${newInstancesCount} new instance(s) (or pass \`existing_instance_ids\` from \`describe_instances\` if you meant to modify existing instances).`
            : `A valid \`brush_position\` is required for the "${brush_kind}" brush (or use the "none" brush to modify existing instances without moving them).`
        );
      }
      // After the guard, a missing position can only happen when nothing is
      // created nor moved ("none" brush only): the fallback is never used.
      const brushPosition: [number, number] = parsedBrushPosition || [0, 0];

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
          if (instance.getLayer() !== layerName) {
            instance.setLayer(layerName);
          }
        }
      });

      for (let i = 0; i < newInstancesCount; i++) {
        const instance = initialInstances.insertNewInitialInstance();
        instance.setObjectName(object_name || '');
        instance.setLayer(layerName);
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
          const brushWidth = brushEndPosition[0] - brushPosition[0];
          const brushHeight = brushEndPosition[1] - brushPosition[1];

          // Auto-compute the column and row count from the aspect ratio of the
          // brush rectangle so a wide area gets more columns and a flat line
          // (zero width or height) gets a single row/column. A naive sqrt split
          // would stack instances on top of each other for a thin rectangle.
          const absWidth = Math.abs(brushWidth);
          const absHeight = Math.abs(brushHeight);
          let gridColumnCount: number;
          let gridRowCount: number;
          if (columnCount && rowCount) {
            gridColumnCount = columnCount;
            gridRowCount = rowCount;
          } else if (absHeight === 0) {
            gridColumnCount = columnCount || instancesCount;
            gridRowCount = rowCount || 1;
          } else if (absWidth === 0) {
            gridRowCount = rowCount || instancesCount;
            gridColumnCount = columnCount || 1;
          } else {
            gridColumnCount =
              columnCount ||
              Math.max(
                1,
                Math.round(Math.sqrt((instancesCount * absWidth) / absHeight))
              );
            gridRowCount =
              rowCount || Math.ceil(instancesCount / gridColumnCount);
          }

          // Spread columns along X and rows along Y. Divide by (count - 1) so
          // the last column/row reaches brush_end_position, like the line brush.
          const gridColumnSize =
            gridColumnCount > 1 ? brushWidth / (gridColumnCount - 1) : 0;
          const gridRowSize =
            gridRowCount > 1 ? brushHeight / (gridRowCount - 1) : 0;

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
        // The "none" brush keeps existing instances in place.
      }

      const instancesSize = SafeExtractor.parseCommaSeparatedTwoFiniteNumbers(
        instances_size
      );
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
          attrs.push(`opacity ${instancesOpacity}/255`);
        if (instances_z_order !== null)
          attrs.push(`z-order ${instances_z_order}`);
        const effectiveSize = instancesSize
          ? instancesSize
          : objectSizeInfo &&
            objectSizeInfo.width !== null &&
            objectSizeInfo.height !== null
          ? [objectSizeInfo.width, objectSizeInfo.height]
          : null;
        if (
          (brush_kind === 'point' || brush_kind === 'none') &&
          effectiveSize
        ) {
          attrs.push(
            `origin at this position, each occupies ${getOccupiedSpaceDescription(
              brushPosition,
              effectiveSize,
              objectSizeInfo
            )}`
          );
        }
        const createdInstanceIds = modifiedAndCreatedInstances
          .filter(instance => !existingInstanceStates.has(instance))
          .map(instance => instance.getPersistentUuid().slice(0, 10));
        changes.push(
          `Created ${newInstancesCount} new instance${
            newInstancesCount > 1 ? 's' : ''
          } of object "${object_name || ''}" (id${
            createdInstanceIds.length > 1 ? 's' : ''
          }: ${createdInstanceIds.join(
            ', '
          )}) using ${brush_kind} brush at ${brushPosition.join(
            ', '
          )} on ${getLayerNameForMessage(layerName)}${
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
          } to ${getLayerNameForMessage(layerName)}.`
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
          } to ${instancesOpacity}/255.`
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
        // If NONE of the requested instances were found and nothing new was
        // created, the call did nothing. Return a failure so the agent gets a
        // real error signal instead of a misleading success — a success here
        // can make the agent retry the same (often malformed) call in a loop.
        if (existingInstanceStates.size === 0 && newInstancesCount === 0) {
          return makeGenericFailure(
            `None of the specified instance ids were found: ${Array.from(
              notFoundExistingInstanceIds
            ).join(
              ', '
            )}. Nothing was changed. Call \`describe_instances\` to get valid ids (the \`id\` field of each instance), and check the scene and layer names.`
          );
        }

        changes.push(
          `Instance ids not found: ${Array.from(
            notFoundExistingInstanceIds
          ).join(', ')}. Verify ids and layer names.`
        );
      }

      if (changes.length === 0) {
        const matchedCount = existingInstanceStates.size;
        const hasMutationParams =
          !!instancesSize ||
          instancesRotation !== null ||
          instancesOpacity !== null ||
          instances_z_order !== null;
        const hasPositionBrush =
          brush_kind === 'point' ||
          brush_kind === 'line' ||
          brush_kind === 'grid' ||
          brush_kind === 'random_in_circle';

        if (existingInstanceIds.length === 0) {
          return makeGenericFailure(
            'No instance changes. To edit existing instances, pass `existing_instance_ids` (from `describe_instances`); to create, pass `object_name` and `new_instances_count`. See the tool parameters for how to move/resize/rotate.'
          );
        }

        if (!hasMutationParams && !hasPositionBrush) {
          return makeGenericFailure(
            `Matched ${matchedCount} existing instance${
              matchedCount > 1 ? 's' : ''
            } but no change was requested — provide a value to modify (see the tool parameters for what can be edited).`
          );
        }

        return makeGenericFailure(
          `Matched ${matchedCount} existing instance${
            matchedCount > 1 ? 's' : ''
          } but the requested values are identical to their current ones, so nothing changed.`
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
        injectObjectSizeInfo(put2dResult, { [object_name]: objectSizeInfo });
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
      new_instances_count === null && existingInstanceIds.length === 0
        ? 1
        : new_instances_count;

    const existingInstanceCount = existing_instance_ids
      ? existing_instance_ids.split(',').length
      : 0;
    const brushPosition = SafeExtractor.parseCommaSeparatedThreeFiniteNumbers(
      brush_position
    );

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
      return makeSceneNotFoundFailure(project, scene_name);
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

    // Accept the frequent mistake of calling the base layer "base" (its real
    // name is the empty string) when no layer with that literal name exists.
    const layerName =
      layer_name !== '' &&
      layer_name.trim().toLowerCase() === 'base' &&
      !layout.hasLayerNamed(layer_name)
        ? ''
        : layer_name;

    // Check if layer exists (empty string is allowed for base layer)
    if (layerName !== '' && !layout.hasLayerNamed(layerName)) {
      return makeGenericFailure(
        `Layer not found: ${layerName} in scene "${scene_name}".`
      );
    }

    const existingInstanceIds = existing_instance_ids
      ? existing_instance_ids.split(',')
      : [];

    const initialInstances = layout.getInitialInstances();

    if (brush_kind === 'erase') {
      const brushPosition = SafeExtractor.parseCommaSeparatedThreeFiniteNumbers(
        brush_position
      );
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
        if (instance.getLayer() !== layerName) return; // Layer must be the same as specified when deleting instances with a brush.

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

      // An erase call that removed nothing is a failure: return a real error
      // signal instead of a misleading "Erased 0 instances." success that
      // could make the agent retry the same call in a loop, or believe the
      // instances are gone.
      if (instancesToDelete.size === 0) {
        return makeGenericFailure(
          [
            'No instance was erased.',
            notFoundExistingInstanceIds.size > 0
              ? `None of the specified instance ids were found: ${Array.from(
                  notFoundExistingInstanceIds
                ).join(', ')}.`
              : 'No instance matched the brush (check `object_name`, the layer and the brush position/size).',
            'Call `describe_instances` to get valid ids (the `id` field of each instance), and check the scene and layer names.',
          ].join(' ')
        );
      }

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
        injectObjectSizeInfo(eraseResult, { [object_name]: objectSizeInfo });
      return eraseResult;
    } else {
      // An explicit `new_instances_count: 0` with no instances to modify means
      // the call has nothing to do. Fail instead of silently creating one
      // instance, which would end up as an unwanted duplicate.
      if (new_instances_count === 0 && existingInstanceIds.length === 0) {
        return makeGenericFailure(
          'Nothing to do: `new_instances_count` is 0 and no `existing_instance_ids` were given. Pass `new_instances_count` greater than 0 to create instances, or `existing_instance_ids` (from `describe_instances`) to modify existing ones.'
        );
      }

      const parsedBrushPosition = brush_position
        ? SafeExtractor.parseCommaSeparatedThreeFiniteNumbers(brush_position)
        : null;
      const brushSize = brush_size || 0;
      const brushEndPosition = SafeExtractor.parseCommaSeparatedThreeFiniteNumbers(
        brush_end_position
      );

      // The `line` brush needs an end position to spread instances. Fail early
      // (before creating any instance) so the caller retries with a valid
      // request, instead of silently leaving every instance at the origin.
      if (brush_kind === 'line' && !brushEndPosition) {
        return makeGenericFailure(
          `The "line" brush requires brush_end_position (the end of the line). Provide it, or use the "point" brush to place instances at a single position.`
        );
      }

      let newInstancesCount =
        new_instances_count !== null ? new_instances_count : 0;
      if (newInstancesCount === 0 && existingInstanceIds.length === 0) {
        newInstancesCount = 1;
      }

      // Only brushes that give a position to instances can create new ones:
      // the "none" brush (or an unknown one) would silently pile up new
      // instances at a default position.
      const isPlacementBrush =
        brush_kind === 'point' ||
        brush_kind === 'line' ||
        brush_kind === 'random_in_sphere';
      if (newInstancesCount > 0 && !isPlacementBrush) {
        return makeGenericFailure(
          `The "${brush_kind}" brush only modifies existing instances and cannot create new ones. To create instances, use the "point" brush (or "line"/"random_in_sphere") with \`brush_position\`. To modify existing instances without moving them, use the "none" brush with \`existing_instance_ids\` (from \`describe_instances\`).`
        );
      }

      // As stated in the tool description, `brush_position` can only be
      // omitted when modifying existing instances with the "none" brush. Fail
      // instead of silently using a default position (like the scene center):
      // a call without a position is usually a modification that forgot
      // `existing_instance_ids`, or would drop every new instance at a
      // meaningless position.
      if (
        !parsedBrushPosition &&
        !(brush_kind === 'none' && newInstancesCount === 0)
      ) {
        return makeGenericFailure(
          newInstancesCount > 0
            ? `A valid \`brush_position\` is required to create ${newInstancesCount} new instance(s) (or pass \`existing_instance_ids\` from \`describe_instances\` if you meant to modify existing instances).`
            : `A valid \`brush_position\` is required for the "${brush_kind}" brush (or use the "none" brush to modify existing instances without moving them).`
        );
      }
      // After the guard, a missing position can only happen when nothing is
      // created nor moved ("none" brush only): the fallback is never used.
      const brushPosition: [number, number, number] = parsedBrushPosition || [
        0,
        0,
        0,
      ];

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
          if (instance.getLayer() !== layerName) {
            instance.setLayer(layerName);
          }
        }
      });

      for (let i = 0; i < newInstancesCount; i++) {
        const instance = initialInstances.insertNewInitialInstance();
        instance.setObjectName(object_name || '');
        instance.setLayer(layerName);
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
        // The "none" brush keeps existing instances in place.
      }

      const instancesSizeArray = SafeExtractor.parseCommaSeparatedThreeFiniteNumbers(
        instances_size
      );
      const instancesRotationArray = instances_rotation
        ? instances_rotation.split(',').map(coord => parseFloat(coord) || 0)
        : null;

      modifiedAndCreatedInstances.forEach(instance => {
        if (instancesSizeArray) {
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
        if (instancesSizeArray)
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
        const effectiveSize = instancesSizeArray
          ? instancesSizeArray
          : objectSizeInfo &&
            objectSizeInfo.width !== null &&
            objectSizeInfo.height !== null &&
            objectSizeInfo.depth !== null
          ? [objectSizeInfo.width, objectSizeInfo.height, objectSizeInfo.depth]
          : null;
        if (
          (brush_kind === 'point' || brush_kind === 'none') &&
          effectiveSize
        ) {
          attrs.push(
            `origin at this position, each occupies ${getOccupiedSpaceDescription(
              brushPosition,
              effectiveSize,
              objectSizeInfo
            )}`
          );
        }
        const createdInstanceIds = modifiedAndCreatedInstances
          .filter(instance => !existingInstanceStates.has(instance))
          .map(instance => instance.getPersistentUuid().slice(0, 10));
        changes.push(
          `Created ${newInstancesCount} new instance${
            newInstancesCount > 1 ? 's' : ''
          } of object "${object_name || ''}" (id${
            createdInstanceIds.length > 1 ? 's' : ''
          }: ${createdInstanceIds.join(
            ', '
          )}) using ${brush_kind} brush at ${brushPosition.join(
            ', '
          )} on ${getLayerNameForMessage(layerName)}${
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
          } to ${getLayerNameForMessage(layerName)}.`
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
        // If NONE of the requested instances were found and nothing new was
        // created, the call did nothing. Return a failure so the agent gets a
        // real error signal instead of a misleading success — a success here
        // can make the agent retry the same (often malformed) call in a loop.
        if (existingInstanceStates.size === 0 && newInstancesCount === 0) {
          return makeGenericFailure(
            `None of the specified instance ids were found: ${Array.from(
              notFoundExistingInstanceIds
            ).join(
              ', '
            )}. Nothing was changed. Call \`describe_instances\` to get valid ids (the \`id\` field of each instance), and check the scene and layer names.`
          );
        }

        changes.push(
          `Instance ids not found: ${Array.from(
            notFoundExistingInstanceIds
          ).join(', ')}. Verify ids and layer names.`
        );
      }

      if (changes.length === 0) {
        const matchedCount = existingInstanceStates.size;
        const hasMutationParams =
          !!instancesSizeArray ||
          (!!instancesRotationArray && instancesRotationArray.length >= 3);
        const hasPositionBrush =
          brush_kind === 'point' ||
          brush_kind === 'line' ||
          brush_kind === 'grid' ||
          brush_kind === 'random_in_sphere';

        if (existingInstanceIds.length === 0) {
          return makeGenericFailure(
            'No instance changes. To edit existing instances, pass `existing_instance_ids` (from `describe_instances`); to create, pass `object_name` and `new_instances_count`. Instance position and rotation can only be changed here, not with change_object_property. See the tool parameters for how to move/resize/rotate.'
          );
        }

        if (!hasMutationParams && !hasPositionBrush) {
          return makeGenericFailure(
            `Matched ${matchedCount} existing instance${
              matchedCount > 1 ? 's' : ''
            } but no change was requested — provide a value to modify (see the tool parameters for what can be edited).`
          );
        }

        return makeGenericFailure(
          `Matched ${matchedCount} existing instance${
            matchedCount > 1 ? 's' : ''
          } but the requested values are identical to their current ones, so nothing changed.`
        );
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
        injectObjectSizeInfo(put3dResult, { [object_name]: objectSizeInfo });
      return put3dResult;
    }
  },
  modifiesProject: true,
};

export const noEventsInSceneText = 'This scene has no events.';

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
      return makeSceneNotFoundFailure(project, scene_name);
    }

    const scene = project.getLayout(scene_name);
    const events = scene.getEvents();

    const {
      text: eventsAsText,
      renderingErrors,
    } = renderNonTranslatedEventsAsTextWithErrors({
      eventsList: events,
    });

    // Total render failure must be a hard failure, not a success carrying an error string.
    if (eventsAsText === eventsTextRenderingErrorText) {
      const details = renderingErrors.length
        ? ` (${renderingErrors[0].message})`
        : '';
      return makeGenericFailure(
        `Could not read the events of scene "${scene_name}": rendering the events as text failed${details}.`
      );
    }

    return {
      success: true,
      eventsForSceneNamed: scene_name,
      // Disambiguate a genuinely empty scene from a failed/empty read.
      eventsAsText: eventsAsText || noEventsInSceneText,
      // Surface partial failures so the cause is reported, not dropped.
      ...(renderingErrors.length
        ? { eventsRenderingErrors: renderingErrors }
        : {}),
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
    const eventsDescription = SafeExtractor.extractStringProperty(
      args,
      'events_description'
    );
    const eventBatches = SafeExtractor.extractArrayProperty(
      args,
      'event_batches'
    );
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
        {eventBatches &&
          eventBatches.map(batch => {
            const eventsDescription = SafeExtractor.extractStringProperty(
              batch,
              'events_description'
            );
            const eventsScript = SafeExtractor.extractStringProperty(
              batch,
              'events_script'
            );
            const placementRelation = SafeExtractor.extractStringProperty(
              batch,
              'placement_relation'
            );
            const placementTargetEventId = SafeExtractor.extractStringProperty(
              batch,
              'placement_target_event_id'
            );
            const placementExpectedParentEventId = SafeExtractor.extractStringProperty(
              batch,
              'placement_expected_parent_event_id'
            );
            const placementRationale = SafeExtractor.extractStringProperty(
              batch,
              'placement_rationale'
            );

            return (
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
                {eventsScript && (
                  <Text
                    noMargin
                    allowSelection
                    color="secondary"
                    size="body-small"
                    style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                  >
                    <b>
                      <Trans>Events script</Trans>
                    </b>
                    : {eventsScript}
                  </Text>
                )}
                {placementRelation && (
                  <Text
                    noMargin
                    allowSelection
                    color="secondary"
                    size="body-small"
                    style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                  >
                    <b>
                      <Trans>Placement</Trans>
                    </b>
                    : {placementRelation}
                  </Text>
                )}
                {placementTargetEventId && (
                  <Text
                    noMargin
                    allowSelection
                    color="secondary"
                    size="body-small"
                    style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                  >
                    <b>
                      <Trans>Target event</Trans>
                    </b>
                    : {placementTargetEventId}
                  </Text>
                )}
                {placementExpectedParentEventId && (
                  <Text
                    noMargin
                    allowSelection
                    color="secondary"
                    size="body-small"
                    style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                  >
                    <b>
                      <Trans>Expected parent event</Trans>
                    </b>
                    : {placementExpectedParentEventId}
                  </Text>
                )}
                {placementRationale && (
                  <Text
                    noMargin
                    allowSelection
                    color="secondary"
                    size="body-small"
                    style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                  >
                    <b>
                      <Trans>Placement rationale</Trans>
                    </b>
                    : {placementRationale}
                  </Text>
                )}
              </ColumnStackLayout>
            );
          })}
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
    const eventsDescription = SafeExtractor.extractStringProperty(
      args,
      'events_description'
    );
    const eventBatches = SafeExtractor.extractArrayProperty(
      args,
      'event_batches'
    );
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
      return makeSceneNotFoundFailure(project, sceneName);
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

    const parsedEventBatches = eventBatches
      ? eventBatches.map(batch => {
          return {
            eventsDescription:
              SafeExtractor.extractStringProperty(
                batch,
                'events_description'
              ) || '',
            eventsScript: SafeExtractor.extractStringProperty(
              batch,
              'events_script'
            ),
            placementRelation:
              SafeExtractor.extractStringProperty(
                batch,
                'placement_relation'
              ) || '(unspecified)',
            placementTargetEventId: SafeExtractor.extractStringProperty(
              batch,
              'placement_target_event_id'
            ),
            placementExpectedParentEventId: SafeExtractor.extractStringProperty(
              batch,
              'placement_expected_parent_event_id'
            ),
            placementRationale: SafeExtractor.extractStringProperty(
              batch,
              'placement_rationale'
            ),
          };
        })
      : null;

    if (parsedEventBatches) {
      if (parsedEventBatches.length === 0) {
        return makeGenericFailure(
          'No event batches provided. Provide one or more with a description of events to generate.'
        );
      }
      if (
        parsedEventBatches.some(
          batch =>
            !batch.eventsDescription &&
            !batch.eventsScript &&
            batch.placementRelation !== 'delete'
        )
      ) {
        return makeGenericFailure(
          'No events description (or events script) provided for some event batches. Provide one for each event(s) to generate.'
        );
      }
    } else if (!eventsDescription) {
      return makeGenericFailure('No events description provided.');
    }

    try {
      const eventsGenerationResult: EventsGenerationResult = await generateEvents(
        {
          sceneName,
          eventsDescription,
          eventBatches: parsedEventBatches,
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
      ): EditorFunctionGenericOutput => {
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
          `Error installing extensions: ${
            e.message
          }. Try again or a different approach.`
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
            : aiGeneratedEvent.resultMessage || 'Modified or added event(s).';
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
          `Unexpected error adding generated events: ${
            error.message
          }. Try a different approach.`
        );
      }
    } catch (error) {
      console.error(
        'Unexpected error when creating AI Generated Event:',
        error
      );
      return makeGenericFailure(
        `Unexpected error creating generated events: ${
          error.message
        }. Try a different approach.`
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
    const is_first_scene = SafeExtractor.extractBooleanProperty(
      args,
      'is_first_scene'
    );

    const firstSceneSuffix = is_first_scene
      ? ' Also set as the first (startup) scene.'
      : '';

    if (project.hasLayoutNamed(scene_name)) {
      const scene = project.getLayout(scene_name);
      if (is_first_scene) {
        project.setFirstLayout(scene_name);
      }
      if (include_ui_layer && !scene.hasLayerNamed('UI')) {
        scene.insertNewLayer('UI', scene.getLayersCount());
        addDefaultLightToLayer(scene.getLayer('UI'));
        return makeGenericSuccess(
          `Scene "${scene_name}" already exists; added "UI" layer.${firstSceneSuffix}`
        );
      }

      return makeGenericSuccess(
        `Scene "${scene_name}" already exists.${firstSceneSuffix}`
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
    if (is_first_scene) {
      project.setFirstLayout(scene_name);
    }

    return {
      success: true,
      message:
        (include_ui_layer
          ? `Created scene "${scene_name}" with base layer + "UI" layer.`
          : `Created scene "${scene_name}".`) + firstSceneSuffix,
      meta: {
        newSceneNames: [scene_name],
      },
    };
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

/**
 * Applies a single effect change (add, rename, move, delete or update
 * properties) to an effects container. Shared between layers and objects,
 * which both expose the same `gd.EffectsContainer` API.
 */
const applyEffectChange = ({
  project,
  effectsContainer,
  changedEffect,
  targetLabel,
  changes,
  warnings,
  targetRenderingType,
}: {
  project: gdProject,
  effectsContainer: gdEffectsContainer,
  changedEffect: Object,
  targetLabel: string,
  changes: Array<string>,
  warnings: Array<string>,
  targetRenderingType?: string,
}) => {
  const effectName = SafeExtractor.extractStringProperty(
    changedEffect,
    'effect_name'
  );
  if (effectName === null) {
    warnings.push(`Missing "effect_name" in changed_effects item. Skipped.`);
    return;
  }
  const effect_type = SafeExtractor.extractStringProperty(
    changedEffect,
    'effect_type'
  );
  const new_effect_name = SafeExtractor.extractStringProperty(
    changedEffect,
    'new_effect_name'
  );
  const new_effect_position = SafeExtractor.extractNumberProperty(
    changedEffect,
    'new_effect_position'
  );
  const delete_this_effect = SafeExtractor.extractBooleanProperty(
    changedEffect,
    'delete_this_effect'
  );
  let newlyCreatedEffect: gdEffect | null = null;

  if (effectsContainer.hasEffectNamed(effectName)) {
    const effect = effectsContainer.getEffect(effectName);
    if (delete_this_effect) {
      effectsContainer.removeEffect(effectName);
      changes.push(`Removed "${effectName}" effect on ${targetLabel}.`);
    } else {
      if (new_effect_name) {
        effect.setName(new_effect_name);
        changes.push(
          `Renamed the "${effectName}" effect on ${targetLabel} to "${new_effect_name}".`
        );
      }
      if (new_effect_position !== null) {
        effectsContainer.moveEffect(
          effectsContainer.getEffectPosition(effectName),
          new_effect_position
        );
        changes.push(
          `Moved the "${effectName}" effect on ${targetLabel} to position ${new_effect_position}.`
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
    changedEffect,
    'changed_properties'
  );
  if (changed_properties) {
    if (!effectsContainer.hasEffectNamed(effectName)) {
      warnings.push(`Effect "${effectName}" not found. Skipped.`);
      return;
    }
    const effect = effectsContainer.getEffect(effectName);
    const effectMetadata = gd.MetadataProvider.getEffectMetadata(
      project.getCurrentPlatform(),
      effect.getEffectType()
    );

    if (gd.MetadataProvider.isBadEffectMetadata(effectMetadata)) {
      warnings.push(`Effect "${effectName}" invalid. Skipped.`);
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
        effect.setDoubleParameter(propertyName, parseFloat(newValue) || 0);
      } else if (lowercasedType === 'boolean') {
        effect.setBooleanParameter(
          propertyName,
          newValue.toLowerCase() === 'true'
        );
      } else {
        effect.setStringParameter(propertyName, newValue);
      }

      // Newly created effects get one summary message below instead, so this isn't repeated.
      if (!newlyCreatedEffect) {
        changes.push(
          `Modified "${propertyName}" property of the "${effectName}" effect to "${newValue}".`
        );
      }
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
        `Created new "${newlyCreatedEffect.getName()}" effect on ${targetLabel} at position ${new_effect_position ||
          0}. It properties are: ${serializeEffectProperties(
          newlyCreatedEffect,
          effectMetadata
        )
          .map(serializedProperty => JSON.stringify(serializedProperty))
          .join(', ')}.`
      );

      if (
        targetRenderingType === '2d' &&
        effectMetadata.isMarkedAsOnlyWorkingFor3D()
      ) {
        warnings.push(
          `"${newlyCreatedEffect.getName()}" only works in 3D, but ${targetLabel} is restricted to 2D — it may have no visible effect.`
        );
      } else if (
        targetRenderingType === '3d' &&
        effectMetadata.isMarkedAsOnlyWorkingFor2D()
      ) {
        warnings.push(
          `"${newlyCreatedEffect.getName()}" only works in 2D, but ${targetLabel} is restricted to 3D — it may have no visible effect.`
        );
      }
    }
  }
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
      return makeSceneNotFoundFailure(project, scene_name);
    }

    const scene = project.getLayout(scene_name);
    const layersContainer = scene.getLayers();

    return {
      success: true,
      propertiesLayersEffectsForSceneNamed: scene.getName(),
      properties: {
        name: scene.getName(),
        backgroundColor: rgbColorToHex(
          scene.getBackgroundColorRed(),
          scene.getBackgroundColorGreen(),
          scene.getBackgroundColorBlue()
        ),
        stopSoundsOnStartup: scene.stopSoundsOnStartup(),
        isFirstScene: project.getFirstLayout() === scene.getName(),

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

    const deleteThisScene = SafeExtractor.extractBooleanProperty(
      args,
      'delete_this_scene'
    );
    if (deleteThisScene) {
      return {
        text: (
          <Trans>
            Remove scene <b>{scene_name}</b>.
          </Trans>
        ),
      };
    }

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
    onProjectItemRenamedOutsideEditor,
    onWillDeleteScene,
  }) => {
    const scene_name = extractRequiredString(args, 'scene_name');

    if (!project.hasLayoutNamed(scene_name)) {
      return makeSceneNotFoundFailure(project, scene_name);
    }
    const scene = project.getLayout(scene_name);

    const deleteThisScene = SafeExtractor.extractBooleanProperty(
      args,
      'delete_this_scene'
    );
    if (deleteThisScene) {
      // Let the editor close any tab bound to this scene BEFORE it's
      // actually deleted (mirrors the manual delete flow, which closes tabs
      // before removing the layout). This must be awaited: closing tabs
      // requires reading the layout via `getLayout()`, which only works
      // while the scene still exists in the project.
      await onWillDeleteScene({ scene });

      const wasFirstLayout = project.getFirstLayout() === scene_name;
      if (wasFirstLayout) {
        project.setFirstLayout('');
      }
      project.removeLayout(scene_name);
      return makeGenericSuccess(
        `Deleted scene "${scene_name}".` +
          (wasFirstLayout
            ? " It has been removed as the project's first scene."
            : '')
      );
    }

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

        if (isFuzzyMatch(propertyName, 'name')) {
          const oldName = scene.getName();
          if (newValue === oldName) {
            changes.push(`Scene already named "${newValue}".`);
            return;
          }

          // Unlike objects, scene names are not identifiers and can contain
          // spaces or any character - only ensure unicity.
          const newSceneName = newNameGenerator(newValue, tentativeNewName =>
            project.hasLayoutNamed(tentativeNewName)
          );

          renameLayoutInProject(project, oldName, newSceneName);
          onProjectItemRenamedOutsideEditor({
            kind: 'scene',
            oldName,
            newName: newSceneName,
          });

          changes.push(
            `Renamed scene "${oldName}" to "${newSceneName}" (events and references updated).`
          );
        } else if (isFuzzyMatch(propertyName, 'backgroundColor')) {
          const colorAsRgb = hexNumberToRGBArray(rgbOrHexToHexNumber(newValue));
          scene.setBackgroundColor(colorAsRgb[0], colorAsRgb[1], colorAsRgb[2]);
          changes.push(
            `Set scene background color to ${rgbColorToHex(
              colorAsRgb[0],
              colorAsRgb[1],
              colorAsRgb[2]
            )}.`
          );
        } else if (isFuzzyMatch(propertyName, 'gameResolutionWidth')) {
          const newWidth = parseInt(newValue);
          project.setGameResolutionSize(
            newWidth,
            project.getGameResolutionHeight()
          );
          changes.push(`Set game resolution width to ${newWidth}.`);
        } else if (isFuzzyMatch(propertyName, 'stopSoundsOnStartup')) {
          const newStop = newValue.toLowerCase() === 'true';
          scene.setStopSoundsOnStartup(newStop);
          changes.push(
            `Set stopSoundsOnStartup to ${newStop ? 'true' : 'false'}.`
          );
        } else if (isFuzzyMatch(propertyName, 'gameResolutionHeight')) {
          const newHeight = parseInt(newValue);
          project.setGameResolutionSize(
            project.getGameResolutionWidth(),
            newHeight
          );
          changes.push(`Set game resolution height to ${newHeight}.`);
        } else if (isFuzzyMatch(propertyName, 'gameOrientation')) {
          project.setOrientation(newValue);
          changes.push(`Set game orientation to ${newValue}.`);
        } else if (isFuzzyMatch(propertyName, 'gameScaleMode')) {
          project.setScaleMode(newValue);
          changes.push(`Set game scale mode to ${newValue}.`);
        } else if (isFuzzyMatch(propertyName, 'gameName')) {
          project.setName(newValue);
          changes.push(`Set game name to "${newValue}".`);
        } else if (isFuzzyMatch(propertyName, 'isFirstScene')) {
          if (newValue.toLowerCase() === 'true') {
            // Use the scene's current name: a rename can have been applied
            // by a previous item of the same call.
            const currentSceneName = scene.getName();
            project.setFirstLayout(currentSceneName);
            changes.push(
              `Set "${currentSceneName}" as the first (startup) scene.`
            );
          }
        } else {
          warnings.push(`Unknown scene property: "${propertyName}". Skipped.`);
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
          const existingLayerNames = mapFor(
            0,
            scene.getLayers().getLayersCount(),
            i =>
              `"${scene
                .getLayers()
                .getLayerAt(i)
                .getName()}"`
          ).join(', ');

          // A deletion or rename targeting a layer that does not exist is
          // always a wrong layer name: don't create a layer out of it.
          if (delete_this_layer) {
            warnings.push(
              `Layer "${layerName}" not found in scene "${scene.getName()}": nothing was deleted. Existing layers are: ${existingLayerNames}.`
            );
            return;
          }
          if (new_layer_name) {
            warnings.push(
              `Layer "${layerName}" not found in scene "${scene.getName()}": no layer was renamed. Existing layers are: ${existingLayerNames}. To create a new layer, pass its name as "layer_name".`
            );
            return;
          }

          // Never create a layer literally named "base": this is always a
          // confusion with the default base layer, whose real name is "".
          if (layerName.trim().toLowerCase() === 'base') {
            warnings.push(
              `Layer "${layerName}" was not created: the default base layer already exists and its real name is the empty string. Use "" to target it.`
            );
            return;
          }
          const insertionPosition =
            new_layer_position === null
              ? scene.getLayers().getLayersCount()
              : new_layer_position;
          scene.getLayers().insertNewLayer(layerName, insertionPosition);
          const newLayerNames = mapFor(
            0,
            scene.getLayers().getLayersCount(),
            i =>
              `"${scene
                .getLayers()
                .getLayerAt(i)
                .getName()}"`
          ).join(', ');
          changes.push(
            `Layer "${layerName}" did not exist in scene "${scene.getName()}": created it at position ${insertionPosition}. Layers are now: ${newLayerNames}. If you meant to modify an existing layer, check its exact name.`
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
          warnings.push(`Layer "${layerName}" not found. Effects skipped.`);
          return;
        }
        const layer = scene.getLayers().getLayer(layerName);

        applyEffectChange({
          project,
          effectsContainer: layer.getEffects(),
          changedEffect: changed_layer_effect,
          targetLabel: `layer "${layerName}"`,
          changes,
          warnings,
          targetRenderingType: layer.getRenderingType(),
        });
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
        const objectsToAdd = SafeExtractor.extractStringArrayProperty(
          changed_group,
          'objects_to_add'
        );
        const objectsToRemove = SafeExtractor.extractStringArrayProperty(
          changed_group,
          'objects_to_remove'
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
            `Deleted group "${groupName}" from scene "${scene.getName()}".`
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
              `Renamed group "${groupName}" to "${newGroupName}" in scene "${scene.getName()}".`
            );
          }

          if (objectsToAdd !== null || objectsToRemove !== null) {
            const currentObjectNames = foundGroup
              .getAllObjectsNames()
              .toJSArray();

            // Resolve the names to remove first, then the names to add (relative
            // to what remains).
            const removeNames = objectsToRemove
              ? Array.from(new Set(objectsToRemove))
              : [];
            const addNames = objectsToAdd
              ? Array.from(new Set(objectsToAdd))
              : [];
            const namesToRemove = currentObjectNames.filter(name =>
              removeNames.includes(name)
            );
            const remainingNames = currentObjectNames.filter(
              name => !removeNames.includes(name)
            );
            const namesToAdd = addNames.filter(
              name => !remainingNames.includes(name)
            );

            // Remove first, so the shared variables/behaviors captured below
            // reflect the group after removals (and before additions).
            namesToRemove.forEach(objectName => {
              foundGroup.removeObject(objectName);
            });

            const globalObjects = project.getObjects();
            const sceneObjects = scene.getObjects();

            // Capture the variables and behaviors shared in common by the group
            // (from its objects after removals, before additions), so that any
            // newly added object can be filled with them - exactly like the
            // object group editor does. This keeps an object added to a group
            // consistent with the rest of the group (which is the "intersection"
            // of its objects: it shows the variables and behaviors in common).
            const objectsContainersList = gd.ProjectScopedContainers.makeNewProjectScopedContainersForProjectAndLayout(
              project,
              scene
            ).getObjectsContainersList();
            const groupVariablesContainer = gd.ObjectRefactorer.mergeVariableContainers(
              objectsContainersList,
              foundGroup
            );
            const existingGroupObjects = foundGroup
              .getAllObjectsNames()
              .toJSArray()
              .map(name => getObjectByName(globalObjects, sceneObjects, name))
              .filter(Boolean);
            const groupVisibleBehaviorNames = getAllVisibleBehaviorNames(
              existingGroupObjects
            );

            const addedObjectNames = [];
            namesToAdd.forEach(objectName => {
              const object = getObjectByName(
                globalObjects,
                sceneObjects,
                objectName
              );
              if (object) {
                foundGroup.addObject(objectName);
                addedObjectNames.push(objectName);
                // Give the newly added object the variables and behaviors
                // shared in common by the group, if it does not have them yet.
                gd.ObjectRefactorer.fillMissingGroupVariablesToObject(
                  object,
                  groupVariablesContainer
                );
                for (const behaviorName of groupVisibleBehaviorNames) {
                  gd.ObjectRefactorer.fillMissingGroupBehaviorToObject(
                    globalObjects,
                    sceneObjects,
                    object,
                    foundGroup,
                    behaviorName
                  );
                }
              } else {
                warnings.push(
                  `Object "${objectName}" not found in scene "${scene.getName()}", so it was not added to group "${groupName}".`
                );
              }
            });

            const finalObjectNames = foundGroup
              .getAllObjectsNames()
              .toJSArray();
            changes.push(
              `Group "${groupName}" in scene "${scene.getName()}" now contains ${
                finalObjectNames.length
              } object(s): ${
                finalObjectNames.length > 0
                  ? finalObjectNames.join(', ')
                  : '(none)'
              }.`
            );

            // Explain the variables and behaviors that were given to the newly
            // added objects, so it is clear they now share the ones the group
            // has in common (a group is the "intersection" of its objects).
            if (addedObjectNames.length > 0) {
              const sharedVariableDescriptions = mapFor(
                0,
                groupVariablesContainer.count(),
                index =>
                  `"${groupVariablesContainer.getNameAt(
                    index
                  )}" (${getVariableTypeAsString(
                    gd,
                    groupVariablesContainer.getAt(index)
                  )})`
              );
              const sharedBehaviorDescriptions = groupVisibleBehaviorNames.map(
                behaviorName => {
                  const behaviorType =
                    existingGroupObjects.length > 0
                      ? existingGroupObjects[0]
                          .getBehavior(behaviorName)
                          .getTypeName()
                      : null;
                  return behaviorType
                    ? `"${behaviorName}" (${behaviorType})`
                    : `"${behaviorName}"`;
                }
              );

              if (
                sharedVariableDescriptions.length > 0 ||
                sharedBehaviorDescriptions.length > 0
              ) {
                const sharedParts = [];
                if (sharedBehaviorDescriptions.length > 0) {
                  sharedParts.push(
                    `behavior(s) ${sharedBehaviorDescriptions.join(', ')}`
                  );
                }
                if (sharedVariableDescriptions.length > 0) {
                  sharedParts.push(
                    `variable(s) ${sharedVariableDescriptions.join(', ')}`
                  );
                }
                changes.push(
                  `Object(s) ${addedObjectNames
                    .map(name => `"${name}"`)
                    .join(
                      ', '
                    )} newly added to group "${groupName}" now have the ${sharedParts.join(
                    ' and '
                  )} that the rest of the group has in common (a group is the "intersection" of its objects), added to them if they did not already have them.`
                );
              }
            }
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

const MAX_LISTED_RESOURCES = 200;

const inspectProjectPropertiesResources: EditorFunction = {
  renderForEditor: ({ args }) => {
    const resourceNameFilter = SafeExtractor.extractStringProperty(
      args,
      'filter_by_resource_name'
    );
    if (resourceNameFilter) {
      return {
        text: (
          <Trans>
            Read the project properties and resources named "
            {resourceNameFilter}".
          </Trans>
        ),
      };
    }
    const listAllResources = SafeExtractor.extractBooleanProperty(
      args,
      'list_all_resources'
    );
    if (listAllResources) {
      return {
        text: <Trans>Read the project properties and resources.</Trans>,
      };
    }
    return {
      text: <Trans>Read the project properties.</Trans>,
    };
  },
  launchFunction: async ({ project, args }) => {
    const resourceNameFilter = SafeExtractor.extractStringProperty(
      args,
      'filter_by_resource_name'
    );
    const listAllResources =
      SafeExtractor.extractBooleanProperty(args, 'list_all_resources') || false;
    const shouldListResources = !!resourceNameFilter || listAllResources;

    const resourcesManager = project.getResourcesManager();
    const allResourceNames = resourcesManager.getAllResourceNames().toJSArray();
    const filteredResourceNames = resourceNameFilter
      ? allResourceNames.filter(resourceName =>
          resourceName.toLowerCase().includes(resourceNameFilter.toLowerCase())
        )
      : allResourceNames;
    const listedResourceNames = filteredResourceNames.slice(
      0,
      MAX_LISTED_RESOURCES
    );
    const resources = shouldListResources
      ? listedResourceNames.map(resourceName => {
          const resource = resourcesManager.getResource(resourceName);
          return {
            name: resourceName,
            kind: resource.getKind(),
            file: resource.getFile(),
            metadata: resource.getMetadata() || undefined,
            originName: resource.getOriginName() || undefined,
            originIdentifier: resource.getOriginIdentifier() || undefined,
          };
        })
      : undefined;

    const resourcesCountPerKind: { [string]: number } = {};
    if (!shouldListResources) {
      allResourceNames.forEach(resourceName => {
        const kind = resourcesManager.getResource(resourceName).getKind();
        resourcesCountPerKind[kind] = (resourcesCountPerKind[kind] || 0) + 1;
      });
    }
    const resourcesSummary = shouldListResources
      ? undefined
      : {
          total: allResourceNames.length,
          byKind: resourcesCountPerKind,
          hint:
            allResourceNames.length > 0
              ? 'Use `filter_by_resource_name` to search resources by name, or set `list_all_resources` to true to list them all.'
              : undefined,
        };

    const truncatedResourcesCount =
      filteredResourceNames.length - listedResourceNames.length;
    const resourcesWarning = !shouldListResources
      ? undefined
      : resourceNameFilter && filteredResourceNames.length === 0
      ? `No resource name contains "${resourceNameFilter}" (the project has ${
          allResourceNames.length
        } resources in total). Set \`list_all_resources\` to true to list them all.`
      : truncatedResourcesCount > 0
      ? `Only the first ${MAX_LISTED_RESOURCES} resources are listed (${truncatedResourcesCount} more not shown). Use \`filter_by_resource_name\` to narrow down the list.`
      : undefined;

    return {
      success: true,
      properties: {
        name: project.getName(),
        description: project.getDescription(),
        version: project.getVersion(),
        author: project.getAuthor(),
        packageName: project.getPackageName(),
        templateSlug: project.getTemplateSlug(),
        orientation: project.getOrientation(),
        windowWidth: project.getGameResolutionWidth(),
        windowHeight: project.getGameResolutionHeight(),
        adaptGameResolutionAtRuntime: project.getAdaptGameResolutionAtRuntime(),
        sizeOnStartupMode: project.getSizeOnStartupMode(),
        scaleMode: project.getScaleMode(),
        pixelsRounding: project.getPixelsRounding(),
        antialiasingMode: project.getAntialiasingMode(),
        minFPS: project.getMinimumFPS(),
        maxFPS: project.getMaximumFPS(),
        firstLayout: project.getFirstLayout(),
      },
      sceneNames: mapFor(0, project.getLayoutsCount(), i =>
        project.getLayoutAt(i).getName()
      ),
      resources,
      resourcesSummary,
      warnings: resourcesWarning,
    };
  },
  modifiesProject: false,
};

const changeProjectPropertiesResources: EditorFunction = {
  renderForEditor: ({ args }) => {
    const changed_properties = SafeExtractor.extractArrayProperty(
      args,
      'changed_properties'
    );
    const changed_resources = SafeExtractor.extractArrayProperty(
      args,
      'changed_resources'
    );
    const changedPropertiesCount =
      (changed_properties && changed_properties.length) || 0;
    const changedResourcesCount =
      (changed_resources && changed_resources.length) || 0;

    if (changedPropertiesCount > 0 && changedResourcesCount > 0) {
      return {
        text: <Trans>Update some project properties and resources.</Trans>,
      };
    }

    if (changed_resources && changedPropertiesCount === 0) {
      if (changed_resources.length === 1) {
        const resourceName = SafeExtractor.extractStringProperty(
          changed_resources[0],
          'resource_name'
        );
        const deleteThisResource = SafeExtractor.extractBooleanProperty(
          changed_resources[0],
          'delete_this_resource'
        );
        return {
          text: deleteThisResource ? (
            <Trans>
              Remove resource <b>{resourceName}</b>.
            </Trans>
          ) : (
            <Trans>
              Rename resource <b>{resourceName}</b>.
            </Trans>
          ),
        };
      }
      return {
        text: <Trans>Update {changedResourcesCount} project resources.</Trans>,
      };
    }

    if (changed_properties && changed_properties.length === 1) {
      const propertyName = SafeExtractor.extractStringProperty(
        changed_properties[0],
        'property_name'
      );
      return {
        text: (
          <Trans>
            Change project property <b>{propertyName}</b>.
          </Trans>
        ),
      };
    }

    return {
      text: <Trans>Change {changedPropertiesCount} project properties.</Trans>,
    };
  },
  launchFunction: async ({ project, args }) => {
    const changed_properties = SafeExtractor.extractArrayProperty(
      args,
      'changed_properties'
    );
    const changed_resources = SafeExtractor.extractArrayProperty(
      args,
      'changed_resources'
    );
    if (
      (!changed_properties || changed_properties.length === 0) &&
      (!changed_resources || changed_resources.length === 0)
    ) {
      return makeGenericFailure(
        'Missing or empty "changed_properties" and "changed_resources" arguments: at least one change must be provided.'
      );
    }

    const changes = [];
    const warnings = [];

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

        if (
          isFuzzyMatch(propertyName, 'name') ||
          isFuzzyMatch(propertyName, 'gameName')
        ) {
          project.setName(newValue);
          changes.push(`Set game name to "${newValue}".`);
        } else if (isFuzzyMatch(propertyName, 'description')) {
          project.setDescription(newValue);
          changes.push(`Set game description.`);
        } else if (isFuzzyMatch(propertyName, 'version')) {
          project.setVersion(newValue);
          changes.push(`Set game version to "${newValue}".`);
        } else if (isFuzzyMatch(propertyName, 'author')) {
          project.setAuthor(newValue);
          changes.push(`Set game author to "${newValue}".`);
        } else if (isFuzzyMatch(propertyName, 'packageName')) {
          project.setPackageName(newValue);
          changes.push(`Set package name to "${newValue}".`);
        } else if (
          isFuzzyMatch(propertyName, 'orientation') ||
          isFuzzyMatch(propertyName, 'gameOrientation')
        ) {
          if (
            newValue !== 'default' &&
            newValue !== 'landscape' &&
            newValue !== 'portrait'
          ) {
            warnings.push(
              `Invalid orientation: "${newValue}". Must be "default", "landscape" or "portrait". Skipped.`
            );
            return;
          }
          project.setOrientation(newValue);
          changes.push(`Set game orientation to ${newValue}.`);
        } else if (
          isFuzzyMatch(propertyName, 'windowWidth') ||
          isFuzzyMatch(propertyName, 'gameResolutionWidth')
        ) {
          const newWidth = parseInt(newValue, 10);
          if (Number.isNaN(newWidth)) {
            warnings.push(
              `Invalid windowWidth: "${newValue}". Must be a number of pixels. Skipped.`
            );
            return;
          }
          project.setGameResolutionSize(
            newWidth,
            project.getGameResolutionHeight()
          );
          changes.push(`Set game resolution width to ${newWidth}.`);
        } else if (
          isFuzzyMatch(propertyName, 'windowHeight') ||
          isFuzzyMatch(propertyName, 'gameResolutionHeight')
        ) {
          const newHeight = parseInt(newValue, 10);
          if (Number.isNaN(newHeight)) {
            warnings.push(
              `Invalid windowHeight: "${newValue}". Must be a number of pixels. Skipped.`
            );
            return;
          }
          project.setGameResolutionSize(
            project.getGameResolutionWidth(),
            newHeight
          );
          changes.push(`Set game resolution height to ${newHeight}.`);
        } else if (isFuzzyMatch(propertyName, 'adaptGameResolutionAtRuntime')) {
          const adapt = newValue.toLowerCase() === 'true';
          project.setAdaptGameResolutionAtRuntime(adapt);
          changes.push(
            `Set adaptGameResolutionAtRuntime to ${adapt ? 'true' : 'false'}.`
          );
        } else if (isFuzzyMatch(propertyName, 'sizeOnStartupMode')) {
          if (
            newValue !== '' &&
            newValue !== 'adaptWidth' &&
            newValue !== 'adaptHeight'
          ) {
            warnings.push(
              `Invalid sizeOnStartupMode: "${newValue}". Must be "adaptWidth", "adaptHeight" or an empty string. Skipped.`
            );
            return;
          }
          project.setSizeOnStartupMode(newValue);
          changes.push(`Set sizeOnStartupMode to "${newValue}".`);
        } else if (
          isFuzzyMatch(propertyName, 'scaleMode') ||
          isFuzzyMatch(propertyName, 'gameScaleMode')
        ) {
          if (newValue !== 'linear' && newValue !== 'nearest') {
            warnings.push(
              `Invalid scaleMode: "${newValue}". Must be "linear" or "nearest". Skipped.`
            );
            return;
          }
          project.setScaleMode(newValue);
          changes.push(`Set game scale mode to ${newValue}.`);
        } else if (isFuzzyMatch(propertyName, 'pixelsRounding')) {
          const pixelsRounding = newValue.toLowerCase() === 'true';
          project.setPixelsRounding(pixelsRounding);
          changes.push(
            `Set pixelsRounding to ${pixelsRounding ? 'true' : 'false'}.`
          );
        } else if (isFuzzyMatch(propertyName, 'antialiasingMode')) {
          if (newValue !== 'none' && newValue !== 'MSAA') {
            warnings.push(
              `Invalid antialiasingMode: "${newValue}". Must be "none" or "MSAA". Skipped.`
            );
            return;
          }
          project.setAntialiasingMode(newValue);
          changes.push(`Set antialiasingMode to ${newValue}.`);
        } else if (
          isFuzzyMatch(propertyName, 'minFPS') ||
          isFuzzyMatch(propertyName, 'minimumFPS')
        ) {
          const fps = parseInt(newValue, 10);
          if (Number.isNaN(fps)) {
            warnings.push(`Invalid minFPS: "${newValue}". Skipped.`);
            return;
          }
          project.setMinimumFPS(fps);
          changes.push(`Set minimum FPS to ${fps}.`);
        } else if (
          isFuzzyMatch(propertyName, 'maxFPS') ||
          isFuzzyMatch(propertyName, 'maximumFPS')
        ) {
          const fps = parseInt(newValue, 10);
          if (Number.isNaN(fps)) {
            warnings.push(`Invalid maxFPS: "${newValue}". Skipped.`);
            return;
          }
          project.setMaximumFPS(fps);
          changes.push(`Set maximum FPS to ${fps}.`);
        } else if (
          isFuzzyMatch(propertyName, 'firstLayout') ||
          isFuzzyMatch(propertyName, 'firstScene')
        ) {
          if (!project.hasLayoutNamed(newValue)) {
            warnings.push(
              `${getSceneNotFoundMessage(
                project,
                newValue
              )} \`firstLayout\` not changed.`
            );
            return;
          }
          project.setFirstLayout(newValue);
          changes.push(
            `Set "${newValue}" as the first scene loaded when the game starts (firstLayout).`
          );
        } else {
          warnings.push(
            `Unknown project property: "${propertyName}". Supported properties: name, description, version, author, packageName, orientation, windowWidth, windowHeight, adaptGameResolutionAtRuntime, sizeOnStartupMode, scaleMode, pixelsRounding, antialiasingMode, minFPS, maxFPS, firstLayout. Skipped.`
          );
        }
      });

    if (changed_resources)
      changed_resources.forEach(changed_resource => {
        const resourceName = SafeExtractor.extractStringProperty(
          changed_resource,
          'resource_name'
        );
        if (resourceName === null) {
          warnings.push(
            `Missing "resource_name" in changed_resources item: ${JSON.stringify(
              changed_resource
            )}. Skipped.`
          );
          return;
        }

        const resourcesManager = project.getResourcesManager();
        if (!resourcesManager.hasResource(resourceName)) {
          warnings.push(
            `Resource not found: "${resourceName}". Resources can be listed with \`inspect_project_properties_resources\`. Skipped.`
          );
          return;
        }

        const deleteThisResource = SafeExtractor.extractBooleanProperty(
          changed_resource,
          'delete_this_resource'
        );
        if (deleteThisResource) {
          const objectsCollector = new gd.ObjectsUsingResourceCollector(
            resourcesManager,
            resourceName
          );
          gd.ProjectBrowserHelper.exposeProjectObjects(
            project,
            // Flow does not know ObjectsUsingResourceCollector inherits from ArbitraryObjectsWorker.
            // $FlowFixMe[incompatible-type]
            objectsCollector
          );
          const objectNamesUsingResource = objectsCollector
            .getObjectNames()
            .toJSArray();
          objectsCollector.delete();

          if (objectNamesUsingResource.length > 0) {
            warnings.push(
              `Resource "${resourceName}" was NOT deleted because it is still used by: ${objectNamesUsingResource.join(
                ', '
              )}. Do NOT modify or update these objects to force the deletion. Stop and report the problem instead, so the user can decide what to do with these objects.`
            );
            return;
          }

          resourcesManager.removeResource(resourceName);
          changes.push(`Deleted resource "${resourceName}".`);
          return;
        }

        const newResourceName = SafeExtractor.extractStringProperty(
          changed_resource,
          'new_resource_name'
        );
        if (newResourceName === null || newResourceName === '') {
          warnings.push(
            `No change requested for resource "${resourceName}": set \`new_resource_name\` or \`delete_this_resource\`. Skipped.`
          );
          return;
        }
        if (newResourceName === resourceName) {
          changes.push(`Resource already named "${resourceName}".`);
          return;
        }
        if (resourcesManager.hasResource(newResourceName)) {
          warnings.push(
            `A resource named "${newResourceName}" already exists. "${resourceName}" was not renamed.`
          );
          return;
        }

        resourcesManager.renameResource(resourceName, newResourceName);
        renameResourcesInProject(project, {
          [resourceName]: newResourceName,
        });
        changes.push(
          `Renamed resource "${resourceName}" to "${newResourceName}" (objects and events using it were updated).`
        );
      });

    return makeMultipleChangesOutput(changes, warnings);
  },
  modifiesProject: true,
};

// Read the variables to change from a tool call. Supports the batch shape (a
// `variables` array) and the legacy single-variable shape (fields at the top
// level), so older tool versions keep working.
const extractVariableOperations = (
  args: any
): Array<{|
  variable_name_or_path: string | null,
  value: string | null,
  variable_type: string | null,
  delete_this_variable: boolean,
|}> => {
  const variablesArray = SafeExtractor.extractArrayProperty(args, 'variables');
  if (variablesArray) {
    return variablesArray.map(variableArgs => ({
      variable_name_or_path: SafeExtractor.extractStringProperty(
        variableArgs,
        'variable_name_or_path'
      ),
      value: SafeExtractor.extractStringProperty(variableArgs, 'value'),
      variable_type: SafeExtractor.extractStringProperty(
        variableArgs,
        'variable_type'
      ),
      delete_this_variable:
        SafeExtractor.extractBooleanProperty(
          variableArgs,
          'delete_this_variable'
        ) || false,
    }));
  }

  return [
    {
      variable_name_or_path: SafeExtractor.extractStringProperty(
        args,
        'variable_name_or_path'
      ),
      value: SafeExtractor.extractStringProperty(args, 'value'),
      variable_type: SafeExtractor.extractStringProperty(args, 'variable_type'),
      delete_this_variable: false,
    },
  ];
};

type VariablesContainersResolution = {|
  failure: EditorFunctionGenericOutput | null,
  variablesContainers: Array<gdVariablesContainer>,
  scopeDescription: string,
|};

// Resolve a variable scope to the variables container(s) to act on. A group
// resolves to the container of every object in it (a group variable is shared
// by all of them); `object` and `group` are equivalent (resolved to whichever
// exists). Returns a `failure` output to forward when the scope is invalid.
const resolveVariablesContainers = ({
  project,
  variable_scope,
  scene_name,
  object_name,
}: {|
  project: gdProject,
  variable_scope: string,
  scene_name: ?string,
  object_name: ?string,
|}): VariablesContainersResolution => {
  const fail = (message: string): VariablesContainersResolution => ({
    failure: makeGenericFailure(message),
    variablesContainers: [],
    scopeDescription: '',
  });

  if (variable_scope === 'scene') {
    if (!scene_name) {
      return fail(`Missing "scene_name" (required for scene variable).`);
    }
    if (!project.hasLayoutNamed(scene_name)) {
      return fail(getSceneNotFoundMessage(project, scene_name));
    }
    return {
      failure: null,
      variablesContainers: [project.getLayout(scene_name).getVariables()],
      scopeDescription: `scene "${scene_name}"`,
    };
  } else if (variable_scope === 'object' || variable_scope === 'group') {
    if (!object_name) {
      return fail(
        `Missing "object_name" (required for an object or group variable).`
      );
    }

    let concernedObjects: Array<gdObject> = [];
    let isGroup = false;
    if (scene_name) {
      if (!project.hasLayoutNamed(scene_name)) {
        return fail(getSceneNotFoundMessage(project, scene_name));
      }
      const concerned = resolveObjectsFromContextAndName({
        project,
        layout: project.getLayout(scene_name),
        objectOrGroupName: object_name,
      });
      if (!concerned) {
        return fail(
          `Object or group "${object_name}" not in scene "${scene_name}". For a global object, omit scene_name.`
        );
      }
      concernedObjects = concerned.objects;
      isGroup = !!concerned.group;
    } else {
      const globalObjects = project.getObjects();
      if (globalObjects.hasObjectNamed(object_name)) {
        concernedObjects = [globalObjects.getObject(object_name)];
      } else if (globalObjects.getObjectGroups().has(object_name)) {
        isGroup = true;
        concernedObjects = globalObjects
          .getObjectGroups()
          .get(object_name)
          .getAllObjectsNames()
          .toJSArray()
          .map(name => getObjectByName(globalObjects, null, name))
          .filter(Boolean);
      } else {
        return fail(
          `Object or group "${object_name}" not found globally. Did you forget to specify scene_name?`
        );
      }
    }

    if (concernedObjects.length === 0) {
      return fail(`Group "${object_name}" has no object.`);
    }

    const objectOrGroupLabel = isGroup
      ? `group "${object_name}"`
      : `object "${object_name}"`;
    return {
      failure: null,
      variablesContainers: concernedObjects.map(object =>
        object.getVariables()
      ),
      scopeDescription: scene_name
        ? `scene "${scene_name}" ${objectOrGroupLabel}`
        : `global ${objectOrGroupLabel}`,
    };
  } else if (variable_scope === 'global') {
    return {
      failure: null,
      variablesContainers: [project.getVariables()],
      scopeDescription: 'global',
    };
  }

  return fail(
    `Invalid "variable_scope": "${variable_scope}". Use \`scene\`, \`object\`, \`group\` or \`global\`.`
  );
};

const addOrEditVariable: EditorFunction = {
  renderForEditor: ({ args, shouldShowDetails }) => {
    const variable_scope = extractRequiredString(args, 'variable_scope');
    const object_name = SafeExtractor.extractStringProperty(
      args,
      'object_name'
    );
    const scene_name = SafeExtractor.extractStringProperty(args, 'scene_name');
    const operations = extractVariableOperations(args);

    const details = shouldShowDetails ? (
      <ColumnStackLayout noMargin>
        {operations.map((operation, index) => (
          <Text
            key={index}
            noMargin
            allowSelection
            color="secondary"
            size="body-small"
          >
            <b>{operation.variable_name_or_path}</b>
            {operation.delete_this_variable
              ? ' — deleted'
              : `: ${operation.value || ''}`}
          </Text>
        ))}
      </ColumnStackLayout>
    ) : null;

    if (operations.length === 1 && !operations[0].delete_this_variable) {
      const variable_name_or_path = operations[0].variable_name_or_path;
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
      } else if (variable_scope === 'object' || variable_scope === 'group') {
        return {
          text: (
            <Trans>
              Set <b>{object_name}</b>'s variable <b>{variable_name_or_path}</b>
              .
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
    }

    const variableNames = operations
      .map(operation => operation.variable_name_or_path)
      .filter(Boolean)
      .join(', ');
    if (variable_scope === 'scene') {
      return {
        text: (
          <Trans>
            Update variables <b>{variableNames}</b> in scene {scene_name}.
          </Trans>
        ),
        details,
        hasDetailsToShow: true,
      };
    } else if (variable_scope === 'object' || variable_scope === 'group') {
      return {
        text: (
          <Trans>
            Update <b>{object_name}</b>'s variables <b>{variableNames}</b>.
          </Trans>
        ),
        details,
        hasDetailsToShow: true,
      };
    } else if (variable_scope === 'global') {
      return {
        text: (
          <Trans>
            Update global variables <b>{variableNames}</b>.
          </Trans>
        ),
        details,
        hasDetailsToShow: true,
      };
    }

    return {
      text: (
        <Trans>
          Update variables <b>{variableNames}</b>.
        </Trans>
      ),
      details,
      hasDetailsToShow: true,
    };
  },
  launchFunction: async ({ project, args }) => {
    const variable_scope = extractRequiredString(args, 'variable_scope');
    const object_name = SafeExtractor.extractStringProperty(
      args,
      'object_name'
    );
    const scene_name = SafeExtractor.extractStringProperty(args, 'scene_name');
    const operations = extractVariableOperations(args);
    if (operations.length === 0) {
      return makeGenericFailure(
        `No variable to change (the "variables" list is empty).`
      );
    }

    const resolved = resolveVariablesContainers({
      project,
      variable_scope,
      scene_name,
      object_name,
    });
    if (resolved.failure) return resolved.failure;
    const { variablesContainers, scopeDescription } = resolved;

    const changes = [];
    const warnings = [];
    for (const operation of operations) {
      const {
        variable_name_or_path,
        value,
        variable_type,
        delete_this_variable,
      } = operation;

      if (!variable_name_or_path) {
        warnings.push(
          `A variable was skipped because "variable_name_or_path" is missing.`
        );
        continue;
      }

      if (delete_this_variable) {
        let removed = false;
        for (const variablesContainer of variablesContainers) {
          const result = applyVariableDeletion({
            variablePath: variable_name_or_path,
            variablesContainer,
          });
          removed = removed || result.removed;
        }
        if (removed) {
          changes.push(
            `Deleted ${scopeDescription} variable "${variable_name_or_path}".`
          );
        } else {
          warnings.push(
            `Could not delete ${scopeDescription} variable "${variable_name_or_path}": not found.`
          );
        }
        continue;
      }

      if (value === null || value === undefined) {
        warnings.push(
          `Variable "${variable_name_or_path}" was skipped: no "value" provided and it was not marked for deletion.`
        );
        continue;
      }

      let addedNewVariable = false;
      // The containers list is always non-empty here, so this is overwritten.
      let variableType = '';
      for (const variablesContainer of variablesContainers) {
        const result = applyVariableChange({
          variablePath: variable_name_or_path,
          forcedVariableType: variable_type,
          variablesContainer,
          value,
        });
        addedNewVariable = addedNewVariable || result.addedNewVariable;
        variableType = result.variableType;
      }

      const truncatedValue = truncateValue(value);
      changes.push(
        addedNewVariable
          ? `Added ${scopeDescription} variable "${variable_name_or_path}" (${variableType}) = ${truncatedValue}`
          : `Edited ${scopeDescription} variable "${variable_name_or_path}" = ${truncatedValue}`
      );
    }

    // One line per change (so a single variable keeps its original message),
    // with any warnings appended below.
    const message = [...changes, ...warnings].join('\n');
    if (changes.length === 0) {
      return makeGenericFailure(message || `No variable was changed.`);
    }
    return makeGenericSuccess(message);
  },
  modifiesProject: true,
};

const inspectVariables: EditorFunction = {
  renderForEditor: ({ args }) => {
    const variable_scope =
      SafeExtractor.extractStringProperty(args, 'variable_scope') || '';
    const object_name = SafeExtractor.extractStringProperty(
      args,
      'object_name'
    );
    const scene_name = SafeExtractor.extractStringProperty(args, 'scene_name');

    if (variable_scope === 'object' || variable_scope === 'group') {
      return {
        text: (
          <Trans>
            Inspect <b>{object_name}</b>'s variables.
          </Trans>
        ),
      };
    } else if (variable_scope === 'scene') {
      return {
        text: <Trans>Inspect scene {scene_name}'s variables.</Trans>,
      };
    } else if (variable_scope === 'global') {
      return { text: <Trans>Inspect global variables.</Trans> };
    }
    return { text: <Trans>Inspect variables.</Trans> };
  },
  launchFunction: async ({ project, args }) => {
    const variable_scope = extractRequiredString(args, 'variable_scope');
    const object_name = SafeExtractor.extractStringProperty(
      args,
      'object_name'
    );
    const scene_name = SafeExtractor.extractStringProperty(args, 'scene_name');
    const requestedPaths = (
      SafeExtractor.extractArrayProperty(args, 'variable_names_or_paths') || []
    )
      .map(entry => (typeof entry === 'string' ? entry : null))
      .filter(Boolean);

    const resolved = resolveVariablesContainers({
      project,
      variable_scope,
      scene_name,
      object_name,
    });
    if (resolved.failure) return resolved.failure;
    const { variablesContainers, scopeDescription } = resolved;
    const variablesContainer = variablesContainers[0];

    if (requestedPaths.length === 0) {
      return {
        success: true,
        message: `Variables of ${scopeDescription}.`,
        variables: getSimplifiedVariablesContainer(gd, variablesContainer),
      };
    }

    const variables = [];
    const notFound = [];
    for (const path of requestedPaths) {
      let variable = null;
      try {
        variable = getVariableAtPath({
          variablePath: path,
          variablesContainer,
        });
      } catch (error) {
        notFound.push(path);
        continue;
      }
      if (variable) {
        variables.push(getSimplifiedVariable(gd, path, variable));
      } else {
        notFound.push(path);
      }
    }

    return {
      success: true,
      message:
        notFound.length > 0
          ? `Variables of ${scopeDescription}. Not found: ${notFound.join(
              ', '
            )}.`
          : `Variables of ${scopeDescription}.`,
      variables,
    };
  },
  modifiesProject: false,
};

const createOrUpdatePlan: EditorFunction = {
  // No renderForEditor: handled server-side and shown separately via the
  // OrchestratorPlan component, so nothing to render as a function call.
  launchFunction: async ({ args }) => {
    return makeGenericFailure(
      `Unable to create or update plan - this is handled server-side.`
    );
  },
  modifiesProject: false,
};

const reportFulfilmentProblem: EditorFunction = {
  // No renderForEditor: backend-only telemetry, nothing to show to the user.
  launchFunction: async ({ args }) => {
    return makeGenericFailure(
      `Unable to report a fulfilment problem - this is handled server-side.`
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

const searchDocs: EditorFunction = {
  renderForEditor: ({ args }) => {
    return {
      text: <Trans>Search GDevelop documentation.</Trans>,
    };
  },
  launchFunction: async ({ args }) => {
    return makeGenericFailure(
      `Unable to read full documentation - continue with your existing GDevelop knowledge.`
    );
  },
  modifiesProject: false,
};

const getGameStarterSummary: EditorFunctionWithoutProject = {
  // Handled entirely on the backend to inform planning, but still shown in the
  // chat so the user can see the AI is studying a starter template.
  renderForEditor: ({ args, exampleShortHeaders }) => {
    const templateSlug = SafeExtractor.extractStringProperty(
      args,
      'template_slug'
    );

    // Prefer the real example name from the store (when loaded). Otherwise fall
    // back to humanizing the slug (e.g. "starting-first-person-shooter" ->
    // "First Person Shooter"), then to a generic label.
    const matchingExample =
      templateSlug && exampleShortHeaders
        ? exampleShortHeaders.find(
            exampleShortHeader => exampleShortHeader.slug === templateSlug
          )
        : null;
    const templateName =
      (matchingExample && matchingExample.name) ||
      (templateSlug
        ? templateSlug
            .replace(/^starting-/, '')
            .replace(/-/g, ' ')
            .replace(/\b\w/g, letter => letter.toUpperCase())
        : null);

    return {
      text: templateName ? (
        <Trans>Reviewing the {templateName} starter template.</Trans>
      ) : (
        <Trans>Reviewing a starter game template.</Trans>
      ),
    };
  },
  launchFunction: async () => {
    return makeGenericFailure(
      'get_game_starter_summary is handled on the backend.'
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

const MAX_SUB_AGENT_TITLE_WORDS = 30;

const truncateSubAgentTitleByWords = (title: string): string => {
  const words = title.trim().split(/\s+/);
  if (words.length <= MAX_SUB_AGENT_TITLE_WORDS) return title.trim();
  return words.slice(0, MAX_SUB_AGENT_TITLE_WORDS).join(' ') + '...';
};

const runExplorerAgent: EditorFunction = {
  renderForEditor: ({ args }) => {
    const shortTitle = SafeExtractor.extractStringProperty(args, 'short_title');
    if (shortTitle && shortTitle.trim()) {
      return {
        text: truncateSubAgentTitleByWords(shortTitle),
      };
    }
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
    const shortTitle = SafeExtractor.extractStringProperty(args, 'short_title');
    if (shortTitle && shortTitle.trim()) {
      return {
        text: truncateSubAgentTitleByWords(shortTitle),
      };
    }
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
  // No-op: the function call output is sent to the backend along with an
  // up-to-date game project JSON, which the backend uses to compute the
  // actual read result.
  launchFunction: async ({ args }) => {
    return { success: true };
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
  // Old tool names, kept for AI requests still using an older toolsVersion:
  // redirected to the same (backward-compatible) implementation as the new names.
  inspect_object_properties: inspectObjectPropertiesEffects,
  change_object_property: changeObjectPropertiesEffects,
  inspect_object_properties_effects: inspectObjectPropertiesEffects,
  change_object_properties_effects: changeObjectPropertiesEffects,
  add_behavior: addBehavior,
  // Not offered to the AI anymore since toolsVersion v6 (behavior deletion is
  // now done via `change_behavior_property`'s `delete_this_behavior`), but kept
  // here for AI requests still using an older toolsVersion.
  remove_behavior: removeBehavior,
  inspect_behavior_properties: inspectBehaviorProperties,
  change_behavior_property: changeBehaviorProperty,
  describe_instances: describeInstances,
  put_2d_instances: put2dInstances,
  put_3d_instances: put3dInstances,
  read_scene_events: readSceneEvents,
  add_scene_events: addSceneEvents,
  create_scene: createScene,
  inspect_scene_properties_layers_effects: inspectScenePropertiesLayersEffects,
  change_scene_properties_layers_effects_groups: changeScenePropertiesLayersEffectsGroups,
  inspect_project_properties_resources: inspectProjectPropertiesResources,
  change_project_properties_resources: changeProjectPropertiesResources,
  add_or_edit_variable: addOrEditVariable,
  inspect_variables: inspectVariables,
  read_full_docs: readFullDocs,
  search_docs: searchDocs,

  create_or_update_plan: createOrUpdatePlan,

  run_explorer_agent: runExplorerAgent,
  run_edit_agent: runEditAgent,
  read_game_project_json: readGameProjectJson,
  search_object_asset_store: searchObjectAssetStore,

  generate_events: addSceneEvents,

  report_fulfilment_problem: reportFulfilmentProblem,
};

export const editorFunctionsWithoutProject: {
  [string]: EditorFunctionWithoutProject,
} = {
  initialize_project: initializeProject,
  get_game_starter_summary: getGameStarterSummary,
};
