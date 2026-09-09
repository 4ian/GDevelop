// @flow
import { mapFor } from '../Utils/MapFor';
import { ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { isExtensionFromStore } from './SimplifiedProject/SimplifiedExtensions';
import { type OutsideEditorChangesTarget } from './OutsideEditorChanges';

const gd: libGDevelop = global.gd;

/**
 * The `scope` argument shared by the editor functions: which container of the
 * project a call applies to (a scene, the instances of an external layout, an
 * extension, a custom object or behavior, a variant of a custom object).
 * Mirrors `gdevelop-tool-scope.js` in the backend (GDevelop-services): keep
 * the rules and the messages in sync.
 *
 * `external_events` is reserved: no function accepts it yet.
 */
export type ToolScopeType =
  | 'project'
  | 'scene'
  | 'external_layout'
  | 'external_events'
  | 'extension'
  | 'custom_behavior'
  | 'custom_object'
  | 'custom_object_variant';

export type ToolScope = {|
  type: ToolScopeType,
  scene_name?: string,
  external_layout_name?: string,
  external_events_name?: string,
  extension_name?: string,
  custom_behavior_name?: string,
  custom_object_name?: string,
  variant_name?: string,
|};

export type ScopeFailure = {| success: false, message: string |};

/** Everything a function needs from a resolved scope, or null when the scope has no such thing. */
export type ResolvedScope = {|
  success: true,
  scope: ToolScope,
  // 'scene "Level"', 'custom object "UI::Dialog" (default variant)'...
  label: string,
  layout: ?gdLayout,
  externalLayout: ?gdExternalLayout,
  eventsFunctionsExtension: ?gdEventsFunctionsExtension,
  eventsBasedBehavior: ?gdEventsBasedBehavior,
  eventsBasedObject: ?gdEventsBasedObject,
  // `eventsBasedObject.getDefaultVariant()` for the default variant ("").
  variant: ?gdEventsBasedObjectVariant,
  isDefaultVariant: boolean,
  objectsContainer: ?gdObjectsContainer,
  // The global objects, visible from a scene. Null inside custom objects
  // (children only see each other) and for the project scope (the global
  // objects are then `objectsContainer`).
  globalObjectsContainer: ?gdObjectsContainer,
  initialInstances: ?gdInitialInstancesContainer,
  layersContainer: ?gdLayersContainer,
  // Set for extensions installed from the store: every mutation must refuse
  // with this message.
  readOnlyReason: ?string,
|};

/**
 * Whether an object or behavior type (`Ext::Name`) comes from an extension of
 * the project: its metadata may be stale until the extensions are regenerated.
 */
export const isTypeOfProjectExtension = (
  project: gdProject,
  type: string
): boolean =>
  type.includes('::') &&
  project.hasEventsFunctionsExtensionNamed(type.split('::')[0]);

/** The scopes holding objects: a scene, or a variant of a custom object (its child objects). */
export const OBJECTS_SCOPE_TYPES: Array<ToolScopeType> = [
  'scene',
  'custom_object_variant',
];

export const ALL_SCOPE_TYPES: Array<ToolScopeType> = [
  'project',
  'scene',
  'external_layout',
  'external_events',
  'extension',
  'custom_behavior',
  'custom_object',
  'custom_object_variant',
];

/** The identifying fields each scope type requires, in order. */
const SCOPE_FIELDS_BY_TYPE: { [ToolScopeType]: Array<string> } = {
  project: [],
  scene: ['scene_name'],
  external_layout: ['external_layout_name'],
  external_events: ['external_events_name'],
  extension: ['extension_name'],
  custom_behavior: ['extension_name', 'custom_behavior_name'],
  custom_object: ['extension_name', 'custom_object_name'],
  custom_object_variant: [
    'extension_name',
    'custom_object_name',
    'variant_name',
  ],
};

export const BOTH_GIVEN_DISAGREE_MESSAGE =
  'Both scene_name and scope were given and they disagree: pass only scope.';
export const EXTERNAL_EVENTS_NOT_SUPPORTED_MESSAGE =
  'external_events is not supported yet';
// Structural edits (children, behaviors, variables of children, groups) only
// happen on the default variant: the named variants inherit them.
export const NAMED_VARIANT_REJECTED_MESSAGE =
  'Do this on the default variant (variant_name: "") - named variants inherit it';

/**
 * The explanation given when an AI tool would change an extension installed
 * from the extension store: the tools leave those alone (the user can still
 * edit them in the editor, at the cost of the store updates). The backend
 * explains the same rule in its own words.
 */
export const makeStoreExtensionReadOnlyMessage = (
  extensionName: string
): string =>
  `"${extensionName}" is installed from the GDevelop extension store and updated from there: it is read-only for the AI tools (the editor can edit it, but the changes would be lost at the next update). ` +
  `To customize: (a) custom object → create your own custom object holding an instance of "${extensionName}::<Obj>" as a child and forward the functions you need (\`change_custom_object.forward_child_object_functions\`); ` +
  `(b) behavior → create your own behavior with a \`Behavior\` property requiring "${extensionName}::<Behavior>" and call it from your functions; ` +
  `(c) functions → call "${extensionName}::<Fn>" from a function of your own extension. ` +
  `Last resort: \`create_extension({ duplicated_extension_name: "${extensionName}" })\` gives you an editable copy (it will no longer receive store updates).`;

const isToolScopeType = (value: mixed): boolean =>
  typeof value === 'string' && ALL_SCOPE_TYPES.includes((value: any));

const listAllowedTypes = (allowedTypes: Array<ToolScopeType>): string =>
  allowedTypes.map(type => `"${type}"`).join(', ');

/**
 * Read the `scope` argument of a call, mapping the legacy `scene_name` to
 * `{ type: 'scene', scene_name }` when `scope` is absent. Throws with a
 * teaching message on an invalid scope (the runner turns it into a failed
 * call); returns null when neither is given.
 */
export const parseScopeArgument = (
  args: any,
  {
    allowedTypes,
    legacySceneNameField,
  }: {|
    allowedTypes: Array<ToolScopeType>,
    legacySceneNameField?: string,
  |}
): ToolScope | null => {
  if (!args || typeof args !== 'object') return null;
  const legacySceneName = args[legacySceneNameField || 'scene_name'];
  const hasLegacySceneName =
    typeof legacySceneName === 'string' && legacySceneName !== '';
  const rawScope = args.scope;

  if (rawScope === undefined || rawScope === null) {
    return hasLegacySceneName
      ? { type: 'scene', scene_name: legacySceneName }
      : null;
  }
  if (typeof rawScope !== 'object' || Array.isArray(rawScope)) {
    throw new Error(
      '`scope` must be an object like { type: "scene", scene_name: "MyScene" }.'
    );
  }
  if (!isToolScopeType(rawScope.type)) {
    throw new Error(
      `\`scope.type\` must be one of: ${listAllowedTypes(allowedTypes)}.`
    );
  }
  const type: ToolScopeType = (rawScope.type: any);
  if (type === 'external_events') {
    throw new Error(EXTERNAL_EVENTS_NOT_SUPPORTED_MESSAGE);
  }
  if (!allowedTypes.includes(type)) {
    throw new Error(
      `\`scope.type\` "${type}" is not accepted here: use one of ${listAllowedTypes(
        allowedTypes
      )}.`
    );
  }
  if (
    hasLegacySceneName &&
    (type !== 'scene' || rawScope.scene_name !== legacySceneName)
  ) {
    throw new Error(BOTH_GIVEN_DISAGREE_MESSAGE);
  }

  const scope: ToolScope = { type };
  const fields: Array<string> = SCOPE_FIELDS_BY_TYPE[type];
  for (const field of fields) {
    const value: mixed = rawScope[field];
    // Only `variant_name` may be empty ("" is the default variant).
    if (
      typeof value !== 'string' ||
      (value === '' && field !== 'variant_name')
    ) {
      throw new Error(
        `\`scope\` of type "${type}" requires ${fields
          .map((requiredField: string) => `\`${requiredField}\``)
          .join(' and ')}.`
      );
    }
    // $FlowFixMe[prop-missing] - the fields are the ones of the type.
    scope[field] = value;
  }
  return scope;
};

/**
 * Like `parseScopeArgument`, but a missing scope is an error (or the given
 * default: the functions that used to work without `scene_name`, on the
 * project, keep doing so).
 */
export const requireScopeArgument = (
  args: any,
  {
    allowedTypes,
    legacySceneNameField,
    defaultScope,
  }: {|
    allowedTypes: Array<ToolScopeType>,
    legacySceneNameField?: string,
    defaultScope?: ToolScope,
  |}
): ToolScope => {
  const scope = parseScopeArgument(args, {
    allowedTypes,
    legacySceneNameField,
  });
  if (scope) return scope;
  if (defaultScope) return defaultScope;
  throw new Error(
    `Missing \`scope\`: pass { type: ${allowedTypes
      .map(type => `"${type}"`)
      .join(' | ')}, ...name fields } to say where to work.`
  );
};

/** A short human-readable label of a scope, for messages. Same texts as the backend. */
export const getScopeLabel = (scope: ToolScope): string => {
  switch (scope.type) {
    case 'project':
      return 'the project';
    case 'scene':
      return `scene "${scope.scene_name || ''}"`;
    case 'external_layout':
      return `external layout "${scope.external_layout_name || ''}"`;
    case 'external_events':
      return `external events "${scope.external_events_name || ''}"`;
    case 'extension':
      return `extension "${scope.extension_name || ''}"`;
    case 'custom_behavior':
      return `custom behavior "${scope.extension_name ||
        ''}::${scope.custom_behavior_name || ''}"`;
    case 'custom_object':
      return `custom object "${scope.extension_name ||
        ''}::${scope.custom_object_name || ''}"`;
    case 'custom_object_variant':
      return `custom object "${scope.extension_name ||
        ''}::${scope.custom_object_name || ''}" (${
        scope.variant_name
          ? `variant "${scope.variant_name}"`
          : 'default variant'
      })`;
    default:
      return 'unknown scope';
  }
};

/**
 * The label of the scope of a call for the chat rendering: never throws
 * (the arguments may be anything), falls back to the legacy `scene_name`.
 */
export const getScopeLabelFromArgs = (args: any): string => {
  try {
    const scope = parseScopeArgument(args, { allowedTypes: ALL_SCOPE_TYPES });
    if (scope) return getScopeLabel(scope);
  } catch (error) {
    // Malformed: fall through to the legacy field.
  }
  const sceneName =
    args && typeof args.scene_name === 'string' ? args.scene_name : '';
  return sceneName ? `scene "${sceneName}"` : 'unknown scope';
};

/** The scene name of a call for the chat rendering, or "" (legacy renderers). */
export const getSceneNameFromArgs = (args: any): string => {
  try {
    const scope = parseScopeArgument(args, { allowedTypes: ALL_SCOPE_TYPES });
    if (scope && scope.type === 'scene') return scope.scene_name || '';
  } catch (error) {
    // Malformed: nothing to show.
  }
  return '';
};

/** A function of an extension, as named in messages and opened in the editor. */
export type FunctionTarget = {|
  // `Ext::Fn` for a free function, `Ext::Beh.Fn` / `Ext::Obj.Fn` for the
  // functions of a custom behavior or custom object.
  functionReference: string,
  extensionName: string,
  functionName: string,
  behaviorName?: string,
  objectName?: string,
|};

/**
 * The function a call works in, from its (raw) arguments: how to name it and
 * what is needed to open it in the extension editor. Null when the call is
 * not about a function of an extension. Never throws (the arguments may be
 * anything): the chat rendering uses it.
 */
export const getFunctionTargetFromArgs = (args: any): FunctionTarget | null => {
  const functionName =
    args && typeof args.function_name === 'string' ? args.function_name : '';
  if (!functionName) return null;

  let scope = null;
  try {
    scope = parseScopeArgument(args, { allowedTypes: ALL_SCOPE_TYPES });
  } catch (error) {
    // Malformed: nothing to open.
    return null;
  }
  if (!scope || !scope.extension_name) return null;

  const extensionName = scope.extension_name;
  const behaviorName =
    scope.type === 'custom_behavior' ? scope.custom_behavior_name : undefined;
  const objectName =
    scope.type === 'custom_object' ? scope.custom_object_name : undefined;
  const ownerName = behaviorName || objectName || '';
  return {
    functionReference: ownerName
      ? `${extensionName}::${ownerName}.${functionName}`
      : `${extensionName}::${functionName}`,
    extensionName,
    functionName,
    behaviorName,
    objectName,
  };
};

// ---------------------------------------------------------------------------
// Resolution against the project.
// ---------------------------------------------------------------------------

const listNames = (names: Array<string>): string =>
  names.length > 0 ? names.map(name => `"${name}"`).join(', ') : 'none';

export const getSceneNotFoundMessage = (
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

export const getExtensionNames = (project: gdProject): Array<string> =>
  mapFor(0, project.getEventsFunctionsExtensionsCount(), i =>
    project.getEventsFunctionsExtensionAt(i).getName()
  );

export const getNamedVariantNames = (
  eventsBasedObject: gdEventsBasedObject
): Array<string> => {
  const variants = eventsBasedObject.getVariants();
  return mapFor(0, variants.getVariantsCount(), i =>
    variants.getVariantAt(i).getName()
  );
};

const makeFailure = (message: string): ScopeFailure => ({
  success: false,
  message,
});

const makeEmptyResolvedScope = (scope: ToolScope): ResolvedScope => ({
  success: true,
  scope,
  label: getScopeLabel(scope),
  layout: null,
  externalLayout: null,
  eventsFunctionsExtension: null,
  eventsBasedBehavior: null,
  eventsBasedObject: null,
  variant: null,
  isDefaultVariant: false,
  objectsContainer: null,
  globalObjectsContainer: null,
  initialInstances: null,
  layersContainer: null,
  readOnlyReason: null,
});

/**
 * Resolve a scope to the containers of the project it designates, or a
 * failure listing what exists (the same "not found" style as the scenes).
 */
export const resolveScope = (
  project: gdProject,
  scope: ToolScope
): ResolvedScope | ScopeFailure => {
  const base = makeEmptyResolvedScope(scope);

  if (scope.type === 'project') {
    return { ...base, objectsContainer: project.getObjects() };
  }
  if (scope.type === 'scene') {
    const sceneName = scope.scene_name || '';
    if (!project.hasLayoutNamed(sceneName)) {
      return makeFailure(getSceneNotFoundMessage(project, sceneName));
    }
    const layout = project.getLayout(sceneName);
    return {
      ...base,
      layout,
      objectsContainer: layout.getObjects(),
      globalObjectsContainer: project.getObjects(),
      initialInstances: layout.getInitialInstances(),
      layersContainer: layout.getLayers(),
    };
  }
  if (scope.type === 'external_layout') {
    const externalLayoutName = scope.external_layout_name || '';
    if (!project.hasExternalLayoutNamed(externalLayoutName)) {
      return makeFailure(
        `External layout not found: "${externalLayoutName}". External layouts in this project: ${listNames(
          mapFor(0, project.getExternalLayoutsCount(), i =>
            project.getExternalLayoutAt(i).getName()
          )
        )}.`
      );
    }
    const externalLayout = project.getExternalLayout(externalLayoutName);
    const associatedSceneName = externalLayout.getAssociatedLayout();
    if (!associatedSceneName || !project.hasLayoutNamed(associatedSceneName)) {
      return makeFailure(
        `External layout "${externalLayoutName}" has no associated scene: set it in the editor first`
      );
    }
    const layout = project.getLayout(associatedSceneName);
    return {
      ...base,
      layout,
      externalLayout,
      objectsContainer: layout.getObjects(),
      globalObjectsContainer: project.getObjects(),
      initialInstances: externalLayout.getInitialInstances(),
      layersContainer: layout.getLayers(),
    };
  }
  if (scope.type === 'external_events') {
    return makeFailure(EXTERNAL_EVENTS_NOT_SUPPORTED_MESSAGE);
  }

  // The four extension scopes.
  const extensionName = scope.extension_name || '';
  if (!project.hasEventsFunctionsExtensionNamed(extensionName)) {
    return makeFailure(
      `Extension "${extensionName}" not found. Existing extensions: ${listNames(
        getExtensionNames(project)
      )}.`
    );
  }
  const eventsFunctionsExtension = project.getEventsFunctionsExtension(
    extensionName
  );
  const readOnlyReason = isExtensionFromStore(eventsFunctionsExtension)
    ? makeStoreExtensionReadOnlyMessage(extensionName)
    : null;
  const extensionBase: ResolvedScope = {
    ...base,
    eventsFunctionsExtension,
    readOnlyReason,
  };

  if (scope.type === 'extension') return extensionBase;

  if (scope.type === 'custom_behavior') {
    const behaviorName = scope.custom_behavior_name || '';
    const behaviors = eventsFunctionsExtension.getEventsBasedBehaviors();
    if (!behaviors.has(behaviorName)) {
      return makeFailure(
        `Custom behavior "${behaviorName}" not found in extension "${extensionName}". Existing custom behaviors: ${listNames(
          mapFor(0, behaviors.getCount(), i => behaviors.getAt(i).getName())
        )}.`
      );
    }
    return {
      ...extensionBase,
      eventsBasedBehavior: behaviors.get(behaviorName),
    };
  }

  const objectName = scope.custom_object_name || '';
  const objects = eventsFunctionsExtension.getEventsBasedObjects();
  if (!objects.has(objectName)) {
    return makeFailure(
      `Custom object "${objectName}" not found in extension "${extensionName}". Existing custom objects: ${listNames(
        mapFor(0, objects.getCount(), i => objects.getAt(i).getName())
      )}.`
    );
  }
  const eventsBasedObject = objects.get(objectName);
  if (scope.type === 'custom_object') {
    return { ...extensionBase, eventsBasedObject };
  }

  const variantName = scope.variant_name || '';
  const isDefaultVariant = variantName === '';
  const variants = eventsBasedObject.getVariants();
  if (!isDefaultVariant && !variants.hasVariantNamed(variantName)) {
    return makeFailure(
      `Variant "${variantName}" not found on custom object "${extensionName}::${objectName}" ("" is the default variant). Existing variants: ${listNames(
        getNamedVariantNames(eventsBasedObject)
      )}.`
    );
  }
  const variant = isDefaultVariant
    ? eventsBasedObject.getDefaultVariant()
    : variants.getVariant(variantName);
  return {
    ...extensionBase,
    eventsBasedObject,
    variant,
    isDefaultVariant,
    objectsContainer: variant.getObjects(),
    globalObjectsContainer: null,
    initialInstances: variant.getInitialInstances(),
    layersContainer: variant.getLayers(),
  };
};

/**
 * Read and resolve the scope of a call in one go: the common prologue of the
 * scoped functions. A missing scope, an invalid one or an unknown container
 * is a failure.
 */
export const resolveScopeFromArgs = (
  project: gdProject,
  args: any,
  options: {|
    allowedTypes: Array<ToolScopeType>,
    legacySceneNameField?: string,
    defaultScope?: ToolScope,
  |}
): ResolvedScope | ScopeFailure => {
  let scope: ToolScope;
  try {
    scope = requireScopeArgument(args, options);
  } catch (error) {
    return makeFailure(error.message);
  }
  return resolveScope(project, scope);
};

/**
 * The failure to return when a structural edit is asked on a named variant,
 * or null when the scope allows it (default variant, or not a variant at all).
 */
export const getNamedVariantRejection = (
  resolvedScope: ResolvedScope
): ScopeFailure | null =>
  resolvedScope.variant && !resolvedScope.isDefaultVariant
    ? makeFailure(NAMED_VARIANT_REJECTED_MESSAGE)
    : null;

/** The failure to return when a mutation targets a store extension, or null. */
export const getReadOnlyRejection = (
  resolvedScope: ResolvedScope
): ScopeFailure | null =>
  resolvedScope.readOnlyReason
    ? makeFailure(resolvedScope.readOnlyReason)
    : null;

/**
 * After a structural edit of the default variant (children, behaviors,
 * variables of children, groups), the named variants get the same children.
 */
export const complyVariantsAfterStructuralEdit = (
  project: gdProject,
  resolvedScope: ResolvedScope
): void => {
  if (!resolvedScope.eventsBasedObject) return;
  gd.EventsBasedObjectVariantHelper.complyVariantsToEventsBasedObject(
    project,
    resolvedScope.eventsBasedObject
  );
};

/** The target to put in the outside-editor notifications for this scope. */
export const getOutsideEditorChangesTarget = (
  resolvedScope: ResolvedScope
): OutsideEditorChangesTarget => {
  // Only the fields that apply are set: a scene keeps sending exactly
  // `{ scene }` (the payload editors have always received).
  const { layout, externalLayout, eventsBasedObject, variant } = resolvedScope;
  if (externalLayout) return { scene: layout, externalLayout };
  if (eventsBasedObject) {
    return {
      scene: null,
      eventsBasedObject,
      variantName: variant ? variant.getName() : '',
    };
  }
  return { scene: layout };
};

/**
 * The objects of a scope holding objects (a scene, an external layout or a
 * custom object variant) - anything else is a programming error.
 */
export const getScopeObjectsContainer = (
  resolvedScope: ResolvedScope
): gdObjectsContainer => {
  const { objectsContainer } = resolvedScope;
  if (!objectsContainer) {
    throw new Error(
      `Internal error: ${resolvedScope.label} has no objects container.`
    );
  }
  return objectsContainer;
};

/**
 * Where an object was searched for, for "not found" messages: `in scene
 * "Level" nor globally` or `in custom object "UI::Dialog" (default variant)`
 * (children of a custom object don't see the global objects).
 */
export const getObjectLookupScopeText = (
  resolvedScope: ResolvedScope
): string =>
  resolvedScope.globalObjectsContainer
    ? `in ${resolvedScope.label} nor globally`
    : `in ${resolvedScope.label}`;

/**
 * Behavior shared data only exists per scene: outside a scene, refresh it for
 * the whole project (the object can be used in any scene).
 */
export const updateBehaviorsSharedDataInScope = (
  project: gdProject,
  resolvedScope: ResolvedScope
) => {
  const { layout } = resolvedScope;
  if (layout) layout.updateBehaviorsSharedData(project);
  else gd.WholeProjectRefactorer.updateBehaviorsSharedData(project);
};

// ---------------------------------------------------------------------------
// Layers of a scope (a scene or a custom object variant).
// ---------------------------------------------------------------------------

/** Rename a layer and update the events and instances referring to it. */
export const renameLayerInScope = (
  project: gdProject,
  resolvedScope: ResolvedScope,
  oldName: string,
  newName: string
) => {
  const { layout, eventsFunctionsExtension, eventsBasedObject } = resolvedScope;
  if (layout) {
    gd.WholeProjectRefactorer.renameLayerInScene(
      project,
      layout,
      oldName,
      newName
    );
  } else if (eventsFunctionsExtension && eventsBasedObject) {
    // The Core refactorer renames the layer of the default variant: a named
    // variant has its own layers and instances.
    if (resolvedScope.isDefaultVariant) {
      gd.WholeProjectRefactorer.renameLayerInEventsBasedObject(
        project,
        eventsFunctionsExtension,
        eventsBasedObject,
        oldName,
        newName
      );
    } else if (resolvedScope.initialInstances) {
      // The caller renamed the layer itself (like the Core refactorers, which
      // only update what refers to it): move the variant's own instances.
      resolvedScope.initialInstances.moveInstancesToLayer(oldName, newName);
    }
  }
};

/** Remove a layer and the instances on it. */
export const removeLayerInScope = (
  project: gdProject,
  resolvedScope: ResolvedScope,
  layerName: string
) => {
  const {
    layout,
    eventsBasedObject,
    layersContainer,
    initialInstances,
  } = resolvedScope;
  if (layout) {
    gd.WholeProjectRefactorer.removeLayerInScene(project, layout, layerName);
  } else if (eventsBasedObject && resolvedScope.isDefaultVariant) {
    gd.WholeProjectRefactorer.removeLayerInEventsBasedObject(
      eventsBasedObject,
      layerName
    );
  } else if (layersContainer && initialInstances) {
    initialInstances.removeAllInstancesOnLayer(layerName);
    layersContainer.removeLayer(layerName);
  }
};

/** Move the instances of a layer to another one, then remove the layer. */
export const mergeLayersInScope = (
  project: gdProject,
  resolvedScope: ResolvedScope,
  originLayerName: string,
  targetLayerName: string
) => {
  const {
    layout,
    eventsBasedObject,
    layersContainer,
    initialInstances,
  } = resolvedScope;
  if (layout) {
    gd.WholeProjectRefactorer.mergeLayersInScene(
      project,
      layout,
      originLayerName,
      targetLayerName
    );
  } else if (eventsBasedObject && resolvedScope.isDefaultVariant) {
    gd.WholeProjectRefactorer.mergeLayersInEventsBasedObject(
      eventsBasedObject,
      originLayerName,
      targetLayerName
    );
  } else if (layersContainer && initialInstances) {
    initialInstances.moveInstancesToLayer(originLayerName, targetLayerName);
    layersContainer.removeLayer(originLayerName);
  }
};

// ---------------------------------------------------------------------------
// Objects containers list and project scoped containers of a scope.
// ---------------------------------------------------------------------------

/**
 * Run `fn` with the objects containers list of the scope (what the objects
 * and groups names must be unique against). The list is a static temporary
 * of the bindings (never `delete()` it); the scratch container it may need
 * is freed afterwards.
 */
export const withScopeObjectsContainersList = <T>(
  project: gdProject,
  resolvedScope: ResolvedScope,
  fn: (objectsContainersList: gdObjectsContainersList) => T
): T => {
  const { layout, objectsContainer } = resolvedScope;
  if (layout) {
    return fn(
      gd.ObjectsContainersList.makeNewObjectsContainersListForProjectAndLayout(
        project,
        layout
      )
    );
  }
  // Children of a custom object (or the global objects) only see each other:
  // no global objects on top.
  const emptyGlobalObjectsContainer = new gd.ObjectsContainer(
    gd.ObjectsContainer.Unknown
  );
  try {
    return fn(
      gd.ObjectsContainersList.makeNewObjectsContainersListForContainers(
        emptyGlobalObjectsContainer,
        objectsContainer || emptyGlobalObjectsContainer
      )
    );
  } finally {
    emptyGlobalObjectsContainer.delete();
  }
};

/**
 * The project scoped containers accessor of a scope: for a scene, the usual
 * one; for an extension scope, the one of the extension editor, built with
 * scratch containers for the function parameters and the properties (call
 * `dispose()` once done to free them). `eventsFunction` is the function whose
 * events are edited, if any.
 */
export const makeScopeProjectScopedContainersAccessor = (
  project: gdProject,
  resolvedScope: ResolvedScope,
  eventsFunction: ?gdEventsFunction
): {| accessor: ProjectScopedContainersAccessor, dispose: () => void |} => {
  const {
    layout,
    eventsFunctionsExtension,
    eventsBasedBehavior,
    eventsBasedObject,
  } = resolvedScope;
  if (layout || !eventsFunctionsExtension) {
    return {
      accessor: new ProjectScopedContainersAccessor({ project, layout }),
      dispose: () => {},
    };
  }
  const objectsContainer = new gd.ObjectsContainer(
    gd.ObjectsContainer.Function
  );
  const parameterVariablesContainer = new gd.VariablesContainer(
    gd.VariablesContainer.Parameters
  );
  const propertyVariablesContainer = new gd.VariablesContainer(
    gd.VariablesContainer.Properties
  );
  const parameterResourcesContainer = new gd.ResourcesContainer(
    gd.ResourcesContainer.Parameters
  );
  const propertyResourcesContainer = new gd.ResourcesContainer(
    gd.ResourcesContainer.Properties
  );
  const accessor = new ProjectScopedContainersAccessor(
    {
      project,
      eventsFunctionsExtension,
      eventsBasedBehavior,
      eventsBasedObject,
      eventsFunction,
    },
    objectsContainer,
    parameterVariablesContainer,
    propertyVariablesContainer,
    parameterResourcesContainer,
    propertyResourcesContainer
  );
  return {
    accessor,
    dispose: () => {
      objectsContainer.delete();
      parameterVariablesContainer.delete();
      propertyVariablesContainer.delete();
      parameterResourcesContainer.delete();
      propertyResourcesContainer.delete();
    },
  };
};

// ---------------------------------------------------------------------------
// Events of a scope.
// ---------------------------------------------------------------------------

export const getFunctionsContainerOfScope = (
  resolvedScope: ResolvedScope
): ?gdEventsFunctionsContainer => {
  const {
    eventsBasedBehavior,
    eventsBasedObject,
    eventsFunctionsExtension,
  } = resolvedScope;
  if (eventsBasedBehavior) return eventsBasedBehavior.getEventsFunctions();
  if (eventsBasedObject) return eventsBasedObject.getEventsFunctions();
  if (eventsFunctionsExtension)
    return eventsFunctionsExtension.getEventsFunctions();
  return null;
};

/**
 * The function of an extension scope named `functionName` (required for the
 * extension, custom behavior and custom object scopes), or a failure listing
 * the existing functions.
 */
export const getEventsFunctionInScope = (
  resolvedScope: ResolvedScope,
  functionName: ?string
): {| success: true, eventsFunction: gdEventsFunction |} | ScopeFailure => {
  const functionsContainer = getFunctionsContainerOfScope(resolvedScope);
  if (!functionsContainer || resolvedScope.variant) {
    return makeFailure(
      `${
        resolvedScope.label
      } has no functions: use a scope of type "extension", "custom_behavior" or "custom_object".`
    );
  }
  const existingNames = mapFor(
    0,
    functionsContainer.getEventsFunctionsCount(),
    i => functionsContainer.getEventsFunctionAt(i).getName()
  );
  if (!functionName) {
    return makeFailure(
      `\`function_name\` is required for ${
        resolvedScope.label
      }. Existing functions: ${listNames(existingNames)}.`
    );
  }
  if (!functionsContainer.hasEventsFunctionNamed(functionName)) {
    return makeFailure(
      `Function "${functionName}" not found in ${
        resolvedScope.label
      }. Existing functions: ${listNames(existingNames)}.`
    );
  }
  return {
    success: true,
    eventsFunction: functionsContainer.getEventsFunction(functionName),
  };
};

// ---------------------------------------------------------------------------
// Compatibility adapter.
// ---------------------------------------------------------------------------

/**
 * Map every legacy alias of the arguments of a call to its current form,
 * before the function body runs: `scene_name` → `scope`,
 * `duplicated_object_scene` → `duplicated_object_scope`,
 * `placement_relation: 'append_to_scene'` → `'append_to_end'`, parameter type
 * `object` → `objectList`. Aliases are never removed (old requests keep
 * running); the schemas and prompts only show the current form. Throws when
 * `scene_name` and `scope` disagree.
 */
export const normalizeLegacyArguments = (args: any): any => {
  if (!args || typeof args !== 'object' || Array.isArray(args)) return args;
  const normalized = { ...args };

  const sceneToScope = (sceneNameField: string, scopeField: string) => {
    const sceneName: mixed = normalized[sceneNameField];
    if (typeof sceneName !== 'string' || sceneName === '') return;
    const scope: any = normalized[scopeField];
    if (scope === undefined || scope === null) {
      normalized[scopeField] = { type: 'scene', scene_name: sceneName };
    } else if (
      !scope ||
      typeof scope !== 'object' ||
      scope.type !== 'scene' ||
      scope.scene_name !== sceneName
    ) {
      throw new Error(BOTH_GIVEN_DISAGREE_MESSAGE);
    }
  };
  sceneToScope('scene_name', 'scope');
  sceneToScope('duplicated_object_scene', 'duplicated_object_scope');

  if (Array.isArray(normalized.event_batches)) {
    normalized.event_batches = normalized.event_batches.map((eventBatch: any) =>
      eventBatch &&
      typeof eventBatch === 'object' &&
      eventBatch.placement_relation === 'append_to_scene'
        ? { ...eventBatch, placement_relation: 'append_to_end' }
        : eventBatch
    );
  }
  if (Array.isArray(normalized.parameters)) {
    normalized.parameters = normalized.parameters.map((parameter: any) =>
      parameter && typeof parameter === 'object' && parameter.type === 'object'
        ? { ...parameter, type: 'objectList' }
        : parameter
    );
  }
  return normalized;
};
