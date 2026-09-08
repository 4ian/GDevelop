// @flow
import * as React from 'react';
import {
  getInstancesInLayoutForLayer,
  renameLayoutInProject,
} from '../Utils/Layout';
import { mapFor } from '../Utils/MapFor';
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
  buildEventScriptSourceView,
  renderEventSourceById,
  renderScopeSummaryHeaderLines,
  type ScopeSummary,
} from '../EventsSheet/EventsTree/TextRenderer/EventScriptSourceView';
import {
  addMissingObjectBehaviors,
  addObjectUndeclaredVariables,
  addUndeclaredVariables,
  applyEventsChanges,
} from './ApplyEventsChanges';
import { isBehaviorDefaultCapability } from '../BehaviorsEditor/EnumerateBehaviorsMetadata';
import { renameResourcesInProject } from '../ResourcesList/ResourceUtils';
import { runGameplayTest, changeGameplayTests } from './GameplayTestTools';
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
  makeSimplifiedProjectBuilder,
} from './SimplifiedProject/SimplifiedProject';
import {
  navigateSimplifiedProjectJson,
  type ArrayItemsFilter,
} from './SimplifiedProject/SimplifiedProjectReader';
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
  ExtensionsOutsideEditorChanges,
  WillDeleteExtensionItemChanges,
  InstancesOutsideEditorChanges,
  ObjectsOutsideEditorChanges,
  ObjectGroupsOutsideEditorChanges,
  ProjectItemRenamedOutsideEditorChanges,
  WillDeleteSceneChanges,
  WillDeleteGameplayTestChanges,
  WillDeleteObjectChanges,
} from './OutsideEditorChanges';
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';
import { type ExampleShortHeader } from '../Utils/GDevelopServices/Example';
import { swapAsset } from '../AssetStore/AssetSwapper';
import { type EnsureExtensionInstalledOptions } from '../AiGeneration/UseEnsureExtensionInstalled';
import { getObjectFolderOrObjectWithContextFromObjectName } from '../SceneEditor/ObjectFolderOrObjectsSelection';
import {
  extractRequiredString,
  formatPropertiesList,
  getObjectSizeInfo,
  getObjectSizeInfoHints,
  getSimplifiedInstance,
  makeGenericFailure,
  shouldHideProperty,
  type ObjectSizeInfo,
} from './Utils';
import { executeScript } from './ScriptExecution/ScriptRunner';
import { buildExposedScriptFunctions } from './ScriptExecution/ExposedFunctions';
import {
  getSceneNotFoundMessage,
  resolveScopeFromArgs,
  getNamedVariantRejection,
  getReadOnlyRejection,
  complyVariantsAfterStructuralEdit,
  getOutsideEditorChangesTarget,
  OBJECTS_SCOPE_TYPES,
  isTypeOfProjectExtension,
  getScopeObjectsContainer,
  getObjectLookupScopeText,
  updateBehaviorsSharedDataInScope,
  renameLayerInScope,
  removeLayerInScope,
  mergeLayersInScope,
  withScopeObjectsContainersList,
  makeScopeProjectScopedContainersAccessor,
  getEventsFunctionInScope,
  getSceneNameFromArgs,
  getScopeLabelFromArgs,
  getFunctionTargetFromArgs,
  type ResolvedScope,
  type ScopeFailure,
  type ToolScopeType,
  type ToolScope,
} from './Scope';
import {
  createExtension,
  changeExtensionProperties,
} from './Extensions/ExtensionFunctions';
import {
  createCustomObject,
  changeCustomObject,
} from './Extensions/CustomObjectFunctions';
import {
  createCustomBehavior,
  changeCustomBehavior,
} from './Extensions/CustomBehaviorFunctions';
import {
  createCustomFunction,
  changeCustomFunction,
} from './Extensions/CustomFunctionFunctions';
import { capScriptExecutionResult } from './ScriptExecution/CapScriptOutput';
import { isNoOpConsideredSuccess } from './IsNoOpConsideredSuccess';
import {
  inspectExtension,
  type InspectedCustomBehavior,
  type InspectedCustomObject,
  type InspectedExtension,
  type InspectedFunction,
  type InspectedVariant,
} from './Extensions/InspectExtension';

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
    // For `run_script`: true when ANY call the script made modified the
    // project (so the editor refreshes even if the script ultimately failed).
    didModifyProject?: boolean,
  },
  // `run_script` (script-based agents) output payload. Present only for
  // `run_script` calls.
  functionCallRecords?: Array<Object>,
  consoleLogs?: Array<string>,
  returnValue?: any,
  error?: {|
    message: string,
    lineNumber: number | null,
    lastCalledFunctionName: string | null,
  |} | null,
  message?: string,
  // `read_game_project_json` output payload: the value at the requested path
  // of the simplified project (its shape entirely depends on the path).
  result?: any,
  // `run_gameplay_test` output payload. Present only for gameplay test runs.
  status?: string,
  testName?: string,
  framesExecuted?: number,
  durationMs?: number,
  gameTimeMs?: number,
  assertions?: Array<Object>,
  errors?: Array<string>,
  eventLog?: Array<Object>,
  finalState?: Object | null,
  screenshots?: Array<Object>,
  performance?: Object | null,
  // Set to true (v12+) when a mutating call was a no-op because the requested
  // state already matched the current state. Lets the no-op rate be counted
  // from `functionCallRecords`/CloudWatch without any new telemetry.
  nothingChanged?: boolean,
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
  // `add_behavior`: the behavior name the editor assigned, per object — a
  // declared output type, because nothing else lets a script know it.
  addedBehaviors?: Array<{|
    objectName: string,
    behaviorName: string,
    behaviorType: string,
  |}>,
  // `change_gameplay_tests`: the ordered tests of the scope after the changes
  // (capped), so renames/reorders/deletions are self-verifying.
  tests?: Array<{| test_name: string, description: string |}>,
  variables?: Array<SimplifiedVariable>,
  // `inspect_extension` output payload: the extension level is always there,
  // the other levels only when their selector argument is given.
  extension?: InspectedExtension,
  customObject?: InspectedCustomObject,
  customBehavior?: InspectedCustomBehavior,
  functionDeclaration?: InspectedFunction,
  variant?: InspectedVariant,
  // The extension authoring functions (`create_extension`,
  // `change_extension_properties`, `create_custom_object`,
  // `change_custom_object`): the FINAL names of what was created or changed.
  extensionName?: string,
  customObjectName?: string,
  objectType?: string,
  variantNames?: Array<string>,
  // Custom behaviors and functions: the type to write in the events and, for
  // a function, how to call it from EventScript.
  customBehaviorName?: string,
  behaviorType?: string,
  functionType?: string,
  callForms?: Array<string>,
  reminder?: string,
  animationNames?: string,
  // EventScript source view (see `read_events_source`):
  eventScript?: string,
  selectedEventIds?: Array<string>,
  truncated?: boolean,
  notes?: Array<string>,
  generatedEventsErrorDiagnostics?: string,
  aiGeneratedEventId?: string,
  warnings?: string,
  errors?: Array<string>,

  initializedProject?: boolean,
  initializedFromTemplateSlug?: string,
  eventsAsTextByScene?: { [string]: string },

  // Used for de-duplication of outputs:
  eventsForSceneNamed?: string,
  // `read_events_source` in a function of an extension: the scope read, the
  // function read and what its events can use.
  eventsForScopeLabel?: string,
  functionName?: string,
  scopeSummary?: ScopeSummary,
  instancesForSceneNamed?: string,
  instancesOnlyForObjectsNamed?: string, // Must be combined with `instancesForSceneNamed`.
  propertiesLayersEffectsForSceneNamed?: string,
  objectPropertiesDeduplicationKey?: string,

  // Set instead of (or next to) the `*ForSceneNamed` fields when the scope is
  // not a scene: the instances of an external layout, or a custom object
  // variant (`scopeLabel` being the label of the scope: `custom object
  // "UI::Dialog" (default variant)`).
  instancesForExternalLayoutNamed?: string,
  instancesForScopeLabel?: string,
  propertiesLayersEffectsForScopeLabel?: string,
  // `inspect_scene_properties_layers_effects` on a custom object variant: a
  // variant has no scene properties, but an area, groups and an asset store id.
  isDefaultVariant?: boolean,
  area?: {|
    minX: number,
    minY: number,
    minZ: number,
    maxX: number,
    maxY: number,
    maxZ: number,
  |},
  objectGroups?: Array<{|
    objectGroupName: string,
    objectNames: Array<string>,
  |}>,
  assetStoreAssetId?: string,

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
  eventScript: string | null,
  placementRelation: string,
  placementTargetEventId: string | null,
  placementExpectedParentEventId: string | null,
  placementRationale: string | null,
  // Anchor echo for replace placements (proof the replaced event was read):
  expectedEventSource: string | null,
  // The actual current source of the target event, that the backend
  // compares the anchor against:
  placementTargetEventSource: string | null,
|};

export type EventsGenerationOptions = {|
  // Where the events are generated: a scene, or a function of an extension
  // (`functionName` set). `sceneName` is the scene name (or '' for a
  // function), kept for the generation API.
  scope: ToolScope,
  functionName: string | null,
  sceneName: string,
  eventsDescription: string | null,
  eventBatches: Array<EventBatch> | null,
  extensionNamesList: string,
  objectsList: string,
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
  onOpenEventsFunctionsExtension: (
    extensionName: string,
    options: {|
      functionName?: string,
      behaviorName?: string,
      objectName?: string,
    |}
  ) => void,
  onOpenCustomObjectEditor: (
    extensionName: string,
    objectName: string,
    variantName: string
  ) => void,
|};

export type ToolOptions = {
  includeEventsJson?: boolean,
  ...
};

export type RenderForEditorOptions = {|
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

export type LaunchFunctionOptionsWithoutProject = {|
  PixiResourcesLoader: any,
  args: any,
  editorCallbacks: EditorCallbacks,
  toolOptions: ToolOptions | null,
  // The AI request's tools version (e.g. 'v12'). Threaded so functions can gate
  // version-dependent behavior (e.g. `isNoOpConsideredSuccess`). May be null
  // when unknown (treated as pre-v12).
  toolsVersion?: ?string,
  // When true, `run_script` exposes only non-mutating functions (explorer
  // sub-agent scripts, which must stay read-only). Ignored by other functions.
  runScriptReadOnly?: boolean,
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
  onWillDeleteGameplayTest: (
    changes: WillDeleteGameplayTestChanges
  ) => Promise<void>,
  onWillDeleteObject: (changes: WillDeleteObjectChanges) => void,
  // Extensions authored by the AI (see `OutsideEditorChanges.js`): the
  // changes are coalesced per batch, `ensureExtensionsUpToDate` flushes them
  // (regenerating the extensions) when a function needs fresh metadata, and
  // `onWillDeleteExtensionItem` must be awaited before a deletion.
  onExtensionsModifiedOutsideEditor: (
    changes: ExtensionsOutsideEditorChanges
  ) => void,
  ensureExtensionsUpToDate: () => Promise<void>,
  onWillDeleteExtensionItem: (
    changes: WillDeleteExtensionItemChanges
  ) => Promise<void>,
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

/**
 * Everything a `launchFunction` receives except the call itself: what
 * `run_script` forwards to every function a script calls.
 */
export type LaunchFunctionCollaborators = Omit<
  LaunchFunctionOptionsWithoutProject,
  'args'
>;

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
  /**
   * Optional: refine `modifiesProject` per call from its (parsed) arguments -
   * used to gate edits behind a user confirmation when auto-edit is off.
   */
  getModifiesProject?: (args: any) => boolean,
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
  /**
   * Optional: refine `modifiesProject` per call from its (parsed) arguments -
   * used to gate edits behind a user confirmation when auto-edit is off.
   */
  getModifiesProject?: (args: any) => boolean,
|};

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

// Inside a custom object, positions are local to it: without this the AI
// would place children in scene coordinates.
const CUSTOM_OBJECT_INSTANCE_POSITION_SEMANTICS_MESSAGE =
  'These instances are the children of a custom object: they live in its local space, where (0;0) is the position of the custom object (they are never scene coordinates). ' +
  'The default size of the custom object is its area (areaMinX to areaMaxX, areaMinY to areaMaxY, areaMinZ to areaMaxZ) when the variant defines one, otherwise the bounding box of the children. ' +
  'Resizing an instance of the custom object scales its children proportionally, unless `isInnerAreaFollowingParentSize` is set (children then keep their position and the area follows the parent size - the UI/layout case). ' +
  'Rotation and flipping are applied by the parent, and in 3D the z of a child is relative to the z of the parent. ' +
  'Layers are internal to the custom object (at runtime children are reported on the layer of the parent) and the z-order of children is relative inside the parent. ' +
  INSTANCE_POSITION_SEMANTICS_MESSAGE;

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

/**
 * A failure of the scope resolution (or of a scope rule), as the output of an
 * editor function.
 */
const makeScopeFailureOutput = (
  failure: ScopeFailure
): EditorFunctionGenericOutput => makeGenericFailure(failure.message);

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

/**
 * A call that ended up changing nothing. From tools v12 this is a SUCCESS
 * carrying the reasons: a script stops at its first failure, so a wrong
 * property name in one call must not throw away every other edit of the batch
 * (measured as the most frequent script failure in production). The agent still
 * reads the reasons, and `nothingChanged` marks the outcome for the caller.
 * Pre-v12 keeps the failure. See isNoOpConsideredSuccess.
 */
const makeNothingChangedOutput = ({
  toolsVersion,
  message,
  warnings,
}: {|
  toolsVersion: ?string,
  message: string,
  warnings?: string,
|}): EditorFunctionGenericOutput => {
  const isSuccess = isNoOpConsideredSuccess(toolsVersion);
  return {
    success: isSuccess,
    message,
    warnings,
    nothingChanged: isSuccess ? true : undefined,
  };
};

const makeMultipleChangesOutput = (
  changes: Array<string>,
  warnings: Array<string>,
  toolsVersion: ?string
): EditorFunctionGenericOutput => {
  if (changes.length === 0 && warnings.length === 0) {
    return makeNothingChangedOutput({
      toolsVersion,
      message:
        'Nothing changed: the requested values are already the current ones, or nothing was requested.',
    });
  } else if (changes.length === 0 && warnings.length > 0) {
    return makeNothingChangedOutput({
      toolsVersion,
      message: ['Nothing changed. Issues:', ...warnings].join('\n'),
    });
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

const serializeNamedProperty = (
  name: string,
  property: gdPropertyDescriptor
): null | {} => {
  const isEmptyFontResource =
    property.getType().toLowerCase() === 'resource' &&
    (property.getExtraInfo().toJSArray()[0] || '').toLowerCase() === 'font' &&
    property.getValue() === '';

  return {
    name,
    ...serializeToJSObject(property),
    group: undefined,
    quickCustomizationVisibility: undefined,
    advanced: undefined,
    ...(isEmptyFontResource
      ? { hint: 'An empty font is valid: the default font is used.' }
      : undefined),
  };
};

// Having no property at all is expected for capability behaviors: explain and
// redirect instead of listing nothing, so callers stop re-inspecting or
// guessing property names from actions/expressions.
const noEditablePropertiesText =
  "No editable properties exist here. This is expected for capability behaviors (Scale, Opacity, Flippable, Resizable, Effect...): they are only used through their actions, conditions and expressions in events — never guess property names from those. An object's default size, scale or opacity is set on each placed instance, or with actions in events.";

// List the (visible) property names so a "property not found" warning lets
// the caller immediately pick the right name instead of guessing again. If no
// property exists at all, explain that instead.
// Emitted at most once per call: if a previous warning already includes this
// text (e.g. several unknown properties in the same call), returns "".
const getAvailablePropertyNamesText = (
  properties: gdMapStringPropertyDescriptor | null,
  existingWarnings: Array<string>
): string => {
  if (
    existingWarnings.some(
      warning =>
        warning.includes('Available properties:') ||
        warning.includes(noEditablePropertiesText)
    )
  )
    return '';
  if (!properties) return '';
  const names = properties
    .keys()
    .toJSArray()
    .filter(name => !shouldHideProperty(properties.get(name)));
  if (names.length === 0) return ` ${noEditablePropertiesText}`;
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

// In the events of a custom object, `Object` designates the custom object
// itself: a child with this name would be unreachable.
const RESERVED_CHILD_OBJECT_NAME = 'Object';

/**
 * A child object can't be of the type of the custom object holding it, nor of
 * a type (transitively) holding it: this would be an infinite nesting.
 */
const getCircularChildTypeRejection = (
  project: gdProject,
  resolvedScope: ResolvedScope,
  objectType: ?string
): EditorFunctionGenericOutput | null => {
  const { eventsBasedObject } = resolvedScope;
  if (!eventsBasedObject || !objectType) return null;
  if (!project.hasEventsBasedObject(objectType)) return null;

  const childEventsBasedObject = project.getEventsBasedObject(objectType);
  if (
    !gd.EventsBasedObjectDependencyFinder.isDependentFromEventsBasedObject(
      project,
      childEventsBasedObject,
      eventsBasedObject
    )
  ) {
    return null;
  }
  return makeGenericFailure(
    `Cannot use type "${objectType}" for a child of ${
      resolvedScope.label
    }: "${objectType}" is (or contains) this custom object, which would be circular.`
  );
};

/**
 * Creates a new object (in the specified scene or globally), or replaces an existing one, or duplicates an existing one.
 */
const createOrReplaceObject: EditorFunction = {
  renderForEditor: ({ args, editorCallbacks }) => {
    const scene_name = getSceneNameFromArgs(args);
    const object_name = extractRequiredString(args, 'object_name');
    const replaceExistingObject = SafeExtractor.extractBooleanProperty(
      args,
      'replace_existing_object'
    );
    const duplicatedObjectName = SafeExtractor.extractStringProperty(
      args,
      'duplicated_object_name'
    );

    if (!scene_name) {
      const scopeLabel = getScopeLabelFromArgs(args);
      return {
        text: replaceExistingObject ? (
          <Trans>
            Replace <b>{object_name}</b> in {scopeLabel}.
          </Trans>
        ) : duplicatedObjectName ? (
          <Trans>
            Duplicate <b>{duplicatedObjectName}</b> as <b>{object_name}</b> in{' '}
            {scopeLabel}.
          </Trans>
        ) : (
          <Trans>
            Add <b>{object_name}</b> to {scopeLabel}.
          </Trans>
        ),
      };
    }

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
    ensureExtensionsUpToDate,
    searchAndInstallAsset,
    onObjectsModifiedOutsideEditor,
    onWillInstallExtension,
    onExtensionInstalled,
    PixiResourcesLoader,
    getAssetStoreTagForNewObject,
  }) => {
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

    const resolvedScope = resolveScopeFromArgs(project, args, {
      allowedTypes: OBJECTS_SCOPE_TYPES,
    });
    if (resolvedScope.success === false)
      return makeScopeFailureOutput(resolvedScope);
    const readOnlyRejection = getReadOnlyRejection(resolvedScope);
    if (readOnlyRejection) return makeScopeFailureOutput(readOnlyRejection);
    // Creating, replacing, moving or duplicating a child object changes the
    // structure of the custom object: only the default variant owns it.
    const namedVariantRejection = getNamedVariantRejection(resolvedScope);
    if (namedVariantRejection)
      return makeScopeFailureOutput(namedVariantRejection);

    const { eventsBasedObject, eventsFunctionsExtension } = resolvedScope;
    const scopeObjects = getScopeObjectsContainer(resolvedScope);
    const globalObjects = resolvedScope.globalObjectsContainer;
    const isTargetScopeGlobal = target_object_scope === 'global';

    if (eventsBasedObject) {
      if (target_object_scope && target_object_scope !== 'scene') {
        return makeGenericFailure(
          `\`target_object_scope\` only applies to scenes: a child of ${
            resolvedScope.label
          } is always local to it.`
        );
      }
      if (targetObjectName === RESERVED_CHILD_OBJECT_NAME) {
        return makeGenericFailure(
          `"${RESERVED_CHILD_OBJECT_NAME}" is a reserved child name: in the events of ${
            resolvedScope.label
          } it designates the custom object itself. Use another \`object_name\`.`
        );
      }
    }

    // Children added to the default variant must be mirrored in the named
    // variants, and the object functions must get their new parameters.
    const complyAfterChildObjectAdded = () => {
      if (!eventsBasedObject || !eventsFunctionsExtension) return;
      complyVariantsAfterStructuralEdit(project, resolvedScope);
      gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
        eventsFunctionsExtension,
        eventsBasedObject
      );
    };

    const updateBehaviorsSharedDataForTarget = () => {
      if (isTargetScopeGlobal) {
        gd.WholeProjectRefactorer.updateBehaviorsSharedData(project);
      } else {
        updateBehaviorsSharedDataInScope(project, resolvedScope);
      }
    };

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

    if (scopeObjects.hasObjectNamed(targetObjectName)) {
      existingTargetObject = scopeObjects.getObject(targetObjectName);
    } else if (
      globalObjects &&
      globalObjects.hasObjectNamed(targetObjectName)
    ) {
      existingTargetObject = globalObjects.getObject(targetObjectName);
      isTargetObjectGlobal = true;
    }

    const existingTargetObjectScopeText = isTargetObjectGlobal
      ? 'globally'
      : `in ${resolvedScope.label}`;

    let existingObjectShouldBeMoved = false;
    if (existingTargetObject) {
      if (isTargetScopeGlobal && !isTargetObjectGlobal) {
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
        `Object "${targetObjectName}" already exists ${existingTargetObjectScopeText} with type "${existingTargetObjectType}". Cannot (re)create as type "${object_type}".`
      );
    }
    const candidateType = object_type || existingTargetObjectType || null;

    const circularTypeRejection = getCircularChildTypeRejection(
      project,
      resolvedScope,
      candidateType
    );
    if (circularTypeRejection) return circularTypeRejection;

    const createNewObject = async () => {
      if (existingTargetObject) {
        // Type mismatch was already rejected above.
        // /!\ Tell the editor that some objects have potentially been modified (and even removed).
        // This will force the objects panel to refresh.
        onObjectsModifiedOutsideEditor({
          ...getOutsideEditorChangesTarget(resolvedScope),
          isNewObjectTypeUsed: false, // No object was actually added.
        });
        return makeGenericSuccess(
          `Object "${targetObjectName}" already exists - nothing was changed. Set replace_existing_object to true to replace its assets from the asset store.`
        );
      }

      const targetObjectsContainer =
        isTargetScopeGlobal && globalObjects ? globalObjects : scopeObjects;
      const targetScopeText = isTargetScopeGlobal
        ? 'global'
        : resolvedScope.label;

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
            updateBehaviorsSharedDataForTarget();
            complyAfterChildObjectAdded();

            // /!\ Tell the editor that some objects have potentially been modified (and even removed).
            // This will force the objects panel to refresh.
            onObjectsModifiedOutsideEditor({
              ...getOutsideEditorChangesTarget(resolvedScope),
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
          const serverErrorData =
            error.response && error.response.data
              ? ` - ${JSON.stringify(error.response.data)}`
              : '';
          return makeGenericFailure(
            `Unexpected error while searching/installing object (${
              error.message
            }${serverErrorData}).`
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

      // A custom object of the project may have just been authored: its
      // metadata only exists once the extensions are regenerated.
      if (isTypeOfProjectExtension(project, candidateType)) {
        await ensureExtensionsUpToDate();
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
      complyAfterChildObjectAdded();
      // /!\ Tell the editor that some objects have potentially been modified (and even removed).
      // This will force the objects panel to refresh.
      onObjectsModifiedOutsideEditor({
        ...getOutsideEditorChangesTarget(resolvedScope),
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

      const objectsContainerWhereObjectWasFound =
        isTargetObjectGlobal && globalObjects ? globalObjects : scopeObjects;
      const targetObjectsContainer =
        isTargetScopeGlobal && globalObjects
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
            ...getOutsideEditorChangesTarget(resolvedScope),
            isNewObjectTypeUsed: false, // The object type was not changed.
          });
          return makeGenericSuccess(
            `Replaced ${
              isTargetObjectGlobal ? 'global' : resolvedScope.label
            } object "${existingTargetObject.getName()}" with asset store object (same type "${existingTargetObject.getType()}").${getUsedAssetText(
              assetShortHeader
            )}`
          );
        } else {
          // No asset found (or an incomplete install result): remove any
          // temporary replacement object so none leaks into the project.
          for (const createdObject of createdObjects) {
            targetObjectsContainer.removeObject(createdObject.getName());
          }
        }
      } catch (error) {
        const serverErrorData =
          error.response && error.response.data
            ? ` - ${JSON.stringify(error.response.data)}`
            : '';
        return makeGenericFailure(
          `Unexpected error while searching/installing object (${
            error.message
          }${serverErrorData}).`
        );
      }

      return makeGenericFailure(
        `No asset store match for "${targetObjectName}" in ${
          resolvedScope.label
        }. Instead, inspect and modify the object's properties to match what you need.`
      );
    };

    const duplicateExistingObject = (
      duplicatedObjectName: string,
      duplicatedFromScope: ResolvedScope
    ) => {
      // `insertNewObject` does not enforce name uniqueness: duplicating onto a
      // taken name would silently corrupt the project with two objects sharing
      // the same name.
      if (existingTargetObject) {
        return makeGenericFailure(
          `Object "${targetObjectName}" already exists ${existingTargetObjectScopeText}. Not duplicated. Use another \`object_name\`, or delete the existing object first.`
        );
      }

      const duplicatedFromObjects = getScopeObjectsContainer(
        duplicatedFromScope
      );
      const duplicatedFromGlobalObjects =
        duplicatedFromScope.globalObjectsContainer;

      let isDuplicatedObjectGlobal = false;
      let duplicatedObject: gdObject | null = null;
      if (duplicatedFromObjects.hasObjectNamed(duplicatedObjectName)) {
        duplicatedObject = duplicatedFromObjects.getObject(
          duplicatedObjectName
        );
      } else if (
        duplicatedFromGlobalObjects &&
        duplicatedFromGlobalObjects.hasObjectNamed(duplicatedObjectName)
      ) {
        duplicatedObject = duplicatedFromGlobalObjects.getObject(
          duplicatedObjectName
        );
        isDuplicatedObjectGlobal = true;
      }

      if (!duplicatedObject) {
        return makeGenericFailure(
          `Object "${duplicatedObjectName}" not found ${getObjectLookupScopeText(
            duplicatedFromScope
          )}. Not duplicated.`
        );
      }

      const duplicatedCircularTypeRejection = getCircularChildTypeRejection(
        project,
        resolvedScope,
        duplicatedObject.getType()
      );
      if (duplicatedCircularTypeRejection) {
        return duplicatedCircularTypeRejection;
      }

      const targetObjectsContainer =
        isTargetScopeGlobal && globalObjects ? globalObjects : scopeObjects;

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
      updateBehaviorsSharedDataForTarget();
      complyAfterChildObjectAdded();

      // /!\ Tell the editor that some objects have potentially been modified (and even removed).
      // This will force the objects panel to refresh.
      onObjectsModifiedOutsideEditor({
        ...getOutsideEditorChangesTarget(resolvedScope),
        isNewObjectTypeUsed: false, // The object type can't be new because it is duplicated.
      });

      const fromText = isDuplicatedObjectGlobal
        ? 'global objects'
        : duplicatedFromScope.label;
      const toText = isTargetScopeGlobal
        ? 'global objects'
        : resolvedScope.label;
      return makeGenericSuccess(
        `Duplicated "${duplicatedObjectName}" (${fromText}) as "${newObject.getName()}" (${toText}); same type/behaviors/properties/effects.`
      );
    };

    const moveExistingObject = () => {
      const existingTargetObjectFolderOrObject =
        globalObjects && existingTargetObject
          ? getObjectFolderOrObjectWithContextFromObjectName(
              globalObjects,
              scopeObjects,
              existingTargetObject.getName()
            )
          : null;
      if (
        !existingTargetObjectFolderOrObject ||
        !existingTargetObject ||
        !globalObjects
      ) {
        throw new Error(
          "Internal error: can't locate the existing object to be moved."
        );
      }

      if (isTargetScopeGlobal && !isTargetObjectGlobal) {
        if (globalObjects.hasObjectNamed(existingTargetObject.getName())) {
          return makeGenericFailure(
            `Object "${existingTargetObject.getName()}" already exists globally. No change.`
          );
        }

        scopeObjects.moveObjectFolderOrObjectToAnotherContainerInFolder(
          existingTargetObjectFolderOrObject.objectFolderOrObject,
          globalObjects,
          globalObjects.getRootFolder(),
          0
        );

        gd.WholeProjectRefactorer.updateBehaviorsSharedData(project);

        // /!\ Tell the editor that some objects have potentially been modified (and even removed).
        // This will force the objects panel to refresh.
        onObjectsModifiedOutsideEditor({
          ...getOutsideEditorChangesTarget(resolvedScope),
          isNewObjectTypeUsed: false, // The object type was not changed.
        });

        return makeGenericSuccess(
          `Moved "${existingTargetObject.getName()}" to global objects; type/behaviors/properties/effects unchanged.`
        );
      } else if (target_object_scope === 'scene' && isTargetObjectGlobal) {
        return makeGenericFailure(
          `"${existingTargetObject.getName()}" is global; global objects cannot be moved to ${
            resolvedScope.label
          }.`
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
      // The duplicated object can come from another container than the target
      // one (a scene object copied into a custom object as a child...).
      const duplicatedFromScope = resolveScopeFromArgs(
        project,
        {
          scope: args ? args.duplicated_object_scope : null,
          duplicated_object_scene: args ? args.duplicated_object_scene : null,
        },
        {
          // A scene, or a variant of a custom object (its child objects).
          allowedTypes: OBJECTS_SCOPE_TYPES,
          legacySceneNameField: 'duplicated_object_scene',
          defaultScope: resolvedScope.scope,
        }
      );
      if (duplicatedFromScope.success === false) {
        return makeGenericFailure(
          `${duplicatedFromScope.message} Not duplicated.`
        );
      }
      return duplicateExistingObject(duplicatedObjectName, duplicatedFromScope);
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

// Resource kinds that exist in the free library and can be searched and
// installed on the fly (see `searchAndInstallResources`).
const libraryResourceKinds = ['audio', 'font'];

type MissingLibraryResource = {|
  changedProperty: Object,
  resourceName: string,
  resourceKind: string,
|};

/**
 * Applies a single property change (or the special "name" rename) to an
 * object. Shared between the property and effects loops of
 * `change_object_properties_effects`.
 *
 * When `missingLibraryResources` is given, a resource property set to a
 * name that matches nothing in the project but whose kind is available in
 * the free library is collected there (instead of warning), so the caller
 * can install it and re-apply the change.
 */
const applyObjectPropertyChange = ({
  project,
  resolvedScope,
  object,
  isGlobalObject,
  object_name,
  changedProperty,
  changes,
  warnings,
  missingLibraryResources,
}: {
  project: gdProject,
  resolvedScope: ResolvedScope,
  object: gdObject,
  isGlobalObject: boolean,
  object_name: string,
  changedProperty: Object,
  changes: Array<string>,
  warnings: Array<string>,
  missingLibraryResources?: Array<MissingLibraryResource>,
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

    const { layout, eventsBasedObject } = resolvedScope;
    if (eventsBasedObject && newValue === RESERVED_CHILD_OBJECT_NAME) {
      changes.push(
        `"${RESERVED_CHILD_OBJECT_NAME}" is a reserved child name: in the events of ${
          resolvedScope.label
        } it designates the custom object itself. Skipped.`
      );
      return;
    }
    const newName = withScopeObjectsContainersList(
      project,
      resolvedScope,
      objectsContainersList =>
        newNameGenerator(gd.Project.getSafeName(newValue), tentativeNewName =>
          objectsContainersList.hasObjectOrGroupNamed(tentativeNewName)
        )
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
    } else if (eventsBasedObject) {
      const { accessor, dispose } = makeScopeProjectScopedContainersAccessor(
        project,
        resolvedScope,
        null
      );
      try {
        gd.WholeProjectRefactorer.objectOrGroupRenamedInEventsBasedObject(
          project,
          accessor.get(),
          eventsBasedObject,
          object.getName(),
          newName,
          /* isObjectGroup=*/ false
        );
      } finally {
        dispose();
      }
    }

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
    const expectedResourceKind = (
      foundProperty.getExtraInfo().toJSArray()[0] || ''
    ).toLowerCase();

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
        const isLibraryResourceKind = libraryResourceKinds.includes(
          expectedResourceKind
        );
        // A library-kind resource with no close match in the project is a
        // request for a new resource: install it from the free library. When
        // close matches exist, an existing resource was likely intended, so
        // warn with the candidates instead of installing on a typo.
        if (
          isLibraryResourceKind &&
          closeResourceNames.length === 0 &&
          missingLibraryResources
        ) {
          missingLibraryResources.push({
            changedProperty,
            resourceName: sanitizedNewValue,
            resourceKind: expectedResourceKind,
          });
          return;
        }
        // Point to an import path that actually works for this resource kind:
        // fonts and audio files never ship with asset store objects, so
        // `create_or_replace_object` is a dead end for them.
        const importGuidanceText = isLibraryResourceKind
          ? `To install a new ${expectedResourceKind} from the free library instead, retry with a more specific name.`
          : `New resources cannot be added just by name; use \`create_or_replace_object\` to import assets from the asset store (preserving properties/behaviors/events).`;
        warnings.push(
          `"${foundPropertyName}" on "${object_name}" -> "${newValue}": resource "${sanitizedNewValue}" does not exist.${
            closeResourceNames.length > 0
              ? ` Did you mean: ${closeResourceNames
                  .map(resourceName => `"${resourceName}"`)
                  .join(', ')}?`
              : ''
          } ${importGuidanceText}`
        );
        return;
      }
    }
    const resource = project
      .getResourcesManager()
      .getResource(sanitizedNewValue);

    // Check the new resource is of the expected kind.
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
    const scene_name = getSceneNameFromArgs(args);
    const object_name = extractRequiredString(args, 'object_name');

    if (!scene_name) {
      const scopeLabel = getScopeLabelFromArgs(args);
      return {
        text: (
          <Trans>
            Read <b>{object_name}</b>'s properties in {scopeLabel}.
          </Trans>
        ),
      };
    }

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
    const object_name = extractRequiredString(args, 'object_name');

    const resolvedScope = resolveScopeFromArgs(project, args, {
      allowedTypes: OBJECTS_SCOPE_TYPES,
    });
    if (resolvedScope.success === false)
      return makeScopeFailureOutput(resolvedScope);

    const scopeObjects = getScopeObjectsContainer(resolvedScope);
    const globalObjects = resolvedScope.globalObjectsContainer;

    let object: gdObject | null = null;

    if (scopeObjects.hasObjectNamed(object_name)) {
      object = scopeObjects.getObject(object_name);
    } else if (globalObjects && globalObjects.hasObjectNamed(object_name)) {
      object = globalObjects.getObject(object_name);
    }

    if (!object) {
      return makeGenericFailure(
        `Object not found: "${object_name}" ${getObjectLookupScopeText(
          resolvedScope
        )}.`
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
      objectPropertiesDeduplicationKey: [
        resolvedScope.scope.type === 'scene'
          ? resolvedScope.scope.scene_name
          : resolvedScope.label,
        object_name,
      ]
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
    const scene_name = getSceneNameFromArgs(args);
    const object_name = extractRequiredString(args, 'object_name');

    const deleteThisObject = SafeExtractor.extractBooleanProperty(
      args,
      'delete_this_object'
    );
    if (!scene_name) {
      const scopeLabel = getScopeLabelFromArgs(args);
      return {
        text: deleteThisObject ? (
          <Trans>
            Remove object <b>{object_name}</b> (in {scopeLabel}).
          </Trans>
        ) : (
          <Trans>
            Update <b>{object_name}</b> (in {scopeLabel}).
          </Trans>
        ),
      };
    }
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
    toolsVersion,
    onObjectsModifiedOutsideEditor,
    onInstancesModifiedOutsideEditor,
    onWillDeleteObject,
    searchAndInstallResources,
  }) => {
    const object_name = extractRequiredString(args, 'object_name');
    const changed_properties =
      SafeExtractor.extractArrayProperty(args, 'changed_properties') || [];
    const changed_effects =
      SafeExtractor.extractArrayProperty(args, 'changed_effects') || [];

    const resolvedScope = resolveScopeFromArgs(project, args, {
      allowedTypes: OBJECTS_SCOPE_TYPES,
    });
    if (resolvedScope.success === false)
      return makeScopeFailureOutput(resolvedScope);
    const readOnlyRejection = getReadOnlyRejection(resolvedScope);
    if (readOnlyRejection) return makeScopeFailureOutput(readOnlyRejection);

    const { layout, eventsBasedObject } = resolvedScope;
    const scopeObjects = getScopeObjectsContainer(resolvedScope);
    const globalObjects = resolvedScope.globalObjectsContainer;

    let object: gdObject | null = null;
    let isGlobalObject = false;

    if (scopeObjects.hasObjectNamed(object_name)) {
      object = scopeObjects.getObject(object_name);
    } else if (globalObjects && globalObjects.hasObjectNamed(object_name)) {
      object = globalObjects.getObject(object_name);
      isGlobalObject = true;
    }

    if (!object) {
      return makeGenericFailure(
        `Object not found: "${object_name}" ${getObjectLookupScopeText(
          resolvedScope
        )}.`
      );
    }

    const deleteThisObject = SafeExtractor.extractBooleanProperty(
      args,
      'delete_this_object'
    );
    // Deleting a child object, or renaming it, changes the structure of the
    // custom object: only the default variant owns it.
    const isRenamingObject = changed_properties.some(changed_property => {
      const propertyName = SafeExtractor.extractStringProperty(
        changed_property,
        'property_name'
      );
      return !!propertyName && isPropertyForChangingObjectName(propertyName);
    });
    if (deleteThisObject || isRenamingObject) {
      const namedVariantRejection = getNamedVariantRejection(resolvedScope);
      if (namedVariantRejection)
        return makeScopeFailureOutput(namedVariantRejection);
    }

    if (deleteThisObject) {
      // Let editors close any dialog referring to this object BEFORE it's
      // actually removed, while it's still safe to read it.
      onWillDeleteObject({
        ...getOutsideEditorChangesTarget(resolvedScope),
        objectName: object_name,
      });

      if (isGlobalObject && globalObjects) {
        gd.WholeProjectRefactorer.globalObjectRemoved(project, object_name);
        globalObjects.removeObject(object_name);
      } else if (layout) {
        gd.WholeProjectRefactorer.objectRemovedInScene(
          project,
          layout,
          object_name
        );
        scopeObjects.removeObject(object_name);
      } else if (eventsBasedObject) {
        gd.WholeProjectRefactorer.objectRemovedInEventsBasedObject(
          project,
          eventsBasedObject,
          object_name
        );
        scopeObjects.removeObject(object_name);
        complyVariantsAfterStructuralEdit(project, resolvedScope);
      }

      // Refresh instances/objects lists AFTER the removal, so they reflect
      // the final state (the instances hot-reload payload in particular is
      // built synchronously from current data when this is called).
      onInstancesModifiedOutsideEditor({
        ...getOutsideEditorChangesTarget(resolvedScope),
      });
      onObjectsModifiedOutsideEditor({
        ...getOutsideEditorChangesTarget(resolvedScope),
        isNewObjectTypeUsed: false,
      });

      return makeGenericSuccess(`Deleted object "${object_name}".`);
    }

    const warnings: Array<string> = [];
    const changes: Array<string> = [];
    const missingLibraryResources: Array<MissingLibraryResource> = [];

    changed_properties.forEach(changed_property => {
      if (!object) return;
      applyObjectPropertyChange({
        project,
        resolvedScope,
        object,
        isGlobalObject,
        object_name,
        changedProperty: changed_property,
        changes,
        warnings,
        missingLibraryResources,
      });
    });
    if (isRenamingObject) {
      // The named variants inherit the children of the default one.
      complyVariantsAfterStructuralEdit(project, resolvedScope);
    }

    let newlyAddedResources = null;
    if (missingLibraryResources.length > 0) {
      const uniqueResources: Array<{
        resourceName: string,
        resourceKind: string,
      }> = [];
      for (const { resourceName, resourceKind } of missingLibraryResources) {
        if (
          !uniqueResources.some(
            uniqueResource =>
              uniqueResource.resourceName === resourceName &&
              uniqueResource.resourceKind === resourceKind
          )
        ) {
          uniqueResources.push({ resourceName, resourceKind });
        }
      }
      const { results } = await searchAndInstallResources({
        resources: uniqueResources,
      });
      newlyAddedResources = results.filter(
        result => result.status === 'resource-installed'
      );
      for (const installedResource of newlyAddedResources) {
        changes.push(
          `Installed ${installedResource.resourceKind} resource "${
            installedResource.resourceName
          }" from the free library.`
        );
      }
      for (const missingResource of missingLibraryResources) {
        const result = results.find(
          singleResult =>
            singleResult.resourceName === missingResource.resourceName &&
            singleResult.resourceKind === missingResource.resourceKind
        );
        if (result && result.status === 'resource-installed') {
          if (!object) continue;
          applyObjectPropertyChange({
            project,
            resolvedScope,
            object,
            isGlobalObject,
            object_name,
            changedProperty: missingResource.changedProperty,
            changes,
            warnings,
          });
        } else {
          warnings.push(
            `No ${missingResource.resourceKind} matching "${
              missingResource.resourceName
            }" found in the free library — the property was NOT changed.${
              missingResource.resourceKind === 'font'
                ? ' An empty "font" value is valid (the default font is used).'
                : ''
            } Retry with a more descriptive name if needed.`
          );
        }
      }
    }

    if (changed_effects.length > 0) {
      if (!object || !objectSupportsEffects(object)) {
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

    return {
      ...makeMultipleChangesOutput(changes, warnings, toolsVersion),
      ...(newlyAddedResources && newlyAddedResources.length > 0
        ? { newlyAddedResources }
        : {}),
    };
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
  objectsContainer,
  globalObjectsContainer,
  objectOrGroupName,
}: {|
  // The objects of the scope (a scene, the children of a custom object...).
  objectsContainer: gdObjectsContainer,
  // The global objects when visible from the scope (a scene), else null.
  globalObjectsContainer: gdObjectsContainer | null,
  objectOrGroupName: string,
|}): {|
  objects: Array<gdObject>,
  group: gdObjectGroup | null,
|} | null => {
  const object = getObjectByName(
    globalObjectsContainer,
    objectsContainer,
    objectOrGroupName
  );
  if (object) {
    return { objects: [object], group: null };
  }

  const scopeGroups = objectsContainer.getObjectGroups();
  const globalGroups = globalObjectsContainer
    ? globalObjectsContainer.getObjectGroups()
    : null;
  const group = scopeGroups.has(objectOrGroupName)
    ? scopeGroups.get(objectOrGroupName)
    : globalGroups && globalGroups.has(objectOrGroupName)
    ? globalGroups.get(objectOrGroupName)
    : null;
  if (group) {
    const objects = group
      .getAllObjectsNames()
      .toJSArray()
      .map(objectName =>
        getObjectByName(globalObjectsContainer, objectsContainer, objectName)
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
    const scene_name = getSceneNameFromArgs(args);
    const scopeLabel = getScopeLabelFromArgs(args);
    const object_name = extractRequiredString(args, 'object_name');
    const behavior_type = extractRequiredString(args, 'behavior_type');
    const optionalBehaviorName = SafeExtractor.extractStringProperty(
      args,
      'behavior_name'
    );

    // Must be declared before `makeText` is ever called: the early returns
    // below (no project, unknown behavior type) render it too.
    let behaviorName = optionalBehaviorName || behavior_type;

    const makeText = (behaviorTypeLabel: string) => {
      if (!scene_name) {
        return {
          text: (
            <Trans>
              Add {behaviorName} (<b>{behaviorTypeLabel}</b>) behavior to{' '}
              <b>{object_name}</b> in {scopeLabel}.
            </Trans>
          ),
        };
      }
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
    behaviorName = optionalBehaviorName || behaviorMetadata.getDefaultName();

    // $FlowFixMe[incompatible-type]
    return makeText(behaviorMetadata.getFullName());
  },
  launchFunction: async ({
    project,
    args,
    toolsVersion,
    ensureExtensionInstalled,
    ensureExtensionsUpToDate,
    onWillInstallExtension,
    onExtensionInstalled,
  }) => {
    const object_name = extractRequiredString(args, 'object_name');
    const behavior_type = extractRequiredString(args, 'behavior_type');
    const optionalBehaviorName = SafeExtractor.extractStringProperty(
      args,
      'behavior_name'
    );

    const resolvedScope = resolveScopeFromArgs(project, args, {
      allowedTypes: OBJECTS_SCOPE_TYPES,
    });
    if (resolvedScope.success === false)
      return makeScopeFailureOutput(resolvedScope);
    const readOnlyRejection = getReadOnlyRejection(resolvedScope);
    if (readOnlyRejection) return makeScopeFailureOutput(readOnlyRejection);
    // The behaviors of a child object are part of the structure of the custom
    // object: only the default variant owns them.
    const namedVariantRejection = getNamedVariantRejection(resolvedScope);
    if (namedVariantRejection)
      return makeScopeFailureOutput(namedVariantRejection);

    // `object_name` can designate an object or a group (in which case the
    // behavior is added to every object of the group).
    const concerned = resolveObjectsFromContextAndName({
      objectsContainer: getScopeObjectsContainer(resolvedScope),
      globalObjectsContainer: resolvedScope.globalObjectsContainer || null,
      objectOrGroupName: object_name,
    });
    if (!concerned) {
      return makeGenericFailure(
        `Object or group not found: "${object_name}" ${getObjectLookupScopeText(
          resolvedScope
        )}.`
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

    // A behavior of an extension of the project may have just been authored:
    // its metadata only exists once the extensions are regenerated.
    if (isTypeOfProjectExtension(project, behavior_type)) {
      await ensureExtensionsUpToDate();
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
    // The behavior NAME the editor assigned, per object: a script cannot guess
    // it (there is no argument to impose one) and needs it to call the behavior
    // functions afterwards. Reported as a declared output type, so a script does
    // not have to read it back with `inspect_object_properties_effects`.
    const addedBehaviors: Array<{|
      objectName: string,
      behaviorName: string,
      behaviorType: string,
    |}> = [];
    const reportBehaviorOnObject = (objectName: string) => {
      addedBehaviors.push({
        objectName,
        behaviorName,
        behaviorType: behavior_type,
      });
    };
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
          // Already there: a script chaining on the name must still get it.
          reportBehaviorOnObject(objectName);
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
          reportBehaviorOnObject(objectName);
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
      reportBehaviorOnObject(objectName);
    }
    updateBehaviorsSharedDataInScope(project, resolvedScope);
    // The named variants inherit the behaviors of the default one.
    complyVariantsAfterStructuralEdit(project, resolvedScope);

    return {
      ...makeMultipleChangesOutput(changes, warnings, toolsVersion),
      addedBehaviors,
    };
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
    const scene_name = getSceneNameFromArgs(args);
    const object_name = extractRequiredString(args, 'object_name');
    const behavior_name = extractRequiredString(args, 'behavior_name');

    if (!scene_name) {
      const scopeLabel = getScopeLabelFromArgs(args);
      return {
        text: (
          <Trans>
            Remove <b>{behavior_name}</b> behavior from <b>{object_name}</b> in{' '}
            {scopeLabel}.
          </Trans>
        ),
      };
    }

    return {
      text: (
        <Trans>
          Remove <b>{behavior_name}</b> behavior from <b>{object_name}</b> in
          scene {scene_name}.
        </Trans>
      ),
    };
  },
  launchFunction: async ({ project, args, toolsVersion }) => {
    const object_name = extractRequiredString(args, 'object_name');
    const behavior_name = extractRequiredString(args, 'behavior_name');

    const resolvedScope = resolveScopeFromArgs(project, args, {
      allowedTypes: OBJECTS_SCOPE_TYPES,
    });
    if (resolvedScope.success === false)
      return makeScopeFailureOutput(resolvedScope);
    const readOnlyRejection = getReadOnlyRejection(resolvedScope);
    if (readOnlyRejection) return makeScopeFailureOutput(readOnlyRejection);
    // The behaviors of a child object are part of the structure of the custom
    // object: only the default variant owns them.
    const namedVariantRejection = getNamedVariantRejection(resolvedScope);
    if (namedVariantRejection)
      return makeScopeFailureOutput(namedVariantRejection);

    // `object_name` can designate an object or a group (in which case the
    // behavior is removed from every object of the group that has it).
    const concerned = resolveObjectsFromContextAndName({
      objectsContainer: getScopeObjectsContainer(resolvedScope),
      globalObjectsContainer: resolvedScope.globalObjectsContainer || null,
      objectOrGroupName: object_name,
    });
    if (!concerned) {
      return makeGenericFailure(
        `Object or group not found: "${object_name}" ${getObjectLookupScopeText(
          resolvedScope
        )}.`
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
    // The named variants inherit the behaviors of the default one.
    complyVariantsAfterStructuralEdit(project, resolvedScope);

    return makeMultipleChangesOutput(changes, warnings, toolsVersion);
  },
  modifiesProject: true,
};

/**
 * Retrieves the properties of a specific behavior attached to an object (or to
 * the objects of a group).
 */
const inspectBehaviorProperties: EditorFunction = {
  renderForEditor: ({ args }) => {
    const scene_name = getSceneNameFromArgs(args);
    const object_name = extractRequiredString(args, 'object_name');
    const behavior_name = extractRequiredString(args, 'behavior_name');

    if (!scene_name) {
      const scopeLabel = getScopeLabelFromArgs(args);
      return {
        text: (
          <Trans>
            Read <b>{behavior_name}</b>'s settings on <b>{object_name}</b> in{' '}
            {scopeLabel}.
          </Trans>
        ),
      };
    }

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
    const object_name = extractRequiredString(args, 'object_name');
    const behavior_name = extractRequiredString(args, 'behavior_name');

    const resolvedScope = resolveScopeFromArgs(project, args, {
      allowedTypes: OBJECTS_SCOPE_TYPES,
    });
    if (resolvedScope.success === false)
      return makeScopeFailureOutput(resolvedScope);
    const { layout } = resolvedScope;

    // `object_name` can designate an object or a group. For a group, the
    // behavior is shared in common by all its objects, so any of them can be
    // inspected: use the first object that has the behavior.
    const concerned = resolveObjectsFromContextAndName({
      objectsContainer: getScopeObjectsContainer(resolvedScope),
      globalObjectsContainer: resolvedScope.globalObjectsContainer || null,
      objectOrGroupName: object_name,
    });
    if (!concerned) {
      return makeGenericFailure(
        `Object or group not found: "${object_name}" ${getObjectLookupScopeText(
          resolvedScope
        )}.`
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

    // Behavior shared data only exists in a scene: a child of a custom object
    // uses the shared data of the scene where the object is instantiated.
    const allBehaviorSharedDataNames = layout
      ? layout.getAllBehaviorSharedDataNames().toJSArray()
      : [];

    let sharedProperties: Array<{}> | void = undefined;
    if (layout && allBehaviorSharedDataNames.includes(behavior_name)) {
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

    const hasNoPropertyAtAll =
      properties.length === 0 &&
      (!sharedProperties || sharedProperties.length === 0);

    return {
      success: true,
      behaviorName: behavior_name,
      properties: properties,
      sharedProperties,
      message: hasNoPropertyAtAll ? noEditablePropertiesText : undefined,
    };
  },
  modifiesProject: false,
};

/**
 * Changes a property of a specific behavior attached to an object
 */
const changeBehaviorProperty: EditorFunction = {
  renderForEditor: ({ project, shouldShowDetails, args, editorCallbacks }) => {
    const scene_name = getSceneNameFromArgs(args);
    const object_name = extractRequiredString(args, 'object_name');
    const behavior_name = extractRequiredString(args, 'behavior_name');

    const deleteThisBehavior = SafeExtractor.extractBooleanProperty(
      args,
      'delete_this_behavior'
    );
    const changed_properties =
      SafeExtractor.extractArrayProperty(args, 'changed_properties') || [];

    if (!scene_name) {
      const scopeLabel = getScopeLabelFromArgs(args);
      return {
        text: deleteThisBehavior ? (
          <Trans>
            Remove <b>{behavior_name}</b> behavior from <b>{object_name}</b> in{' '}
            {scopeLabel}.
          </Trans>
        ) : (
          <Trans>
            Update {changed_properties.length} settings of behavior{' '}
            {behavior_name} on object {object_name} (in {scopeLabel}).
          </Trans>
        ),
      };
    }

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
      objectsContainer: layout.getObjects(),
      globalObjectsContainer: project.getObjects(),
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
  launchFunction: async ({ project, args, toolsVersion }) => {
    const object_name = extractRequiredString(args, 'object_name');
    const behavior_name = extractRequiredString(args, 'behavior_name');
    const changedProperties =
      SafeExtractor.extractArrayProperty(args, 'changed_properties') || [];

    const resolvedScope = resolveScopeFromArgs(project, args, {
      allowedTypes: OBJECTS_SCOPE_TYPES,
    });
    if (resolvedScope.success === false)
      return makeScopeFailureOutput(resolvedScope);
    const readOnlyRejection = getReadOnlyRejection(resolvedScope);
    if (readOnlyRejection) return makeScopeFailureOutput(readOnlyRejection);
    const { layout } = resolvedScope;

    // `object_name` can designate an object or a group (in which case the
    // property is changed on the behavior of every object of the group).
    const concerned = resolveObjectsFromContextAndName({
      objectsContainer: getScopeObjectsContainer(resolvedScope),
      globalObjectsContainer: resolvedScope.globalObjectsContainer || null,
      objectOrGroupName: object_name,
    });
    if (!concerned) {
      return makeGenericFailure(
        `Object or group not found: "${object_name}" ${getObjectLookupScopeText(
          resolvedScope
        )}.`
      );
    }

    const deleteThisBehavior = SafeExtractor.extractBooleanProperty(
      args,
      'delete_this_behavior'
    );
    if (deleteThisBehavior) {
      // Removing a behavior of a child object changes the structure of the
      // custom object: only the default variant owns it.
      const namedVariantRejection = getNamedVariantRejection(resolvedScope);
      if (namedVariantRejection)
        return makeScopeFailureOutput(namedVariantRejection);

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
      // The named variants inherit the behaviors of the default one.
      complyVariantsAfterStructuralEdit(project, resolvedScope);

      return makeMultipleChangesOutput(changes, warnings, toolsVersion);
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

    // Behavior shared data only exists in a scene: a child of a custom object
    // uses the shared data of the scene where the object is instantiated.
    const allBehaviorSharedDataNames = layout
      ? layout.getAllBehaviorSharedDataNames().toJSArray()
      : [];

    let behaviorSharedData = null;
    let behaviorSharedDataProperties = null;
    if (layout && allBehaviorSharedDataNames.includes(behavior_name)) {
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
          newProperties: behaviorSharedData.getProperties(),
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
          )}${
            layout
              ? ''
              : ' Shared properties are per scene: change them in a scene using this object.'
          }`
        );
      }
    });

    // $FlowFixMe[incompatible-type]
    return makeMultipleChangesOutput(changes, warnings, toolsVersion);
  },
  modifiesProject: true,
};

// The scopes holding instances: a scene, the instances of an external layout
// (with the objects and layers of its associated scene) or a variant of a
// custom object (its children).
const INSTANCES_SCOPE_TYPES: Array<ToolScopeType> = [
  'scene',
  'external_layout',
  'custom_object_variant',
];

/**
 * The containers `describe_instances` and `put_*_instances` work on. A scope
 * of `INSTANCES_SCOPE_TYPES` always resolves to all of them.
 */
const getInstancesScopeContainers = (
  resolvedScope: ResolvedScope
): {|
  objectsContainer: gdObjectsContainer,
  globalObjectsContainer: gdObjectsContainer | null,
  initialInstances: gdInitialInstancesContainer,
  layersContainer: gdLayersContainer,
|} | null => {
  const {
    objectsContainer,
    globalObjectsContainer,
    initialInstances,
    layersContainer,
  } = resolvedScope;
  if (!objectsContainer || !initialInstances || !layersContainer) return null;
  return {
    objectsContainer,
    globalObjectsContainer: globalObjectsContainer || null,
    initialInstances,
    layersContainer,
  };
};

/** The instance position explanations to give for a scope. */
const getPositionSemanticsForScope = (resolvedScope: ResolvedScope): string =>
  resolvedScope.variant
    ? CUSTOM_OBJECT_INSTANCE_POSITION_SEMANTICS_MESSAGE
    : INSTANCE_POSITION_SEMANTICS_MESSAGE;

/**
 * The output fields telling which container the instances belong to: a scene
 * (unchanged), an external layout (its instances, on its associated scene) or
 * a variant of a custom object (which has no scene at all).
 */
const getInstancesScopeOutputFields = (
  resolvedScope: ResolvedScope
): {|
  instancesForSceneNamed?: string,
  instancesForExternalLayoutNamed?: string,
  instancesForScopeLabel?: string,
|} => {
  const { layout, externalLayout } = resolvedScope;
  if (externalLayout) {
    return {
      instancesForSceneNamed: layout ? layout.getName() : '',
      instancesForExternalLayoutNamed: externalLayout.getName(),
    };
  }
  if (layout) return { instancesForSceneNamed: layout.getName() };
  return { instancesForScopeLabel: resolvedScope.label };
};

const describeInstances: EditorFunction = {
  renderForEditor: ({ args, editorCallbacks }) => {
    const scene_name = getSceneNameFromArgs(args);
    if (!scene_name) {
      return {
        text: <Trans>Read instances in {getScopeLabelFromArgs(args)}.</Trans>,
      };
    }

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
    const resolvedScope = resolveScopeFromArgs(project, args, {
      allowedTypes: INSTANCES_SCOPE_TYPES,
    });
    if (resolvedScope.success === false)
      return makeScopeFailureOutput(resolvedScope);
    const containers = getInstancesScopeContainers(resolvedScope);
    if (!containers)
      return makeGenericFailure(
        `${resolvedScope.label} has no instances to describe.`
      );
    const {
      objectsContainer,
      globalObjectsContainer,
      initialInstances,
      layersContainer,
    } = containers;

    const filter_by_object_name =
      SafeExtractor.extractStringProperty(args, 'filter_by_object_name') || '';

    const objectNames = new Set(
      filter_by_object_name
        .split(',')
        .map(name => name.trim().toLowerCase())
        .filter(Boolean)
    );

    const instances = [];
    const objectSizeInfoByName: { [string]: ObjectSizeInfo | null } = {};

    // For each layer
    mapFor(0, layersContainer.getLayersCount(), i => {
      const layer = layersContainer.getLayerAt(i);
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
          const object = getObjectByName(
            globalObjectsContainer,
            objectsContainer,
            objectName
          );

          const sizeInfo = object
            ? getObjectSizeInfo(object, project, PixiResourcesLoader)
            : null;
          if (object && !(objectName in objectSizeInfoByName)) {
            objectSizeInfoByName[objectName] = sizeInfo;
          }

          const defaultSize = object
            ? sizeInfo
            : { width: 0, height: 0, depth: 0 };

          instances.push(getSimplifiedInstance(instance, defaultSize));
        }
      );
    });

    const result: EditorFunctionGenericOutput = {
      success: true,
      instances: instances,
      ...getInstancesScopeOutputFields(resolvedScope),
      positionSemantics: getPositionSemanticsForScope(resolvedScope),
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

// An id pointing at another object's instance is always a targeting mistake:
// fail loudly instead of silently modifying or erasing the wrong object.
const makeWrongObjectInstanceIdsFailure = (
  objectName: string,
  wrongObjectIdDescriptions: Array<string>
): EditorFunctionGenericOutput =>
  makeGenericFailure(
    `These \`existing_instance_ids\` do not belong to object "${objectName}": ${wrongObjectIdDescriptions.join(
      ', '
    )}. Nothing was changed. Pass ids of "${objectName}" instances (from \`describe_instances\`), fix \`object_name\`, or omit \`object_name\` to target these instances.`
  );

/**
 * Places new instance(s), or move/erase existing instances, of an existing object onto a specified 2D layer
 * within a scene using a virtual brush at given X, Y coordinates.
 * Can also be used to resize, rotate, change opacity or Z order of existing 2D instance(s).
 * Existing instances identifiers can be found by calling `describe_instances` (`id` field for each instance).
 */
const put2dInstances: EditorFunction = {
  renderForEditor: ({ args }) => {
    const scene_name = getSceneNameFromArgs(args);
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
      ? existing_instance_ids
          .split(',')
          .map(id => id.trim())
          .filter(Boolean)
      : [];
    const new_instances_count = SafeExtractor.extractNumberProperty(
      args,
      'new_instances_count'
    );
    const newInstancesCount =
      new_instances_count === null && existingInstanceIds.length === 0
        ? 1
        : new_instances_count;

    const existingInstanceCount = existingInstanceIds.length;
    const brushPosition = SafeExtractor.parseCommaSeparatedTwoFiniteNumbers(
      brush_position
    );

    if (!scene_name) {
      const scopeLabel = getScopeLabelFromArgs(args);
      return {
        text:
          brush_kind === 'erase' ? (
            <Trans>
              Erase {existingInstanceCount} instance(s) in {scopeLabel}.
            </Trans>
          ) : (
            <Trans>
              Place {newInstancesCount} and move {existingInstanceCount}{' '}
              <b>{object_name}</b> instance(s) (layer: {layer_name || 'base'})
              in {scopeLabel}.
            </Trans>
          ),
      };
    }

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
    toolsVersion,
    onInstancesModifiedOutsideEditor,
    PixiResourcesLoader,
  }) => {
    const object_name = SafeExtractor.extractStringProperty(
      args,
      'object_name'
    );
    const layer_name = extractRequiredString(args, 'layer_name');
    const requested_brush_kind = extractRequiredString(args, 'brush_kind');
    const brush_position = SafeExtractor.extractStringProperty(
      args,
      'brush_position'
    );
    const existing_instance_ids = SafeExtractor.extractStringProperty(
      args,
      'existing_instance_ids'
    );
    // A "none" brush with both a `brush_position` and `existing_instance_ids`
    // is contradictory ("none" never positions anything) but unambiguous: move
    // THOSE instances there. Read it as the "point" brush, which is what the
    // failure this replaces told the caller to do — every such call observed in
    // production meant exactly that. Without `existing_instance_ids` the intent
    // is genuinely unclear (create one? move all?), so that still fails.
    const brush_kind =
      requested_brush_kind === 'none' && brush_position && existing_instance_ids
        ? 'point'
        : requested_brush_kind;
    const brush_size = SafeExtractor.extractNumberProperty(args, 'brush_size');
    const brush_end_position = SafeExtractor.extractStringProperty(
      args,
      'brush_end_position'
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

    const resolvedScope = resolveScopeFromArgs(project, args, {
      allowedTypes: INSTANCES_SCOPE_TYPES,
    });
    if (resolvedScope.success === false)
      return makeScopeFailureOutput(resolvedScope);
    const readOnlyRejection = getReadOnlyRejection(resolvedScope);
    if (readOnlyRejection) return makeScopeFailureOutput(readOnlyRejection);
    const containers = getInstancesScopeContainers(resolvedScope);
    if (!containers)
      return makeGenericFailure(
        `${resolvedScope.label} has no instances to change.`
      );
    const {
      objectsContainer,
      globalObjectsContainer,
      initialInstances,
      layersContainer,
    } = containers;

    const namedObject: gdObject | null =
      (object_name &&
        getObjectByName(
          globalObjectsContainer,
          objectsContainer,
          object_name
        )) ||
      null;
    const objectSizeInfo = namedObject
      ? getObjectSizeInfo(namedObject, project, PixiResourcesLoader)
      : null;

    // Accept the frequent mistake of calling the base layer "base" (its real
    // name is the empty string) when no layer with that literal name exists.
    const layerName =
      layer_name !== '' &&
      layer_name.trim().toLowerCase() === 'base' &&
      !layersContainer.hasLayerNamed(layer_name)
        ? ''
        : layer_name;

    // Check if layer exists (empty string is allowed for base layer)
    if (layerName !== '' && !layersContainer.hasLayerNamed(layerName)) {
      return makeGenericFailure(
        `Layer not found: ${layerName} in ${resolvedScope.label}.`
      );
    }

    // An empty id would match every instance (`uuid.startsWith('')` is always
    // true), so a trailing comma or a blank entry must never survive parsing.
    const existingInstanceIds = existing_instance_ids
      ? existing_instance_ids
          .split(',')
          .map(id => id.trim())
          .filter(Boolean)
      : [];

    if (brush_kind === 'erase') {
      const brushPosition = SafeExtractor.parseCommaSeparatedTwoFiniteNumbers(
        brush_position
      );
      const brushSize = brush_size || 0;

      // Iterate on existing instances and remove them, and/or those inside the brush radius.
      const instancesToDelete = new Set<gdInitialInstance>();
      const notFoundExistingInstanceIds = new Set<string>(existingInstanceIds);
      const wrongObjectIdDescriptions = [];

      iterateOnInstances(initialInstances, instance => {
        const foundExistingInstanceId = existingInstanceIds.find(id =>
          instance.getPersistentUuid().startsWith(id)
        );
        if (foundExistingInstanceId) {
          notFoundExistingInstanceIds.delete(foundExistingInstanceId);
          if (object_name && instance.getObjectName() !== object_name) {
            wrongObjectIdDescriptions.push(
              `"${foundExistingInstanceId}" (instance of "${instance.getObjectName()}")`
            );
            return;
          }
          instancesToDelete.add(instance);
          return;
        }

        // Explicit ids are authoritative: the brush must not widen the erase
        // to other instances (e.g. a co-located duplicate the ids single out).
        if (existingInstanceIds.length > 0) return;

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

      if (object_name && wrongObjectIdDescriptions.length > 0) {
        return makeWrongObjectInstanceIdsFailure(
          object_name,
          wrongObjectIdDescriptions
        );
      }

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

      const erasedInstanceIds = [];
      instancesToDelete.forEach(instance => {
        erasedInstanceIds.push(instance.getPersistentUuid().slice(0, 10));
        initialInstances.removeInstance(instance);
      });

      // /!\ Tell the editor that some instances have potentially been modified (and even removed).
      // This will force the instances editor to destroy and mount again the
      // renderers to avoid keeping any references to existing instances, and also drop any selection.
      onInstancesModifiedOutsideEditor({
        ...getOutsideEditorChangesTarget(resolvedScope),
      });
      const eraseResult: EditorFunctionGenericOutput = {
        success: true,
        message: [
          `Erased ${instancesToDelete.size} instance${
            instancesToDelete.size > 1 ? 's' : ''
          } (id${
            erasedInstanceIds.length > 1 ? 's' : ''
          }: ${erasedInstanceIds.join(', ')}).`,
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

      // A fractional count would create one instance more than reported (the
      // creation loop runs `Math.ceil` times), and a negative one is always a
      // mistake: normalize to a whole number, and reject negatives.
      if (new_instances_count !== null && new_instances_count < 0) {
        return makeGenericFailure(
          `\`new_instances_count\` must be 0 or a positive integer (got ${new_instances_count}).`
        );
      }
      let newInstancesCount =
        new_instances_count !== null ? Math.round(new_instances_count) : 0;
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

      // Without a positive radius, the "random" brush would silently stack
      // every instance at the exact brush position.
      if (brush_kind === 'random_in_circle' && brushSize <= 0) {
        return makeGenericFailure(
          'The "random_in_circle" brush requires a positive `brush_size` (the radius of the circle). Provide it, or use the "point" brush to place instances at a single position.'
        );
      }
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

      // Creating instances without an object is impossible: an instance whose
      // object name is empty would be a corrupted, invisible orphan.
      if (newInstancesCount > 0 && !object_name) {
        return makeGenericFailure(
          `Cannot create ${newInstancesCount} new instance(s) without \`object_name\`. Nothing was changed. Pass \`object_name\` (an existing object of the scene), or only \`existing_instance_ids\` (with \`new_instances_count\` set to 0) to modify existing instances.`
        );
      }

      if (object_name && !namedObject) {
        return makeGenericFailure(
          `Object "${object_name}" not in ${
            resolvedScope.label
          }. Use only existing objects (create them first if needed).`
        );
      }

      // Store original states of existing instances for comparison
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const existingInstanceStates = new Map();
      const notFoundExistingInstanceIds = new Set<string>(existingInstanceIds);
      const wrongObjectIdDescriptions = [];

      // Create the array of existing instances to move/modify, and new instances to create.
      const modifiedAndCreatedInstances: Array<gdInitialInstance> = [];
      iterateOnInstances(initialInstances, instance => {
        const foundExistingInstanceId = existingInstanceIds.find(id =>
          instance.getPersistentUuid().startsWith(id)
        );

        if (foundExistingInstanceId) {
          notFoundExistingInstanceIds.delete(foundExistingInstanceId);
          if (object_name && instance.getObjectName() !== object_name) {
            wrongObjectIdDescriptions.push(
              `"${foundExistingInstanceId}" (instance of "${instance.getObjectName()}")`
            );
            return;
          }

          // Store original state before modifications
          existingInstanceStates.set(instance, {
            originalLayer: instance.getLayer(),
            originalX: instance.getX(),
            originalY: instance.getY(),
            originalZOrder: instance.getZOrder(),
            originalRotation: instance.getAngle(),
            originalOpacity: instance.getOpacity(),
            originalHidden: instance.isHidden(),
            originalCustomWidth: instance.hasCustomSize()
              ? instance.getCustomWidth()
              : null,
            originalCustomHeight: instance.hasCustomSize()
              ? instance.getCustomHeight()
              : null,
          });

          modifiedAndCreatedInstances.push(instance);
        }
      });

      if (object_name && wrongObjectIdDescriptions.length > 0) {
        return makeWrongObjectInstanceIdsFailure(
          object_name,
          wrongObjectIdDescriptions
        );
      }

      // Move existing instances to the target layer only after the wrong-ids
      // guard: a failed call must leave every instance untouched.
      modifiedAndCreatedInstances.forEach(instance => {
        if (instance.getLayer() !== layerName) {
          instance.setLayer(layerName);
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
      const instancesHidden = SafeExtractor.extractBooleanProperty(
        args,
        'instances_hidden'
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
        if (instancesHidden !== null) {
          instance.setHidden(instancesHidden);
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
        if (instancesHidden !== null)
          attrs.push(instancesHidden ? 'hidden at start' : 'visible at start');
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
      let hiddenChangedCount = 0;
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
          instancesHidden !== null &&
          originalState.originalHidden !== instance.isHidden()
        ) {
          hiddenChangedCount++;
        }
        if (
          instances_z_order !== null &&
          originalState.originalZOrder !== instance.getZOrder()
        ) {
          zOrderChangedCount++;
        }
      });

      // Name the modified object(s) in messages so a wrongly targeted call is
      // visible in the result.
      const modifiedObjectNames = new Set<string>();
      existingInstanceStates.forEach((originalState, instance) => {
        modifiedObjectNames.add(instance.getObjectName());
      });
      const ofObjectsSuffix =
        modifiedObjectNames.size > 0
          ? ` of ${Array.from(modifiedObjectNames)
              .map(name => `"${name}"`)
              .join(', ')}`
          : '';

      if (movedToLayerCount > 0) {
        changes.push(
          `Moved ${movedToLayerCount} instance${
            movedToLayerCount > 1 ? 's' : ''
          }${ofObjectsSuffix} to ${getLayerNameForMessage(layerName)}.`
        );
      }

      if (movedPositionCount > 0) {
        changes.push(
          `Repositioned ${movedPositionCount} instance${
            movedPositionCount > 1 ? 's' : ''
          }${ofObjectsSuffix} using ${brush_kind} brush.`
        );
      }

      if (resizedCount > 0 && instancesSize) {
        changes.push(
          `Resized ${resizedCount} instance${
            resizedCount > 1 ? 's' : ''
          }${ofObjectsSuffix} to ${instancesSize[0]}x${instancesSize[1]}.`
        );
      }

      if (rotatedCount > 0 && instancesRotation !== null) {
        changes.push(
          `Rotated ${rotatedCount} instance${
            rotatedCount > 1 ? 's' : ''
          }${ofObjectsSuffix} to ${instancesRotation}°.`
        );
      }

      if (opacityChangedCount > 0 && instancesOpacity !== null) {
        changes.push(
          `Changed opacity of ${opacityChangedCount} instance${
            opacityChangedCount > 1 ? 's' : ''
          }${ofObjectsSuffix} to ${instancesOpacity}/255.`
        );
      }

      if (hiddenChangedCount > 0 && instancesHidden !== null) {
        changes.push(
          instancesHidden
            ? `Marked ${hiddenChangedCount} instance${
                hiddenChangedCount > 1 ? 's' : ''
              }${ofObjectsSuffix} as hidden at start (they can be displayed with the "Show" action).`
            : `Marked ${hiddenChangedCount} instance${
                hiddenChangedCount > 1 ? 's' : ''
              }${ofObjectsSuffix} as visible at start.`
        );
      }

      if (zOrderChangedCount > 0 && instances_z_order !== null) {
        changes.push(
          `Changed Z-order of ${zOrderChangedCount} instance${
            zOrderChangedCount > 1 ? 's' : ''
          }${ofObjectsSuffix} to ${instances_z_order}.`
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
          instancesHidden !== null ||
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
          const noRequestMessage = `Matched ${matchedCount} existing instance${
            matchedCount > 1 ? 's' : ''
          } but no change was requested — provide a value to modify, or use the "point" brush with \`brush_position\` to move.`;
          if (isNoOpConsideredSuccess(toolsVersion)) {
            return {
              success: true,
              message: noRequestMessage,
              nothingChanged: true,
            };
          }
          return makeGenericFailure(noRequestMessage);
        }

        const noOpMessage = `Matched ${matchedCount} existing instance${
          matchedCount > 1 ? 's' : ''
        } but the requested values are identical to their current ones, so nothing changed.${
          hasPositionBrush
            ? ''
            : ' To move instances, use the "point" brush with `brush_position` (the "none" brush never changes position).'
        }`;
        // A no-op (requested state == current state) is a SUCCESS from v12: a
        // script stops at the first failure, so re-running an idempotent call
        // must not kill it. Pre-v12 keeps the failure (useful tool-call
        // feedback; shipped behavior unchanged). See isNoOpConsideredSuccess.
        if (isNoOpConsideredSuccess(toolsVersion)) {
          return {
            success: true,
            message: noOpMessage,
            nothingChanged: true,
          };
        }
        return makeGenericFailure(noOpMessage);
      }

      // /!\ Tell the editor that some instances have potentially been modified (and even removed).
      // This will force the instances editor to destroy and mount again the
      // renderers to avoid keeping any references to existing instances, and also drop any selection.
      onInstancesModifiedOutsideEditor({
        ...getOutsideEditorChangesTarget(resolvedScope),
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
    const scene_name = getSceneNameFromArgs(args);
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
      ? existing_instance_ids
          .split(',')
          .map(id => id.trim())
          .filter(Boolean)
      : [];
    const new_instances_count = SafeExtractor.extractNumberProperty(
      args,
      'new_instances_count'
    );
    const newInstancesCount =
      new_instances_count === null && existingInstanceIds.length === 0
        ? 1
        : new_instances_count;

    const existingInstanceCount = existingInstanceIds.length;
    const brushPosition = SafeExtractor.parseCommaSeparatedThreeFiniteNumbers(
      brush_position
    );

    if (!scene_name) {
      const scopeLabel = getScopeLabelFromArgs(args);
      return {
        text:
          brush_kind === 'erase' ? (
            <Trans>
              Erase {existingInstanceCount} instance(s) in {scopeLabel}.
            </Trans>
          ) : (
            <Trans>
              Place {newInstancesCount} and move {existingInstanceCount}{' '}
              <b>{object_name}</b> instance(s) (layer: {layer_name || 'base'})
              in {scopeLabel}.
            </Trans>
          ),
      };
    }

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
    toolsVersion,
    onInstancesModifiedOutsideEditor,
    PixiResourcesLoader,
  }) => {
    const object_name = SafeExtractor.extractStringProperty(
      args,
      'object_name'
    );
    const layer_name = extractRequiredString(args, 'layer_name');
    const requested_brush_kind = extractRequiredString(args, 'brush_kind');
    const brush_position = SafeExtractor.extractStringProperty(
      args,
      'brush_position'
    );
    const existing_instance_ids = SafeExtractor.extractStringProperty(
      args,
      'existing_instance_ids'
    );
    // A "none" brush with both a `brush_position` and `existing_instance_ids`
    // is contradictory ("none" never positions anything) but unambiguous: move
    // THOSE instances there. Read it as the "point" brush, which is what the
    // failure this replaces told the caller to do — every such call observed in
    // production meant exactly that. Without `existing_instance_ids` the intent
    // is genuinely unclear (create one? move all?), so that still fails.
    const brush_kind =
      requested_brush_kind === 'none' && brush_position && existing_instance_ids
        ? 'point'
        : requested_brush_kind;
    const brush_size = SafeExtractor.extractNumberProperty(args, 'brush_size');
    const brush_end_position = SafeExtractor.extractStringProperty(
      args,
      'brush_end_position'
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

    const resolvedScope = resolveScopeFromArgs(project, args, {
      allowedTypes: INSTANCES_SCOPE_TYPES,
    });
    if (resolvedScope.success === false)
      return makeScopeFailureOutput(resolvedScope);
    const readOnlyRejection = getReadOnlyRejection(resolvedScope);
    if (readOnlyRejection) return makeScopeFailureOutput(readOnlyRejection);
    const containers = getInstancesScopeContainers(resolvedScope);
    if (!containers)
      return makeGenericFailure(
        `${resolvedScope.label} has no instances to change.`
      );
    const {
      objectsContainer,
      globalObjectsContainer,
      initialInstances,
      layersContainer,
    } = containers;

    const namedObject: gdObject | null =
      (object_name &&
        getObjectByName(
          globalObjectsContainer,
          objectsContainer,
          object_name
        )) ||
      null;
    const objectSizeInfo = namedObject
      ? getObjectSizeInfo(namedObject, project, PixiResourcesLoader)
      : null;

    // Accept the frequent mistake of calling the base layer "base" (its real
    // name is the empty string) when no layer with that literal name exists.
    const layerName =
      layer_name !== '' &&
      layer_name.trim().toLowerCase() === 'base' &&
      !layersContainer.hasLayerNamed(layer_name)
        ? ''
        : layer_name;

    // Check if layer exists (empty string is allowed for base layer)
    if (layerName !== '' && !layersContainer.hasLayerNamed(layerName)) {
      return makeGenericFailure(
        `Layer not found: ${layerName} in ${resolvedScope.label}.`
      );
    }

    // An empty id would match every instance (`uuid.startsWith('')` is always
    // true), so a trailing comma or a blank entry must never survive parsing.
    const existingInstanceIds = existing_instance_ids
      ? existing_instance_ids
          .split(',')
          .map(id => id.trim())
          .filter(Boolean)
      : [];

    if (brush_kind === 'erase') {
      const brushPosition = SafeExtractor.parseCommaSeparatedThreeFiniteNumbers(
        brush_position
      );
      const brushSize = brush_size || 0;

      // Iterate on existing instances and remove them, and/or those inside the brush radius.
      const instancesToDelete = new Set<gdInitialInstance>();
      const notFoundExistingInstanceIds = new Set<string>(existingInstanceIds);
      const wrongObjectIdDescriptions = [];

      iterateOnInstances(initialInstances, instance => {
        const foundExistingInstanceId = existingInstanceIds.find(id =>
          instance.getPersistentUuid().startsWith(id)
        );
        if (foundExistingInstanceId) {
          notFoundExistingInstanceIds.delete(foundExistingInstanceId);
          if (object_name && instance.getObjectName() !== object_name) {
            wrongObjectIdDescriptions.push(
              `"${foundExistingInstanceId}" (instance of "${instance.getObjectName()}")`
            );
            return;
          }
          instancesToDelete.add(instance);
          return;
        }

        // Explicit ids are authoritative: the brush must not widen the erase
        // to other instances (e.g. a co-located duplicate the ids single out).
        if (existingInstanceIds.length > 0) return;

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

      if (object_name && wrongObjectIdDescriptions.length > 0) {
        return makeWrongObjectInstanceIdsFailure(
          object_name,
          wrongObjectIdDescriptions
        );
      }

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

      const erasedInstanceIds = [];
      instancesToDelete.forEach(instance => {
        erasedInstanceIds.push(instance.getPersistentUuid().slice(0, 10));
        initialInstances.removeInstance(instance);
      });

      // /!\ Tell the editor that some instances have potentially been modified (and even removed).
      // This will force the instances editor to destroy and mount again the
      // renderers to avoid keeping any references to existing instances, and also drop any selection.
      onInstancesModifiedOutsideEditor({
        ...getOutsideEditorChangesTarget(resolvedScope),
      });
      const eraseResult: EditorFunctionGenericOutput = {
        success: true,
        message: [
          `Erased ${instancesToDelete.size} instance${
            instancesToDelete.size > 1 ? 's' : ''
          } (id${
            erasedInstanceIds.length > 1 ? 's' : ''
          }: ${erasedInstanceIds.join(', ')}).`,
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

      // A fractional count would create one instance more than reported (the
      // creation loop runs `Math.ceil` times), and a negative one is always a
      // mistake: normalize to a whole number, and reject negatives.
      if (new_instances_count !== null && new_instances_count < 0) {
        return makeGenericFailure(
          `\`new_instances_count\` must be 0 or a positive integer (got ${new_instances_count}).`
        );
      }
      let newInstancesCount =
        new_instances_count !== null ? Math.round(new_instances_count) : 0;
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

      // Without a positive radius, the "random" brush would silently stack
      // every instance at the exact brush position.
      if (brush_kind === 'random_in_sphere' && brushSize <= 0) {
        return makeGenericFailure(
          'The "random_in_sphere" brush requires a positive `brush_size` (the radius of the sphere). Provide it, or use the "point" brush to place instances at a single position.'
        );
      }
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

      // Creating instances without an object is impossible: an instance whose
      // object name is empty would be a corrupted, invisible orphan.
      if (newInstancesCount > 0 && !object_name) {
        return makeGenericFailure(
          `Cannot create ${newInstancesCount} new instance(s) without \`object_name\`. Nothing was changed. Pass \`object_name\` (an existing object of the scene), or only \`existing_instance_ids\` (with \`new_instances_count\` set to 0) to modify existing instances.`
        );
      }

      if (object_name && !namedObject) {
        return makeGenericFailure(
          `Object "${object_name}" not in ${
            resolvedScope.label
          }. Use only existing objects (create them first if needed).`
        );
      }

      // Store original states of existing instances for comparison
      // $FlowFixMe[underconstrained-implicit-instantiation]
      const existingInstanceStates = new Map();
      const notFoundExistingInstanceIds = new Set<string>(existingInstanceIds);
      const wrongObjectIdDescriptions = [];

      // Create the array of existing instances to move/modify, and new instances to create.
      const modifiedAndCreatedInstances: Array<gdInitialInstance> = [];
      iterateOnInstances(initialInstances, instance => {
        const foundExistingInstanceId = existingInstanceIds.find(id =>
          instance.getPersistentUuid().startsWith(id)
        );
        if (foundExistingInstanceId) {
          notFoundExistingInstanceIds.delete(foundExistingInstanceId);
          if (object_name && instance.getObjectName() !== object_name) {
            wrongObjectIdDescriptions.push(
              `"${foundExistingInstanceId}" (instance of "${instance.getObjectName()}")`
            );
            return;
          }

          // Store original state before modifications
          existingInstanceStates.set(instance, {
            originalLayer: instance.getLayer(),
            originalX: instance.getX(),
            originalY: instance.getY(),
            originalZ: instance.getZ(),
            originalRotationX: instance.getRotationX(),
            originalRotationY: instance.getRotationY(),
            originalRotationZ: instance.getAngle(),
            originalHidden: instance.isHidden(),
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
        }
      });

      if (object_name && wrongObjectIdDescriptions.length > 0) {
        return makeWrongObjectInstanceIdsFailure(
          object_name,
          wrongObjectIdDescriptions
        );
      }

      // Move existing instances to the target layer only after the wrong-ids
      // guard: a failed call must leave every instance untouched.
      modifiedAndCreatedInstances.forEach(instance => {
        if (instance.getLayer() !== layerName) {
          instance.setLayer(layerName);
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
      const instancesHidden = SafeExtractor.extractBooleanProperty(
        args,
        'instances_hidden'
      );

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
        if (instancesHidden !== null) {
          instance.setHidden(instancesHidden);
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
        if (instancesHidden !== null)
          attrs.push(instancesHidden ? 'hidden at start' : 'visible at start');
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
      let hiddenChangedCount = 0;

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
        if (
          instancesHidden !== null &&
          originalState.originalHidden !== instance.isHidden()
        ) {
          hiddenChangedCount++;
        }
      });

      // Name the modified object(s) in messages so a wrongly targeted call is
      // visible in the result.
      const modifiedObjectNames = new Set<string>();
      existingInstanceStates.forEach((originalState, instance) => {
        modifiedObjectNames.add(instance.getObjectName());
      });
      const ofObjectsSuffix =
        modifiedObjectNames.size > 0
          ? ` of ${Array.from(modifiedObjectNames)
              .map(name => `"${name}"`)
              .join(', ')}`
          : '';

      if (movedToLayerCount > 0) {
        changes.push(
          `Moved ${movedToLayerCount} instance${
            movedToLayerCount > 1 ? 's' : ''
          }${ofObjectsSuffix} to ${getLayerNameForMessage(layerName)}.`
        );
      }

      if (movedPositionCount > 0) {
        changes.push(
          `Repositioned ${movedPositionCount} instance${
            movedPositionCount > 1 ? 's' : ''
          }${ofObjectsSuffix} using ${brush_kind} brush.`
        );
      }

      if (resizedCount > 0 && instancesSizeArray) {
        changes.push(
          `Resized ${resizedCount} instance${
            resizedCount > 1 ? 's' : ''
          }${ofObjectsSuffix} to ${instancesSizeArray[0]}x${
            instancesSizeArray[1]
          }x${instancesSizeArray[2]}.`
        );
      }

      if (rotatedCount > 0 && instancesRotationArray) {
        changes.push(
          `Rotated ${rotatedCount} instance${
            rotatedCount > 1 ? 's' : ''
          }${ofObjectsSuffix} to (${instancesRotationArray[0]}°, ${
            instancesRotationArray[1]
          }°, ${instancesRotationArray[2]}°).`
        );
      }

      if (hiddenChangedCount > 0 && instancesHidden !== null) {
        changes.push(
          instancesHidden
            ? `Marked ${hiddenChangedCount} instance${
                hiddenChangedCount > 1 ? 's' : ''
              }${ofObjectsSuffix} as hidden at start (they can be displayed with the "Show" action).`
            : `Marked ${hiddenChangedCount} instance${
                hiddenChangedCount > 1 ? 's' : ''
              }${ofObjectsSuffix} as visible at start.`
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
          (!!instancesRotationArray && instancesRotationArray.length >= 3) ||
          instancesHidden !== null;
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
          const noRequestMessage = `Matched ${matchedCount} existing instance${
            matchedCount > 1 ? 's' : ''
          } but no change was requested — provide a value to modify, or use the "point" brush with \`brush_position\` to move.`;
          if (isNoOpConsideredSuccess(toolsVersion)) {
            return {
              success: true,
              message: noRequestMessage,
              nothingChanged: true,
            };
          }
          return makeGenericFailure(noRequestMessage);
        }

        const noOpMessage = `Matched ${matchedCount} existing instance${
          matchedCount > 1 ? 's' : ''
        } but the requested values are identical to their current ones, so nothing changed.${
          hasPositionBrush
            ? ''
            : ' To move instances, use the "point" brush with `brush_position` (the "none" brush never changes position).'
        }`;
        // A no-op (requested state == current state) is a SUCCESS from v12: a
        // script stops at the first failure, so re-running an idempotent call
        // must not kill it. Pre-v12 keeps the failure (useful tool-call
        // feedback; shipped behavior unchanged). See isNoOpConsideredSuccess.
        if (isNoOpConsideredSuccess(toolsVersion)) {
          return {
            success: true,
            message: noOpMessage,
            nothingChanged: true,
          };
        }
        return makeGenericFailure(noOpMessage);
      }

      // /!\ Tell the editor that some instances have potentially been modified (and even removed).
      // This will force the instances editor to destroy and mount again the
      // renderers to avoid keeping any references to existing instances, and also drop any selection.
      onInstancesModifiedOutsideEditor({
        ...getOutsideEditorChangesTarget(resolvedScope),
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
    const scene_name = getSceneNameFromArgs(args);

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
    const resolvedScope = resolveScopeFromArgs(project, args, {
      allowedTypes: ['scene'],
    });
    if (resolvedScope.success === false)
      return makeScopeFailureOutput(resolvedScope);

    const scene_name = resolvedScope.scope.scene_name || '';
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

export const noEventsInFunctionText = 'This function has no events.';

const EVENTS_SOURCE_MAX_CHARS_DEFAULT = 12000;
const EVENTS_SOURCE_MAX_CHARS_MINIMUM = 2000;
const EVENTS_SOURCE_MAX_CHARS_LIMIT = 30000;

const getPropertyNames = (
  propertiesContainer: gdPropertiesContainer
): Array<string> =>
  mapFor(0, propertiesContainer.getCount(), i =>
    propertiesContainer.getAt(i).getName()
  );

const getVariableNames = (
  variablesContainer: gdVariablesContainer
): Array<string> =>
  mapFor(0, variablesContainer.count(), i => variablesContainer.getNameAt(i));

const getObjectNames = (objectsContainer: gdObjectsContainer): Array<string> =>
  mapFor(0, objectsContainer.getObjectsCount(), i =>
    objectsContainer.getObjectAt(i).getName()
  );

const getScopeSummary = (
  resolvedScope: ResolvedScope,
  eventsFunction: gdEventsFunction
): ScopeSummary => {
  const {
    eventsFunctionsExtension,
    eventsBasedBehavior,
    eventsBasedObject,
  } = resolvedScope;
  const parameters = eventsFunction.getParameters();

  const summary: ScopeSummary = {
    // Every declared parameter, the implicit Object/Behavior included: they
    // are usable in the events under these names.
    parameters: mapFor(0, parameters.getParametersCount(), i => {
      const parameter = parameters.getParameterAt(i);
      return { name: parameter.getName(), type: parameter.getType() };
    }),
    properties: eventsBasedBehavior
      ? [
          ...getPropertyNames(eventsBasedBehavior.getPropertyDescriptors()),
          ...getPropertyNames(
            eventsBasedBehavior.getSharedPropertyDescriptors()
          ),
        ]
      : eventsBasedObject
      ? getPropertyNames(eventsBasedObject.getPropertyDescriptors())
      : [],
    extensionVariables: {
      global: eventsFunctionsExtension
        ? getVariableNames(eventsFunctionsExtension.getGlobalVariables())
        : [],
      scene: eventsFunctionsExtension
        ? getVariableNames(eventsFunctionsExtension.getSceneVariables())
        : [],
    },
  };
  if (eventsBasedObject) {
    summary.childObjects = getObjectNames(eventsBasedObject.getObjects());
  }
  return summary;
};

/**
 * The events to read: those of a scene, or those of the function named by
 * `function_name` in an extension scope (with the function itself, to
 * summarize what it can use).
 */
const getEventsSourceTarget = (
  resolvedScope: ResolvedScope,
  functionName: ?string
):
  | {|
      success: true,
      eventsList: gdEventsList,
      eventsFunction: gdEventsFunction | null,
    |}
  | {| success: false, message: string |} => {
  const { layout } = resolvedScope;
  if (layout) {
    return {
      success: true,
      eventsList: layout.getEvents(),
      eventsFunction: null,
    };
  }
  const result = getEventsFunctionInScope(resolvedScope, functionName);
  if (result.success === false) return result;
  return {
    success: true,
    eventsList: result.eventsFunction.getEvents(),
    eventsFunction: result.eventsFunction,
  };
};

/**
 * Reads the events of a scene as EventScript source (the exact syntax
 * accepted by the `event_script` field of events generation), with filters
 * to keep the output small.
 */
const readEventsSource: EditorFunction = {
  renderForEditor: ({ args, editorCallbacks }) => {
    const scene_name = getSceneNameFromArgs(args);
    const eventIds = SafeExtractor.extractStringArrayProperty(
      args,
      'event_ids'
    );
    const searchText = SafeExtractor.extractStringProperty(args, 'search');
    const objectNames = SafeExtractor.extractStringArrayProperty(
      args,
      'object_names'
    );

    if (!scene_name) {
      // A function of an extension: no editor link to it yet, so name the
      // scope and the function being read.
      const scopeLabel = getScopeLabelFromArgs(args);
      const functionName =
        SafeExtractor.extractStringProperty(args, 'function_name') || '';
      return {
        text: functionName ? (
          <Trans>
            Read events source of function {functionName} in {scopeLabel}.
          </Trans>
        ) : (
          <Trans>Read events source in {scopeLabel}.</Trans>
        ),
      };
    }

    const sceneLink = (
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
    );

    // Describe what is being read (search text, objects or specific events)
    // so it's clear which part of the events source is being inspected,
    // rather than only showing the scene name.
    const objectsText = objectNames ? objectNames.join(', ') : '';
    const eventIdsCount = eventIds ? eventIds.length : 0;

    let text;
    if (searchText && objectsText) {
      text = (
        <Trans>
          Read events source matching "{searchText}" and involving {objectsText}{' '}
          in scene {sceneLink}.
        </Trans>
      );
    } else if (searchText) {
      text = (
        <Trans>
          Read events source matching "{searchText}" in scene {sceneLink}.
        </Trans>
      );
    } else if (objectsText) {
      text = (
        <Trans>
          Read events source involving {objectsText} in scene {sceneLink}.
        </Trans>
      );
    } else if (eventIdsCount === 1) {
      text = (
        <Trans>Read source of 1 specific event in scene {sceneLink}.</Trans>
      );
    } else if (eventIdsCount > 1) {
      text = (
        <Trans>
          Read source of {eventIdsCount} specific events in scene {sceneLink}.
        </Trans>
      );
    } else {
      text = <Trans>Read all events source in scene {sceneLink}.</Trans>;
    }

    return { text };
  },
  launchFunction: async ({ project, args, ensureExtensionsUpToDate }) => {
    const resolvedScope = resolveScopeFromArgs(project, args, {
      allowedTypes: ['scene', 'extension', 'custom_behavior', 'custom_object'],
    });
    if (resolvedScope.success === false)
      return makeScopeFailureOutput(resolvedScope);

    const functionName = SafeExtractor.extractStringProperty(
      args,
      'function_name'
    );
    const target = getEventsSourceTarget(resolvedScope, functionName);
    if (target.success === false) return makeScopeFailureOutput(target);
    const { eventsList, eventsFunction } = target;
    if (eventsFunction) {
      // The instructions of a function edited earlier in this batch are
      // rendered from the generated metadata: regenerate it first.
      await ensureExtensionsUpToDate();
    }

    const eventIds = SafeExtractor.extractStringArrayProperty(
      args,
      'event_ids'
    );
    const searchText = SafeExtractor.extractStringProperty(args, 'search');
    const objectNames = SafeExtractor.extractStringArrayProperty(
      args,
      'object_names'
    );
    const subEventsDepth = SafeExtractor.extractNumberProperty(
      args,
      'sub_events_depth'
    );
    const maxCharsArgument = SafeExtractor.extractNumberProperty(
      args,
      'max_chars'
    );
    const maxChars = Math.max(
      EVENTS_SOURCE_MAX_CHARS_MINIMUM,
      Math.min(
        EVENTS_SOURCE_MAX_CHARS_LIMIT,
        maxCharsArgument || EVENTS_SOURCE_MAX_CHARS_DEFAULT
      )
    );

    // In a function, what the events can use (parameters, properties, child
    // objects, extension variables) is shown as `#` comment lines at the top
    // of the source: the reader has everything at hand, and the source stays
    // valid EventScript if it is sent back as is. They count against
    // `max_chars` like the rest of the output.
    const scopeSummary = eventsFunction
      ? getScopeSummary(resolvedScope, eventsFunction)
      : null;
    const scopeSummaryHeaderText = scopeSummary
      ? renderScopeSummaryHeaderLines(scopeSummary).join('\n')
      : '';

    const {
      text,
      selectedEventIds,
      truncated,
      notes,
      renderingErrors,
    } = buildEventScriptSourceView({
      eventsList,
      eventIds,
      searchText,
      objectNames,
      subEventsDepth,
      maxChars: Math.max(
        0,
        maxChars -
          (scopeSummaryHeaderText ? scopeSummaryHeaderText.length + 1 : 0)
      ),
    });

    // An empty `text` does NOT mean the scene has no events: a filter can
    // match nothing on a populated sheet (the notes say which case it is).
    // Only a truly empty sheet gets the "no events" text.
    const eventScriptText =
      text ||
      (eventsList.getEventsCount() === 0
        ? eventsFunction
          ? noEventsInFunctionText
          : noEventsInSceneText
        : '');

    const output: EditorFunctionGenericOutput = {
      success: true,
      ...(eventsFunction && scopeSummary
        ? {
            eventsForScopeLabel: resolvedScope.label,
            functionName: eventsFunction.getName(),
            scopeSummary,
          }
        : { eventsForSceneNamed: resolvedScope.scope.scene_name || '' }),
      eventScript: scopeSummaryHeaderText
        ? scopeSummaryHeaderText +
          (eventScriptText ? `\n${eventScriptText}` : '')
        : eventScriptText,
      selectedEventIds,
    };
    if (truncated) output.truncated = true;
    if (notes.length > 0) output.notes = notes;
    if (renderingErrors.length > 0) {
      // Surface partial failures so the cause is reported, not dropped.
      output.eventsRenderingErrors = renderingErrors;
    }
    return output;
  },
  modifiesProject: false,
};

/**
 * Generates events with the AI and applies them: in the events sheet of a
 * scene, or in the events of a function of an extension (`function_name`).
 */
const addSceneEvents: EditorFunction = {
  renderForEditor: ({
    args,
    shouldShowDetails,
    editorCallbacks,
    editorFunctionCallResultOutput,
  }) => {
    const scene_name = getSceneNameFromArgs(args);
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
            const eventScript = SafeExtractor.extractStringProperty(
              batch,
              'event_script'
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
                {eventScript && (
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
                    : {eventScript}
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

    if (!scene_name) {
      // A function of an extension: name the function and link to it in the
      // extension editor.
      const functionTarget = getFunctionTargetFromArgs(args);
      if (!functionTarget) {
        return {
          text: <Trans>Write events in {getScopeLabelFromArgs(args)}.</Trans>,
          details,
          hasDetailsToShow: true,
        };
      }
      return {
        text: (
          <Trans>
            Generate events in function{' '}
            <Link
              href="#"
              onClick={() =>
                editorCallbacks.onOpenEventsFunctionsExtension(
                  functionTarget.extensionName,
                  {
                    functionName: functionTarget.functionName,
                    behaviorName: functionTarget.behaviorName,
                    objectName: functionTarget.objectName,
                  }
                )
              }
            >
              {functionTarget.functionReference}
            </Link>
            .
          </Trans>
        ),
        details,
        hasDetailsToShow: true,
      };
    }

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
    onExtensionsModifiedOutsideEditor,
    ensureExtensionsUpToDate,
    ensureExtensionInstalled,
    onWillInstallExtension,
    onExtensionInstalled,
    searchAndInstallResources,
  }) => {
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

    const resolvedScope = resolveScopeFromArgs(project, args, {
      allowedTypes: ['scene', 'extension', 'custom_behavior', 'custom_object'],
    });
    if (resolvedScope.success === false)
      return makeScopeFailureOutput(resolvedScope);
    const scene = resolvedScope.layout;
    if (!scene) {
      // Events written in a function of an extension: the extension must be
      // editable (a store extension is read-only).
      const readOnlyRejection = getReadOnlyRejection(resolvedScope);
      if (readOnlyRejection) return makeScopeFailureOutput(readOnlyRejection);
    }
    if (!relatedAiRequestId) {
      return makeGenericFailure(
        'No related AI request ID found for events generation.'
      );
    }

    // The events to write in: those of the scene, or those of the function
    // named by `function_name` in the extension scope.
    const functionNameArgument = SafeExtractor.extractStringProperty(
      args,
      'function_name'
    );
    const eventsTarget = getEventsSourceTarget(
      resolvedScope,
      functionNameArgument
    );
    if (eventsTarget.success === false)
      return makeScopeFailureOutput(eventsTarget);
    const { eventsList: currentEventsList, eventsFunction } = eventsTarget;
    const extensionName = resolvedScope.eventsFunctionsExtension
      ? resolvedScope.eventsFunctionsExtension.getName()
      : '';
    // A scene name is only sent for a scene (the generation API keeps it
    // beside the scope for older editors).
    const sceneName = scene ? resolvedScope.scope.scene_name || '' : '';

    // An extension may have been authored earlier in this batch: the generated
    // metadata (and the extensions summary uploaded with this generation, the
    // private functions of an edited extension included) must describe the
    // extensions as they are now, whatever the scope. A no-op when nothing
    // changed.
    await ensureExtensionsUpToDate();

    // The existing events are sent as JSON only: the generation backend
    // renders them itself (as a bounded EventScript view) for its model.
    const existingEventsJson =
      toolOptions && toolOptions.includeEventsJson
        ? serializeToJSON(currentEventsList)
        : null;

    const parsedEventBatches = eventBatches
      ? eventBatches.map(batch => {
          const placementRelation =
            SafeExtractor.extractStringProperty(batch, 'placement_relation') ||
            '(unspecified)';
          const placementTargetEventId = SafeExtractor.extractStringProperty(
            batch,
            'placement_target_event_id'
          );

          // For replace placements, also send the CURRENT source of what is
          // being replaced: the backend compares the
          // `expected_event_source` anchor against it (proof it was read
          // and hasn't changed). The source covers exactly what the
          // placement destroys: the event alone when its sub-events are
          // kept, the whole subtree when they are replaced too.
          const isReplaceEntirePlacement =
            placementRelation === 'replace_entire_event_and_sub_events';
          const isReplacePlacement =
            placementRelation ===
              'replace_event_but_keep_existing_sub_events' ||
            isReplaceEntirePlacement;
          const renderedTargetEventSource =
            isReplacePlacement && placementTargetEventId
              ? renderEventSourceById({
                  eventsList: currentEventsList,
                  eventIdOrGroupName: placementTargetEventId,
                  includeSubEvents: isReplaceEntirePlacement,
                })
              : null;
          // A subtree too big to be read in one call cannot serve as the
          // proof-of-read reference either (the backend bounds the field):
          // skip the check for it (like an editor without the capability)
          // rather than failing the whole request.
          const placementTargetEventSource =
            renderedTargetEventSource &&
            renderedTargetEventSource.length <= EVENTS_SOURCE_MAX_CHARS_LIMIT
              ? renderedTargetEventSource
              : null;

          return {
            eventsDescription:
              SafeExtractor.extractStringProperty(
                batch,
                'events_description'
              ) || '',
            eventScript: SafeExtractor.extractStringProperty(
              batch,
              'event_script'
            ),
            placementRelation,
            placementTargetEventId,
            placementExpectedParentEventId: SafeExtractor.extractStringProperty(
              batch,
              'placement_expected_parent_event_id'
            ),
            placementRationale: SafeExtractor.extractStringProperty(
              batch,
              'placement_rationale'
            ),
            expectedEventSource: SafeExtractor.extractStringProperty(
              batch,
              'expected_event_source'
            ),
            placementTargetEventSource,
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
            !batch.eventScript &&
            batch.placementRelation !== 'delete'
        )
      ) {
        return makeGenericFailure(
          'No events description/events script provided for some event batches. Provide one for each event(s) to generate.'
        );
      }
    } else if (!eventsDescription) {
      return makeGenericFailure('No events description provided.');
    }

    try {
      const eventsGenerationResult: EventsGenerationResult = await generateEvents(
        {
          scope: resolvedScope.scope,
          functionName: eventsFunction ? eventsFunction.getName() : null,
          sceneName,
          eventsDescription,
          eventBatches: parsedEventBatches,
          extensionNamesList,
          objectsList,
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
        let hasChangedChildObjects = false;
        for (const change of changes) {
          addUndeclaredVariables({
            project,
            resolvedScope,
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
              resolvedScope,
              objectName,
              undeclaredVariables,
            });
            hasChangedChildObjects = true;
          }

          const objectNamesWithMissingBehavior = Object.keys(
            change.missingObjectBehaviors
          );
          for (const objectName of objectNamesWithMissingBehavior) {
            const missingBehaviors = change.missingObjectBehaviors[objectName];
            addMissingObjectBehaviors({
              project,
              resolvedScope,
              objectName,
              missingBehaviors,
            });
            hasChangedChildObjects = true;
          }
        }
        if (eventsFunction && hasChangedChildObjects) {
          // The variables and behaviors of the child objects are part of the
          // structure of the custom object: the named variants follow.
          complyVariantsAfterStructuralEdit(project, resolvedScope);
        }

        const { applied, errors } = applyEventsChanges(
          project,
          currentEventsList,
          changes,
          aiGeneratedEvent.id
        );

        if (applied === 0) {
          return {
            // Carry the generated event id like every other failure, so the
            // editor can keep tracking this generation.
            ...makeAiGeneratedEventFailure(
              `Events generated but not applied. Generation output:

${aiGeneratedEvent.resultMessage || '(none)'}

Events were not changed (extensions, variables or behaviors needed by them may have been added); see errors.`
            ),
            errors,
          };
        }

        if (eventsFunction) {
          onSceneEventsModifiedOutsideEditor({
            scene: null,
            eventsFunction,
            extensionName,
            newOrChangedAiGeneratedEventIds: new Set([aiGeneratedEvent.id]),
          });
          // The code of the function changed: the extension must be
          // regenerated before anything reads its metadata again.
          onExtensionsModifiedOutsideEditor({
            extensionNames: [extensionName],
            needsCodeRegeneration: true,
          });
        } else {
          onSceneEventsModifiedOutsideEditor({
            scene,
            newOrChangedAiGeneratedEventIds: new Set([aiGeneratedEvent.id]),
          });
        }

        // Search and install missing resources if any. This runs after the
        // events were applied: a failure here must NOT fail the whole call,
        // or the caller would retry and add the same events a second time.
        let resourceSearchResults: Array<SingleResourceSearchAndInstallResult> = [];
        let resourceInstallErrorText = '';
        try {
          const allMissingResources = changes.flatMap(
            change => change.missingResources || []
          );
          ({ results: resourceSearchResults } = await searchAndInstallResources(
            {
              resources: allMissingResources,
            }
          ));
        } catch (error) {
          resourceInstallErrorText = `

Warning: the events were added, but installing their missing resources failed (${
            error.message
          }). Do NOT add the events again: add or fix the resources instead if needed.`;
        }
        const newlyAddedResources = resourceSearchResults.filter(
          result => result.status === 'resource-installed'
        );
        const notFoundResources = resourceSearchResults.filter(
          result =>
            result.status === 'nothing-found' || result.status === 'error'
        );
        const notFoundResourcesText =
          notFoundResources.length > 0
            ? `

Warning: no resource matching ${notFoundResources
                .map(result => `"${result.resourceName}"`)
                .join(
                  ', '
                )} found in the free library. The action(s) referencing them will do nothing (e.g. no sound will play). Rework the event(s) with a different descriptive file name if needed.`
            : '';

        const resultMessage =
          (errors.length > 0
            ? `Events generated but some applies failed. Generation output:

${aiGeneratedEvent.resultMessage || '(none)'}

See errors; verify event contents if needed.`
            : aiGeneratedEvent.resultMessage || 'Modified or added event(s).') +
          notFoundResourcesText +
          resourceInstallErrorText;
        const output: EditorFunctionGenericOutput = {
          success: true,
          message: resultMessage,
          aiGeneratedEventId: aiGeneratedEvent.id,
        };
        if (newlyAddedResources.length > 0) {
          output.newlyAddedResources = newlyAddedResources;
        }
        if (errors.length > 0) {
          output.errors = errors;
        }
        return output;
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
  // The name under which the effect exists after the rename/creation below,
  // so later lookups (position, properties) never use a stale name.
  let currentEffectName = effectName;

  if (effectsContainer.hasEffectNamed(effectName)) {
    const effect = effectsContainer.getEffect(effectName);
    if (delete_this_effect) {
      effectsContainer.removeEffect(effectName);
      changes.push(`Removed "${effectName}" effect on ${targetLabel}.`);
    } else {
      if (new_effect_name && new_effect_name !== effectName) {
        // The container does not enforce name uniqueness: renaming onto a
        // taken name would leave two effects with the same name.
        if (effectsContainer.hasEffectNamed(new_effect_name)) {
          warnings.push(
            `An effect named "${new_effect_name}" already exists on ${targetLabel}: "${effectName}" was NOT renamed.`
          );
        } else {
          effect.setName(new_effect_name);
          currentEffectName = new_effect_name;
          changes.push(
            `Renamed the "${effectName}" effect on ${targetLabel} to "${new_effect_name}".`
          );
        }
      }
      if (new_effect_position !== null) {
        // `moveEffect` silently ignores an out-of-range target: clamp it (an
        // out-of-bounds position means "last") and report the real position.
        const clampedPosition = Math.max(
          0,
          Math.min(new_effect_position, effectsContainer.getEffectsCount() - 1)
        );
        effectsContainer.moveEffect(
          effectsContainer.getEffectPosition(currentEffectName),
          clampedPosition
        );
        changes.push(
          `Moved the "${currentEffectName}" effect on ${targetLabel} to position ${clampedPosition}.`
        );
      }
    }
  } else {
    if (effect_type) {
      const newEffectName = new_effect_name || effectName;
      // Same invariant as the rename guard above: the container does not
      // enforce name uniqueness, so creating under an already-taken
      // `new_effect_name` would leave two effects with the same name.
      if (effectsContainer.hasEffectNamed(newEffectName)) {
        warnings.push(
          `An effect named "${newEffectName}" already exists on ${targetLabel}: effect NOT added. Use another name, or target "${newEffectName}" directly with \`effect_name\` to modify it.`
        );
        return;
      }
      currentEffectName = newEffectName;
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
    } else if (
      delete_this_effect ||
      new_effect_name ||
      new_effect_position !== null
    ) {
      // Deleting/renaming/moving an effect that does not exist (and with no
      // `effect_type` to create it): explain instead of silently doing
      // nothing, or the caller gets a bare "No changes." with no diagnosis.
      const existingEffectNames = [];
      for (let i = 0; i < effectsContainer.getEffectsCount(); i++) {
        existingEffectNames.push(
          `"${effectsContainer.getEffectAt(i).getName()}"`
        );
      }
      warnings.push(
        `Effect "${effectName}" not found on ${targetLabel}. ${
          existingEffectNames.length > 0
            ? `Existing effects are: ${existingEffectNames.join(', ')}.`
            : 'There are no effects.'
        } Nothing was changed for this effect.`
      );
      return;
    }
  }

  const changed_properties = SafeExtractor.extractArrayProperty(
    changedEffect,
    'changed_properties'
  );
  if (changed_properties) {
    if (!effectsContainer.hasEffectNamed(currentEffectName)) {
      warnings.push(`Effect "${currentEffectName}" not found. Skipped.`);
      return;
    }
    const effect = effectsContainer.getEffect(currentEffectName);
    const effectMetadata = gd.MetadataProvider.getEffectMetadata(
      project.getCurrentPlatform(),
      effect.getEffectType()
    );

    if (gd.MetadataProvider.isBadEffectMetadata(effectMetadata)) {
      warnings.push(`Effect "${currentEffectName}" invalid. Skipped.`);
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
          `Property "${propertyName}" not on effect "${currentEffectName}". Skipped.`
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
          `Modified "${propertyName}" property of the "${currentEffectName}" effect to "${newValue}".`
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

// The scopes owning layers, layer effects and object groups: a scene, or a
// variant of a custom object (which has an area instead of scene properties).
const PROPERTIES_LAYERS_EFFECTS_SCOPE_TYPES = OBJECTS_SCOPE_TYPES;

/** The layers of a scope, with their effects: the same shape everywhere. */
const describeLayersWithEffects = (
  project: gdProject,
  layersContainer: gdLayersContainer
) =>
  mapFor(0, layersContainer.getLayersCount(), i => {
    const layer = layersContainer.getLayerAt(i);
    const effectsContainer = layer.getEffects();
    return {
      name: layer.getName(),
      position: i,
      visible: layer.getVisibility(),
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
          effectProperties: serializeEffectProperties(effect, effectMetadata),
        };
      }).filter(Boolean),
    };
  });

const describeObjectGroups = (objectsContainer: gdObjectsContainer) => {
  const groups = objectsContainer.getObjectGroups();
  return mapFor(0, groups.count(), i => {
    const group = groups.getAt(i);
    return {
      objectGroupName: group.getName(),
      objectNames: group.getAllObjectsNames().toJSArray(),
    };
  });
};

/** A variant has no background color, resolution or startup flag: an area. */
const inspectCustomObjectVariant = (
  project: gdProject,
  resolvedScope: ResolvedScope,
  variant: gdEventsBasedObjectVariant,
  eventsBasedObject: gdEventsBasedObject
): EditorFunctionGenericOutput => {
  const assetStoreAssetId = variant.getAssetStoreAssetId();
  return {
    success: true,
    propertiesLayersEffectsForScopeLabel: resolvedScope.label,
    isDefaultVariant: resolvedScope.isDefaultVariant,
    area: {
      minX: variant.getAreaMinX(),
      minY: variant.getAreaMinY(),
      minZ: variant.getAreaMinZ(),
      maxX: variant.getAreaMaxX(),
      maxY: variant.getAreaMaxY(),
      maxZ: variant.getAreaMaxZ(),
    },
    layers: describeLayersWithEffects(project, variant.getLayers()),
    objectGroups: describeObjectGroups(eventsBasedObject.getObjects()),
    ...(assetStoreAssetId ? { assetStoreAssetId } : {}),
  };
};

const inspectScenePropertiesLayersEffects: EditorFunction = {
  renderForEditor: ({ args }) => {
    const scene_name = getSceneNameFromArgs(args);
    if (!scene_name) {
      return {
        text: (
          <Trans>Read the settings of {getScopeLabelFromArgs(args)}.</Trans>
        ),
      };
    }

    return {
      text: (
        <Trans>
          Read <b>{scene_name}</b>'s scene settings.
        </Trans>
      ),
    };
  },
  launchFunction: async ({ project, args }) => {
    const resolvedScope = resolveScopeFromArgs(project, args, {
      allowedTypes: PROPERTIES_LAYERS_EFFECTS_SCOPE_TYPES,
    });
    if (resolvedScope.success === false)
      return makeScopeFailureOutput(resolvedScope);

    const { variant, eventsBasedObject } = resolvedScope;
    if (variant && eventsBasedObject) {
      return inspectCustomObjectVariant(
        project,
        resolvedScope,
        variant,
        eventsBasedObject
      );
    }

    const scene = resolvedScope.layout;
    if (!scene)
      return makeGenericFailure(`${resolvedScope.label} has no properties.`);
    const layersContainer = scene.getLayers();

    // Mirror the runtime behavior: when `firstLayout` is not set (or names a
    // missing scene), the first scene of the project is the startup scene.
    const firstLayoutName = project.getFirstLayout();
    const effectiveFirstSceneName =
      firstLayoutName && project.hasLayoutNamed(firstLayoutName)
        ? firstLayoutName
        : project.getLayoutsCount() > 0
        ? project.getLayoutAt(0).getName()
        : '';

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
        isFirstScene: effectiveFirstSceneName === scene.getName(),

        // Also include some project related properties:
        gameResolutionWidth: project.getGameResolutionWidth(),
        gameResolutionHeight: project.getGameResolutionHeight(),
        gameOrientation: project.getOrientation(),
        gameScaleMode: project.getScaleMode(),
        gameName: project.getName(),
      },
      layers: describeLayersWithEffects(project, layersContainer),
    };
  },
  modifiesProject: false,
};

const isFuzzyMatch = (string1: string, string2: string) => {
  const simplifiedString1 = string1.toLowerCase().replace(/\s|_|-/g, '');
  const simplifiedString2 = string2.toLowerCase().replace(/\s|_|-/g, '');

  return simplifiedString1 === simplifiedString2;
};

const parseBoolean = (
  value: string
): {| valid: true, value: boolean |} | {| valid: false |} => {
  const lowercaseValue = value.toLowerCase();
  if (lowercaseValue !== 'true' && lowercaseValue !== 'false') {
    return { valid: false };
  }
  return { valid: true, value: lowercaseValue === 'true' };
};

// The only "properties" a variant of a custom object has: its area (the
// declaration settings live on the custom object itself).
const CUSTOM_OBJECT_VARIANT_AREA_PROPERTY_NAMES = [
  'areaMinX',
  'areaMinY',
  'areaMinZ',
  'areaMaxX',
  'areaMaxY',
  'areaMaxZ',
];

const applyCustomObjectVariantPropertyChange = ({
  variant,
  propertyName,
  newValue,
  targetLabel,
  changes,
  warnings,
}: {|
  variant: gdEventsBasedObjectVariant,
  propertyName: string,
  newValue: string,
  targetLabel: string,
  changes: Array<string>,
  warnings: Array<string>,
|}) => {
  const areaPropertyName = CUSTOM_OBJECT_VARIANT_AREA_PROPERTY_NAMES.find(
    name => isFuzzyMatch(propertyName, name)
  );
  if (!areaPropertyName) {
    warnings.push(
      `Unknown custom object variant property: "${propertyName}". Skipped. A variant only has ${CUSTOM_OBJECT_VARIANT_AREA_PROPERTY_NAMES.join(
        ', '
      )} (the scene properties and the custom object settings are changed elsewhere).`
    );
    return;
  }
  const value = parseFloat(newValue);
  if (!Number.isFinite(value)) {
    warnings.push(
      `"${areaPropertyName}" must be a number (got "${newValue}"). Skipped.`
    );
    return;
  }
  if (areaPropertyName === 'areaMinX') variant.setAreaMinX(value);
  else if (areaPropertyName === 'areaMinY') variant.setAreaMinY(value);
  else if (areaPropertyName === 'areaMinZ') variant.setAreaMinZ(value);
  else if (areaPropertyName === 'areaMaxX') variant.setAreaMaxX(value);
  else if (areaPropertyName === 'areaMaxY') variant.setAreaMaxY(value);
  else variant.setAreaMaxZ(value);
  changes.push(`Set ${areaPropertyName} to ${value} for ${targetLabel}.`);
};

/** Renaming an object group updates the events referring to it. */
const objectOrGroupRenamedInScope = (
  project: gdProject,
  resolvedScope: ResolvedScope,
  oldName: string,
  newName: string
) => {
  const { layout, eventsBasedObject } = resolvedScope;
  if (layout) {
    gd.WholeProjectRefactorer.objectOrGroupRenamedInScene(
      project,
      layout,
      oldName,
      newName,
      /* isObjectGroup=*/ true
    );
    return;
  }
  if (!eventsBasedObject) return;
  const { accessor, dispose } = makeScopeProjectScopedContainersAccessor(
    project,
    resolvedScope,
    null
  );
  try {
    gd.WholeProjectRefactorer.objectOrGroupRenamedInEventsBasedObject(
      project,
      accessor.get(),
      eventsBasedObject,
      oldName,
      newName,
      /* isObjectGroup=*/ true
    );
  } finally {
    dispose();
  }
};

const changeScenePropertiesLayersEffectsGroups: EditorFunction = {
  renderForEditor: ({ args, shouldShowDetails }) => {
    const scene_name = getSceneNameFromArgs(args);
    if (!scene_name) {
      return {
        text: (
          <Trans>Update the settings of {getScopeLabelFromArgs(args)}.</Trans>
        ),
      };
    }

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
    toolsVersion,
    onInstancesModifiedOutsideEditor,
    onObjectGroupsModifiedOutsideEditor,
    onProjectItemRenamedOutsideEditor,
    onWillDeleteScene,
  }) => {
    const resolvedScope = resolveScopeFromArgs(project, args, {
      allowedTypes: PROPERTIES_LAYERS_EFFECTS_SCOPE_TYPES,
    });
    if (resolvedScope.success === false)
      return makeScopeFailureOutput(resolvedScope);
    const readOnlyRejection = getReadOnlyRejection(resolvedScope);
    if (readOnlyRejection) return makeScopeFailureOutput(readOnlyRejection);

    const scene = resolvedScope.layout;
    const { variant, eventsBasedObject, layersContainer } = resolvedScope;
    if (!layersContainer)
      return makeGenericFailure(`${resolvedScope.label} has no layers.`);
    // The label is read at message time: a rename in the same call must be
    // reflected by the messages that follow it.
    const getTargetLabel = () =>
      scene ? `scene "${scene.getName()}"` : resolvedScope.label;

    const deleteThisScene = SafeExtractor.extractBooleanProperty(
      args,
      'delete_this_scene'
    );
    if (deleteThisScene && !scene) {
      return makeGenericFailure(
        'A variant cannot be deleted here: use change_custom_object.changed_variants.'
      );
    }
    if (deleteThisScene && scene) {
      // Let the editor close any tab bound to this scene BEFORE it's
      // actually deleted (mirrors the manual delete flow, which closes tabs
      // before removing the layout). This must be awaited: closing tabs
      // requires reading the layout via `getLayout()`, which only works
      // while the scene still exists in the project.
      await onWillDeleteScene({ scene });

      const scene_name = scene.getName();
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

    // Object groups are structural: a named variant inherits the ones of the
    // default variant instead of having its own.
    if (changed_groups && changed_groups.length > 0) {
      const namedVariantRejection = getNamedVariantRejection(resolvedScope);
      if (namedVariantRejection)
        return makeScopeFailureOutput(namedVariantRejection);
    }
    // The groups of a custom object live on its default variant.
    const groupsObjectsContainer = eventsBasedObject
      ? eventsBasedObject.getObjects()
      : resolvedScope.objectsContainer;
    // No global objects inside a custom object: the children only see each other.
    const groupsGlobalObjectsContainer =
      resolvedScope.globalObjectsContainer || null;
    if (!groupsObjectsContainer)
      return makeGenericFailure(`${resolvedScope.label} has no objects.`);

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

        if (!scene) {
          if (variant) {
            applyCustomObjectVariantPropertyChange({
              variant,
              propertyName,
              newValue,
              targetLabel: resolvedScope.label,
              changes,
              warnings,
            });
          }
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

        let new_layer_name = SafeExtractor.extractStringProperty(
          changed_layer,
          'new_layer_name'
        );
        if (new_layer_name === layerName) {
          // Same name means no rename: ignore it, as models often redundantly fill it when adding a layer.
          new_layer_name = null;
        }
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
        const new_visibility = SafeExtractor.extractBooleanProperty(
          changed_layer,
          'new_visibility'
        );

        // The base layer must always exist: a scene without it is unable to run.
        if (layerName === '' && (delete_this_layer || new_layer_name)) {
          warnings.push(
            delete_this_layer
              ? `The base layer (named "") cannot be deleted: every scene must keep it. Move or delete its instances instead.`
              : `The base layer (named "") cannot be renamed. Create a new layer and move instances to it instead.`
          );
          return;
        }

        if (layersContainer.hasLayerNamed(layerName)) {
          // `changed_layers: [{ layer_name: "HUD" }]` on an existing layer is
          // how an agent asks to MAKE SURE the layer exists — which it does.
          // Say so (like a rename to the current name does) instead of
          // returning an unexplained "nothing changed" for the whole call.
          if (
            !delete_this_layer &&
            !new_layer_name &&
            new_layer_position === null &&
            new_visibility === null &&
            move_instances_to_layer === null
          ) {
            changes.push(
              `Layer "${layerName}" already exists in ${getTargetLabel()}: nothing to change.`
            );
            return;
          }
          let currentLayerName = layerName;
          if (delete_this_layer) {
            // The base layer is named "", so only a null (not set) value means
            // "delete the instances of the layer".
            if (move_instances_to_layer !== null) {
              if (!layersContainer.hasLayerNamed(move_instances_to_layer)) {
                warnings.push(
                  `Layer "${move_instances_to_layer}" does not exist in ${getTargetLabel()}: layer "${layerName}" was NOT deleted (its instances would have nowhere to go). The base layer is named "".`
                );
                return;
              }
              if (move_instances_to_layer === layerName) {
                warnings.push(
                  `"move_instances_to_layer" is the same as the layer to delete ("${layerName}"): layer NOT deleted. Use another layer name, or omit it to also delete the instances.`
                );
                return;
              }
              mergeLayersInScope(
                project,
                resolvedScope,
                layerName,
                move_instances_to_layer
              );
            } else {
              // Note: some instances will be invalidated because of this.
              removeLayerInScope(project, resolvedScope, layerName);
            }
            layersContainer.removeLayer(layerName);
            changes.push(
              move_instances_to_layer !== null
                ? `Removed layer "${layerName}" for ${getTargetLabel()} (instances moved to ${
                    move_instances_to_layer === ''
                      ? 'the base layer'
                      : `layer "${move_instances_to_layer}"`
                  }).`
                : `Removed layer "${layerName}" for ${getTargetLabel()} (its instances were removed too).`
            );
          } else {
            const layer = layersContainer.getLayer(layerName);
            if (new_layer_name) {
              if (layersContainer.hasLayerNamed(new_layer_name)) {
                warnings.push(
                  `A layer named "${new_layer_name}" already exists in ${getTargetLabel()}: layer "${layerName}" was not renamed. To merge two layers, delete one with "delete_this_layer" and "move_instances_to_layer".`
                );
              } else {
                layer.setName(new_layer_name);
                renameLayerInScope(
                  project,
                  resolvedScope,
                  layerName,
                  new_layer_name
                );
                currentLayerName = new_layer_name;
                changes.push(
                  `Renamed layer "${layerName}" to "${new_layer_name}" for ${getTargetLabel()} (events and instances updated).`
                );
              }
            }
            if (new_visibility !== null) {
              layer.setVisibility(new_visibility);
              changes.push(
                `Set layer "${currentLayerName}" initial visibility to ${
                  new_visibility ? 'visible' : 'hidden'
                } for ${getTargetLabel()}.`
              );
            }
          }
          if (delete_this_layer && new_layer_position !== null) {
            // Without this guard, the position block below would look up the
            // deleted layer and report a move that never happened.
            warnings.push(
              `"new_layer_position" was ignored: layer "${layerName}" was deleted.`
            );
          } else if (new_layer_position !== null) {
            const currentLayerPosition = layersContainer.getLayerPosition(
              currentLayerName
            );
            // `moveLayer` silently ignores an out-of-range target: clamp it
            // (as documented, an out-of-bounds position means "on top") and
            // report the real position.
            const clampedLayerPosition = Math.max(
              0,
              Math.min(new_layer_position, layersContainer.getLayersCount() - 1)
            );
            if (clampedLayerPosition === currentLayerPosition) {
              changes.push(
                `Layer "${currentLayerName}" is already at position ${currentLayerPosition} for ${getTargetLabel()}.`
              );
            } else {
              layersContainer.moveLayer(
                currentLayerPosition,
                clampedLayerPosition
              );
              changes.push(
                `Moved layer "${currentLayerName}" to position ${clampedLayerPosition} for ${getTargetLabel()}.`
              );
            }
          }

          // /!\ Tell the editor that some instances have potentially been modified (and even removed).
          // This will force the instances editor to destroy and mount again the
          // renderers to avoid keeping any references to existing instances, and also drop any selection.
          onInstancesModifiedOutsideEditor({
            ...getOutsideEditorChangesTarget(resolvedScope),
          });
        } else {
          const existingLayerNames = mapFor(
            0,
            layersContainer.getLayersCount(),
            i => `"${layersContainer.getLayerAt(i).getName()}"`
          ).join(', ');

          // A deletion or rename targeting a layer that does not exist is
          // always a wrong layer name: don't create a layer out of it.
          if (delete_this_layer) {
            warnings.push(
              `Layer "${layerName}" not found in ${getTargetLabel()}: nothing was deleted. Existing layers are: ${existingLayerNames}.`
            );
            return;
          }
          if (new_layer_name) {
            warnings.push(
              `Layer "${layerName}" not found in ${getTargetLabel()}: no layer was renamed. Existing layers are: ${existingLayerNames}. To create a new layer, pass its name as "layer_name" and do not set "new_layer_name".`
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
              ? layersContainer.getLayersCount()
              : new_layer_position;
          layersContainer.insertNewLayer(layerName, insertionPosition);
          if (new_visibility !== null) {
            layersContainer.getLayer(layerName).setVisibility(new_visibility);
          }
          const newLayerNames = mapFor(
            0,
            layersContainer.getLayersCount(),
            i => `"${layersContainer.getLayerAt(i).getName()}"`
          ).join(', ');
          changes.push(
            `Layer "${layerName}" did not exist in ${getTargetLabel()}: created it at position ${insertionPosition}${
              new_visibility === null
                ? ''
                : ` (initial visibility: ${
                    new_visibility ? 'visible' : 'hidden'
                  })`
            }. Layers are now: ${newLayerNames}. If you meant to modify an existing layer, check its exact name.`
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
        if (!layersContainer.hasLayerNamed(layerName)) {
          warnings.push(`Layer "${layerName}" not found. Effects skipped.`);
          return;
        }
        const layer = layersContainer.getLayer(layerName);

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
      const groups = groupsObjectsContainer.getObjectGroups();
      changed_groups.forEach(changed_group => {
        const groupName = SafeExtractor.extractStringProperty(
          changed_group,
          'group_name'
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

        let newGroupName = SafeExtractor.extractStringProperty(
          changed_group,
          'new_group_name'
        );
        if (newGroupName === groupName) {
          // Same name means no rename: ignore it, as models often redundantly fill it.
          newGroupName = null;
        }

        const hasObjectsToAdd = !!objectsToAdd && objectsToAdd.length > 0;
        const hasObjectsToRemove =
          !!objectsToRemove && objectsToRemove.length > 0;

        let foundGroup: gdObjectGroup;
        if (!groups.has(groupName)) {
          const existingGroupNames = mapFor(
            0,
            groups.count(),
            i => `"${groups.getAt(i).getName()}"`
          ).join(', ');

          // A deletion, rename or removal targeting a group that does not exist
          // is always a wrong group name: don't create a group out of it.
          if (deleteThisGroup) {
            warnings.push(
              `Group "${groupName}" not found in ${getTargetLabel()}: nothing was deleted. Existing groups are: ${existingGroupNames ||
                '(none)'}.`
            );
            return;
          }
          if (newGroupName) {
            warnings.push(
              `Group "${groupName}" not found in ${getTargetLabel()}: no group was renamed. Existing groups are: ${existingGroupNames ||
                '(none)'}.`
            );
            return;
          }
          if (hasObjectsToRemove && !hasObjectsToAdd) {
            warnings.push(
              `Group "${groupName}" not found in ${getTargetLabel()}: no objects were removed from it. Existing groups are: ${existingGroupNames ||
                '(none)'}.`
            );
            return;
          }
          // Create the group: either objects are being added to it, or only
          // its name was given, which is a request for a new empty group
          // (events can reference it before its objects exist).
          foundGroup = groups.insertNew(groupName, groups.count());
          changes.push(`Created group "${groupName}" in ${getTargetLabel()}.`);
        } else {
          foundGroup = groups.get(groupName);
        }

        if (deleteThisGroup) {
          groups.remove(groupName);
          changes.push(
            `Deleted group "${groupName}" from ${getTargetLabel()}.`
          );
        } else {
          if (newGroupName && newGroupName !== groupName) {
            // Groups share the object namespace (across the scene AND the
            // global scope) and nothing enforces uniqueness on rename:
            // renaming onto a taken name would leave two groups (or a group
            // and an object) with the same name.
            if (
              resolveObjectsFromContextAndName({
                objectsContainer: groupsObjectsContainer,
                globalObjectsContainer: groupsGlobalObjectsContainer,
                objectOrGroupName: newGroupName,
              })
            ) {
              warnings.push(
                `An object or group named "${newGroupName}" already exists (in ${getTargetLabel()}${
                  groupsGlobalObjectsContainer ? ' or globally' : ''
                }): group "${groupName}" was NOT renamed.`
              );
            } else {
              objectOrGroupRenamedInScope(
                project,
                resolvedScope,
                foundGroup.getName(),
                newGroupName
              );
              foundGroup.setName(newGroupName);
              changes.push(
                `Renamed group "${groupName}" to "${newGroupName}" in ${getTargetLabel()}.`
              );
            }
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

            const globalObjects = groupsGlobalObjectsContainer;
            const sceneObjects = groupsObjectsContainer;

            // Capture the variables and behaviors shared in common by the group
            // (from its objects after removals, before additions), so that any
            // newly added object can be filled with them - exactly like the
            // object group editor does. This keeps an object added to a group
            // consistent with the rest of the group (which is the "intersection"
            // of its objects: it shows the variables and behaviors in common).
            const {
              accessor,
              dispose,
            } = makeScopeProjectScopedContainersAccessor(
              project,
              resolvedScope,
              null
            );
            let groupVariablesContainer;
            try {
              groupVariablesContainer = gd.ObjectRefactorer.mergeVariableContainers(
                accessor.get().getObjectsContainersList(),
                foundGroup
              );
            } finally {
              dispose();
            }
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
                    project.getCurrentPlatform(),
                    globalObjects || sceneObjects,
                    sceneObjects,
                    object,
                    foundGroup,
                    behaviorName
                  );
                }
              } else {
                warnings.push(
                  `Object "${objectName}" not found in ${getTargetLabel()}, so it was not added to group "${groupName}".`
                );
              }
            });

            const finalObjectNames = foundGroup
              .getAllObjectsNames()
              .toJSArray();
            changes.push(
              `Group "${groupName}" in ${getTargetLabel()} now contains ${
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

      // The named variants of a custom object inherit the groups of the
      // default variant.
      complyVariantsAfterStructuralEdit(project, resolvedScope);

      // Notify the editor that object groups have been modified
      onObjectGroupsModifiedOutsideEditor({
        ...getOutsideEditorChangesTarget(resolvedScope),
      });
    }

    if (changes.length === 0 && warnings.length === 0) {
      return makeNothingChangedOutput({
        toolsVersion,
        message:
          'Nothing changed: the requested values are already the current ones, or nothing was requested.',
      });
    } else if (changes.length === 0 && warnings.length > 0) {
      return makeNothingChangedOutput({
        toolsVersion,
        message: 'Nothing changed. See warnings.',
        warnings: warnings.join('\n'),
      });
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
          // Only expose what the AI can act on: `file`/`originIdentifier` are
          // internal URLs easily mistaken for asset store IDs, `metadata` is
          // editor-internal (and can be huge), `originName` is provenance only.
          return {
            name: resourceName,
            kind: resource.getKind(),
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
  launchFunction: async ({ project, args, toolsVersion }) => {
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
          const parsedBoolean = parseBoolean(newValue);
          if (!parsedBoolean.valid) {
            warnings.push(
              `Invalid adaptGameResolutionAtRuntime: "${newValue}". Must be "true" or "false". Skipped.`
            );
            return;
          }
          const adapt = parsedBoolean.value;
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
          const parsedBoolean = parseBoolean(newValue);
          if (!parsedBoolean.valid) {
            warnings.push(
              `Invalid pixelsRounding: "${newValue}". Must be "true" or "false". Skipped.`
            );
            return;
          }
          const pixelsRounding = parsedBoolean.value;
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
          // An empty value is valid and documented: it means "the first
          // scene of the project".
          if (newValue !== '' && !project.hasLayoutNamed(newValue)) {
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
            newValue === ''
              ? 'Reset firstLayout: the first scene of the project will be loaded when the game starts.'
              : `Set "${newValue}" as the first scene loaded when the game starts (firstLayout).`
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

          // The objects scan above misses usages in events (e.g. a "Play
          // sound" action), layer effects, etc.: scan the whole project too,
          // so a still-used resource is never silently deleted.
          const resourcesInUse = new gd.ResourcesInUseHelper(resourcesManager);
          gd.ResourceExposer.exposeWholeProjectResources(
            project,
            resourcesInUse
          );
          const isResourceUsedInProject = resourcesInUse
            .getAllResources()
            .toJSArray()
            .includes(resourceName);
          resourcesInUse.delete();

          if (isResourceUsedInProject) {
            warnings.push(
              `Resource "${resourceName}" was NOT deleted because it is still used by the project (e.g. in events, like a "Play sound" action, or in effects). Do NOT modify or update these to force the deletion. Stop and report the problem instead, so the user can decide what to do.`
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

    return makeMultipleChangesOutput(changes, warnings, toolsVersion);
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

const ALL_VARIABLE_SCOPES = ['scene', 'object', 'group', 'instance', 'global'];

// The `variable_scope` values a scope other than a scene can serve, and how to
// get the ones it can't.
const makeVariableScopeNotAvailableMessage = (
  resolvedScope: ResolvedScope,
  variable_scope: string
): string =>
  resolvedScope.scope.type === 'extension'
    ? `variable_scope "${variable_scope}" is not available in ${
        resolvedScope.label
      }: use "scene" or "global" (the extension variables).`
    : `variable_scope "${variable_scope}" is not available in ${
        resolvedScope.label
      }: use "object", "group" or "instance" (for the variables of the project, use scope { type: "project" } with variable_scope "global").`;

// Resolve a variable scope to the variables container(s) to act on. A group
// resolves to the container of every object in it (a group variable is shared
// by all of them); `object` and `group` are equivalent (resolved to whichever
// exists). Returns a `failure` output to forward when the scope is invalid.
const resolveVariablesContainers = ({
  project,
  resolvedScope,
  variable_scope,
  object_name,
  instance_id,
}: {|
  project: gdProject,
  resolvedScope: ResolvedScope,
  variable_scope: string,
  object_name: ?string,
  instance_id: ?string,
|}): VariablesContainersResolution => {
  const fail = (message: string): VariablesContainersResolution => ({
    failure: makeGenericFailure(message),
    variablesContainers: [],
    scopeDescription: '',
  });

  if (!ALL_VARIABLE_SCOPES.includes(variable_scope)) {
    return fail(
      `Invalid "variable_scope": "${variable_scope}". Use \`scene\`, \`object\`, \`group\`, \`instance\` or \`global\`.`
    );
  }

  const { scope, label, eventsFunctionsExtension } = resolvedScope;

  // An extension owns two variables containers of its own, and nothing else.
  if (scope.type === 'extension' && eventsFunctionsExtension) {
    if (variable_scope === 'scene' || variable_scope === 'global') {
      return {
        failure: null,
        variablesContainers: [
          variable_scope === 'scene'
            ? eventsFunctionsExtension.getSceneVariables()
            : eventsFunctionsExtension.getGlobalVariables(),
        ],
        scopeDescription: `${label} ${variable_scope} variables`,
      };
    }
    return fail(
      makeVariableScopeNotAvailableMessage(resolvedScope, variable_scope)
    );
  }

  // The children of a custom object see no scene nor global variables.
  if (
    scope.type === 'custom_object_variant' &&
    (variable_scope === 'scene' || variable_scope === 'global')
  ) {
    return fail(
      makeVariableScopeNotAvailableMessage(resolvedScope, variable_scope)
    );
  }

  if (variable_scope === 'global') {
    return {
      failure: null,
      variablesContainers: [project.getVariables()],
      scopeDescription: 'global',
    };
  }

  if (variable_scope === 'instance') {
    const { initialInstances } = resolvedScope;
    if (!initialInstances) {
      return fail(`Missing "scene_name" (required for instance variables).`);
    }
    const instanceId = instance_id ? instance_id.trim() : '';
    if (!instanceId) {
      return fail(
        `Missing "instance_id" (required for instance variables) - get it from \`describe_instances\` (the \`id\` field of each instance).`
      );
    }

    let wrongObjectDescription = null;
    // The id is a prefix of the instance persistent uuid (like everywhere
    // else, see `describe_instances`) - it normally matches a single
    // instance.
    const matchedInstances: Array<gdInitialInstance> = [];
    iterateOnInstances(initialInstances, instance => {
      if (!instance.getPersistentUuid().startsWith(instanceId)) return;
      if (object_name && instance.getObjectName() !== object_name) {
        wrongObjectDescription = `"${instanceId}" (instance of "${instance.getObjectName()}")`;
        return;
      }
      matchedInstances.push(instance);
    });

    if (object_name && wrongObjectDescription) {
      return fail(
        `This instance id is not an instance of object "${object_name}": ${wrongObjectDescription}. Nothing was changed. Pass the right \`object_name\` (or omit it), or fix the id using \`describe_instances\`.`
      );
    }
    if (matchedInstances.length === 0) {
      return fail(
        `No instance with id "${instanceId}" found in ${label}. Nothing was changed. Call \`describe_instances\` to get valid ids (the \`id\` field of each instance).`
      );
    }

    const instancesLabel = matchedInstances
      .map(
        instance =>
          `"${instance
            .getPersistentUuid()
            .slice(0, 10)}" (${instance.getObjectName()})`
      )
      .join(', ');
    return {
      failure: null,
      variablesContainers: matchedInstances.map(instance =>
        instance.getVariables()
      ),
      scopeDescription: `instance${
        matchedInstances.length > 1 ? 's' : ''
      } ${instancesLabel} of ${label}`,
    };
  }

  if (variable_scope === 'scene') {
    const { layout } = resolvedScope;
    if (!layout) {
      return fail(`Missing "scene_name" (required for scene variable).`);
    }
    return {
      failure: null,
      variablesContainers: [layout.getVariables()],
      scopeDescription: label,
    };
  }

  // `object` and `group`: the objects of the scope (a scene, the global
  // objects, the children of a custom object variant).
  if (!object_name) {
    return fail(
      `Missing "object_name" (required for an object or group variable).`
    );
  }
  const { objectsContainer, globalObjectsContainer } = resolvedScope;
  const concerned = objectsContainer
    ? resolveObjectsFromContextAndName({
        objectsContainer,
        globalObjectsContainer: globalObjectsContainer || null,
        objectOrGroupName: object_name,
      })
    : null;
  if (!concerned) {
    const childObjectNames = objectsContainer
      ? getObjectNames(objectsContainer).map(name => `"${name}"`)
      : [];
    return fail(
      scope.type === 'scene'
        ? `Object or group "${object_name}" not in ${label}. For a global object, omit scene_name.`
        : scope.type === 'project'
        ? `Object or group "${object_name}" not found globally. Did you forget to specify scene_name?`
        : `Object or group "${object_name}" not found in ${label}. Existing child objects: ${
            childObjectNames.length > 0 ? childObjectNames.join(', ') : 'none'
          }.`
    );
  }
  const concernedObjects = concerned.objects;
  if (concernedObjects.length === 0) {
    return fail(`Group "${object_name}" has no object.`);
  }

  const objectOrGroupLabel = concerned.group
    ? `group "${object_name}"`
    : `object "${object_name}"`;
  return {
    failure: null,
    variablesContainers: concernedObjects.map(object => object.getVariables()),
    scopeDescription:
      scope.type === 'project'
        ? `global ${objectOrGroupLabel}`
        : `${label} ${objectOrGroupLabel}`,
  };
};

// True when the variable does not exist yet in at least one of the containers:
// writing it would ADD it (a structural change on a custom object child).
const isVariableMissingInSomeContainer = (
  variablesContainers: Array<gdVariablesContainer>,
  variablePath: string
): boolean =>
  variablesContainers.some(variablesContainer => {
    try {
      return !getVariableAtPath({ variablePath, variablesContainer });
    } catch (error) {
      // A malformed path is reported when the change is applied.
      return false;
    }
  });

// The scope label to show in the chat for a call that is not about a scene,
// or null when the legacy scene texts apply (a scene, or no scope at all).
const getNonSceneScopeLabelFromArgs = (args: any): string | null => {
  if (getSceneNameFromArgs(args)) return null;
  const label = getScopeLabelFromArgs(args);
  return label === 'unknown scope' ? null : label;
};

const addOrEditVariable: EditorFunction = {
  renderForEditor: ({ args, shouldShowDetails }) => {
    const variable_scope = extractRequiredString(args, 'variable_scope');
    const object_name = SafeExtractor.extractStringProperty(
      args,
      'object_name'
    );
    const scene_name = getSceneNameFromArgs(args);
    const nonSceneScopeLabel = getNonSceneScopeLabelFromArgs(args);
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

    const variableNames = operations
      .map(operation => operation.variable_name_or_path)
      .filter(Boolean)
      .join(', ');

    // Variables of an extension or of a custom object: name the scope instead
    // of a scene.
    if (nonSceneScopeLabel) {
      return {
        text: (
          <Trans>
            Update variables <b>{variableNames}</b> of {nonSceneScopeLabel}.
          </Trans>
        ),
        details,
        hasDetailsToShow: true,
      };
    }

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
      } else if (variable_scope === 'instance') {
        return {
          text: (
            <Trans>
              Set variable <b>{variable_name_or_path}</b> on an instance of
              scene {scene_name}.
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
    } else if (variable_scope === 'instance') {
      return {
        text: (
          <Trans>
            Update variables <b>{variableNames}</b> on an instance of scene{' '}
            {scene_name}.
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
    const instance_id = SafeExtractor.extractStringProperty(
      args,
      'instance_id'
    );
    const operations = extractVariableOperations(args);
    if (operations.length === 0) {
      return makeGenericFailure(
        `No variable to change (the "variables" list is empty).`
      );
    }

    const resolvedScope = resolveScopeFromArgs(project, args, {
      allowedTypes: ['project', 'scene', 'extension', 'custom_object_variant'],
      // Without a scope, the variables are the ones of the project.
      defaultScope: { type: 'project' },
    });
    if (resolvedScope.success === false)
      return makeScopeFailureOutput(resolvedScope);
    const readOnlyRejection = getReadOnlyRejection(resolvedScope);
    if (readOnlyRejection) return makeScopeFailureOutput(readOnlyRejection);

    const resolved = resolveVariablesContainers({
      project,
      resolvedScope,
      variable_scope,
      object_name,
      instance_id,
    });
    if (resolved.failure) return resolved.failure;
    const { variablesContainers, scopeDescription } = resolved;

    // Adding or deleting a variable of a child object changes the structure
    // of the custom object: only the default variant owns it.
    const isChildObjectVariableScope =
      !!resolvedScope.variant &&
      (variable_scope === 'object' || variable_scope === 'group');
    if (isChildObjectVariableScope) {
      const namedVariantRejection = getNamedVariantRejection(resolvedScope);
      if (
        namedVariantRejection &&
        operations.some(
          operation =>
            !!operation.variable_name_or_path &&
            (operation.delete_this_variable ||
              isVariableMissingInSomeContainer(
                variablesContainers,
                operation.variable_name_or_path
              ))
        )
      ) {
        return makeScopeFailureOutput(namedVariantRejection);
      }
    }
    let didChangeChildVariablesStructure = false;

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
        // A malformed path throws: report it for this item only, so the other
        // items of the batch are still applied and reported.
        try {
          for (const variablesContainer of variablesContainers) {
            const result = applyVariableDeletion({
              variablePath: variable_name_or_path,
              variablesContainer,
            });
            removed = removed || result.removed;
          }
        } catch (error) {
          warnings.push(
            `Could not delete ${scopeDescription} variable "${variable_name_or_path}": ${
              error.message
            }`
          );
          continue;
        }
        if (removed) {
          if (isChildObjectVariableScope)
            didChangeChildVariablesStructure = true;
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
      // A malformed path or invalid value throws: report it for this item
      // only, so the other items of the batch are still applied and reported.
      try {
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
      } catch (error) {
        warnings.push(
          `Could not change ${scopeDescription} variable "${variable_name_or_path}": ${
            error.message
          }`
        );
        continue;
      }

      if (addedNewVariable && isChildObjectVariableScope)
        didChangeChildVariablesStructure = true;

      const truncatedValue = truncateValue(value);
      changes.push(
        addedNewVariable
          ? `Added ${scopeDescription} variable "${variable_name_or_path}" (${variableType}) = ${truncatedValue}`
          : `Edited ${scopeDescription} variable "${variable_name_or_path}" = ${truncatedValue}`
      );
    }

    // The named variants inherit the variables of the children of the
    // default variant.
    if (didChangeChildVariablesStructure) {
      complyVariantsAfterStructuralEdit(project, resolvedScope);
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
    const scene_name = getSceneNameFromArgs(args);
    const nonSceneScopeLabel = getNonSceneScopeLabelFromArgs(args);

    if (
      nonSceneScopeLabel &&
      (variable_scope === 'object' || variable_scope === 'group')
    ) {
      return {
        text: (
          <Trans>
            Inspect <b>{object_name}</b>'s variables in {nonSceneScopeLabel}.
          </Trans>
        ),
      };
    } else if (variable_scope === 'object' || variable_scope === 'group') {
      return {
        text: (
          <Trans>
            Inspect <b>{object_name}</b>'s variables.
          </Trans>
        ),
      };
    } else if (nonSceneScopeLabel) {
      return {
        text: <Trans>Inspect the variables of {nonSceneScopeLabel}.</Trans>,
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
    const requestedPaths = (
      SafeExtractor.extractArrayProperty(args, 'variable_names_or_paths') || []
    )
      .map(entry => (typeof entry === 'string' ? entry : null))
      .filter(Boolean);

    const resolvedScope = resolveScopeFromArgs(project, args, {
      allowedTypes: ['project', 'scene', 'extension', 'custom_object_variant'],
      // Without a scope, the variables are the ones of the project.
      defaultScope: { type: 'project' },
    });
    if (resolvedScope.success === false)
      return makeScopeFailureOutput(resolvedScope);

    const resolved = resolveVariablesContainers({
      project,
      resolvedScope,
      variable_scope,
      object_name,
      instance_id: SafeExtractor.extractStringProperty(args, 'instance_id'),
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

const runTests: EditorFunction = {
  renderForEditor: ({ args }) => {
    const newTest = SafeExtractor.extractObjectProperty(args, 'new_test');
    const newTestName = newTest
      ? SafeExtractor.extractStringProperty(newTest, 'name')
      : null;
    if (newTestName) {
      return {
        text: <Trans>Running the gameplay test {newTestName}.</Trans>,
      };
    }
    return {
      text: <Trans>Running gameplay tests.</Trans>,
    };
  },
  launchFunction: async ({ args }) => {
    return makeGenericFailure(
      `Unable to run gameplay tests - this is handled server-side.`
    );
  },
  modifiesProject: false,
};

const readGameProjectJson: EditorFunction = {
  renderForEditor: ({ args }) => {
    return {
      text: <Trans>Inspect the game structure.</Trans>,
    };
  },
  launchFunction: async ({ project, args }) => {
    const simplifiedProject = makeSimplifiedProjectBuilder(
      gd
    ).getSimplifiedProject(project, {});

    // An empty path returns the whole project (limited by maxDepth anyway).
    const path =
      typeof (args && args.path) === 'string' ? String(args.path) : '';
    const filter: ArrayItemsFilter | null =
      args && args.filter && typeof args.filter === 'object'
        ? args.filter
        : null;
    const maxDepth =
      args && typeof args.maxDepth === 'number' ? args.maxDepth : 2;
    const maxStringLength =
      args && typeof args.maxStringLength === 'number'
        ? args.maxStringLength
        : 200;
    const offset = args && typeof args.offset === 'number' ? args.offset : 0;
    const limit =
      args && typeof args.limit === 'number' ? args.limit : undefined;
    const countOnly = !!(args && args.countOnly === true);

    const navigationResult = navigateSimplifiedProjectJson({
      project: simplifiedProject,
      path,
      filter,
      offset,
      limit,
      countOnly,
      maxDepth,
      maxStringLength,
    });

    if (!navigationResult.success) {
      return { success: false, message: navigationResult.message };
    }

    if (navigationResult.truncationWarning) {
      return {
        success: true,
        result: navigationResult.result,
        message: navigationResult.truncationWarning,
      };
    }
    return { success: true, result: navigationResult.result };
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

/**
 * Script-based agents (v12+): runs a JavaScript script written by the AI, in
 * which the client-side editor functions are exposed as plain async functions
 * (see `ScriptExecution/`). Replaces N discrete tool calls by one. The script's
 * calls use the SAME implementations and collaborators bag as individual tool
 * calls, so behavior (including the coalesced `on*ModifiedOutsideEditor`
 * refresh) is identical. `modifiesProject: true` so the whole script is gated
 * behind one edit approval when auto-edit is off.
 */
const runScript: EditorFunction = {
  renderForEditor: ({ args }) => {
    const title =
      args && typeof args.title === 'string' && args.title
        ? args.title
        : 'Run a script';
    // The rich per-record view is rendered by `RunScriptFunctionCallRow`; here
    // we only provide the user-facing title (used e.g. for the approval label).
    return { text: title, hasDetailsToShow: false };
  },
  launchFunction: async ({ args, project, ...launchOptions }) => {
    const jsCode =
      args && typeof args.js_code === 'string' ? args.js_code : null;
    if (!jsCode) {
      return {
        success: false,
        message:
          'run_script requires a `js_code` string argument (the JavaScript to run).',
      };
    }

    // Explorer sub-agent scripts are read-only: expose only non-mutating
    // functions so a script can't modify the project (defense in depth; matches
    // the backend's explorer script-function list). Signaled by the caller via
    // `runScriptReadOnly` in the collaborators bag.
    const allowedFunctionNames = launchOptions.runScriptReadOnly
      ? [
          ...Object.keys(editorFunctions).filter(
            name => !editorFunctions[name].modifiesProject
          ),
          ...Object.keys(editorFunctionsWithoutProject).filter(
            name => !editorFunctionsWithoutProject[name].modifiesProject
          ),
        ]
      : null;

    const exposedFunctions = buildExposedScriptFunctions({
      editorFunctions,
      editorFunctionsWithoutProject,
      launchOptions,
      project,
      allowedFunctionNames,
    });

    const result = await executeScript({ jsCode, exposedFunctions });
    const capped = capScriptExecutionResult(result);

    return {
      success: capped.success,
      functionCallRecords: capped.functionCallRecords,
      consoleLogs: capped.consoleLogs,
      returnValue: capped.returnValue,
      error: capped.error,
      meta: {
        didModifyProject: capped.didModifyProject,
        // Forward scene names created inside the script so they auto-open, like
        // a standalone create_scene call does.
        ...(capped.newSceneNames.length > 0
          ? { newSceneNames: capped.newSceneNames }
          : {}),
      },
    };
  },
  modifiesProject: true,
};

const searchResourceStore: EditorFunction = {
  renderForEditor: ({ args }) => {
    const resourceKind = SafeExtractor.extractStringProperty(
      args,
      'resource_kind'
    );
    if (resourceKind === 'audio') {
      return {
        text: <Trans>Searching audio files in the resource store.</Trans>,
      };
    }
    if (resourceKind === 'font') {
      return {
        text: <Trans>Searching fonts in the resource store.</Trans>,
      };
    }
    return {
      text: <Trans>Searching the resource store.</Trans>,
    };
  },
  launchFunction: async ({ args }) => {
    return makeGenericFailure(
      `Unable to search the resource store - this is handled server-side.`
    );
  },
  modifiesProject: false,
};

export const editorFunctions: { [string]: EditorFunction } = {
  run_script: runScript,
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
  read_events_source: readEventsSource,
  add_scene_events: addSceneEvents,
  create_scene: createScene,
  inspect_scene_properties_layers_effects: inspectScenePropertiesLayersEffects,
  change_scene_properties_layers_effects_groups: changeScenePropertiesLayersEffectsGroups,
  inspect_project_properties_resources: inspectProjectPropertiesResources,
  change_project_properties_resources: changeProjectPropertiesResources,
  add_or_edit_variable: addOrEditVariable,
  inspect_variables: inspectVariables,
  inspect_extension: inspectExtension,
  create_extension: createExtension,
  change_extension_properties: changeExtensionProperties,
  create_custom_object: createCustomObject,
  change_custom_object: changeCustomObject,
  create_custom_behavior: createCustomBehavior,
  change_custom_behavior: changeCustomBehavior,
  create_custom_function: createCustomFunction,
  change_custom_function: changeCustomFunction,
  read_full_docs: readFullDocs,
  search_docs: searchDocs,

  create_or_update_plan: createOrUpdatePlan,

  run_explorer_agent: runExplorerAgent,
  run_edit_agent: runEditAgent,
  run_tests: runTests,
  run_gameplay_test: runGameplayTest,
  change_gameplay_tests: changeGameplayTests,
  read_game_project_json: readGameProjectJson,
  search_object_asset_store: searchObjectAssetStore,
  search_resource_store: searchResourceStore,

  generate_events: addSceneEvents,

  report_fulfilment_problem: reportFulfilmentProblem,
};

export const editorFunctionsWithoutProject: {
  [string]: EditorFunctionWithoutProject,
} = {
  initialize_project: initializeProject,
  get_game_starter_summary: getGameStarterSummary,
};
