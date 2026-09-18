// @flow

/**
 * The container an outside-editor change happened in: a scene (`scene` set,
 * nothing else), the instances of an external layout (`scene` is its
 * associated scene, plus `externalLayout`) or a variant of a custom object
 * (`scene` null, `eventsBasedObject` and `variantName`, "" being the default
 * variant). Editors match on it to know if they are concerned.
 */
export type OutsideEditorChangesTarget = {|
  scene: ?gdLayout,
  externalLayout?: ?gdExternalLayout,
  eventsBasedObject?: ?gdEventsBasedObject,
  variantName?: ?string,
|};

/**
 * A stable key identifying a target, to coalesce the notifications of a batch
 * (gd objects are compared by identity: use their pointers).
 */
export const getOutsideEditorChangesTargetKey = (target: {
  +scene: ?gdLayout,
  +externalLayout?: ?gdExternalLayout,
  +eventsBasedObject?: ?gdEventsBasedObject,
  +variantName?: ?string,
  ...
}): string => {
  if (target.externalLayout)
    return `external-layout:${target.externalLayout.ptr}`;
  if (target.eventsBasedObject)
    return `events-based-object:${
      target.eventsBasedObject.ptr
    }:${target.variantName || ''}`;
  return `scene:${target.scene ? target.scene.ptr : 'none'}`;
};

export type SceneEventsOutsideEditorChanges = {|
  scene: ?gdLayout,
  // Set instead of `scene` when the events of a function of an extension
  // were changed.
  eventsFunction?: ?gdEventsFunction,
  extensionName?: ?string,
  newOrChangedAiGeneratedEventIds: Set<string>,
|};

export const getSceneEventsOutsideEditorChangesKey = (
  changes: SceneEventsOutsideEditorChanges
): string =>
  changes.eventsFunction
    ? `events-function:${changes.eventsFunction.ptr}`
    : `scene:${changes.scene ? changes.scene.ptr : 'none'}`;

export type InstancesOutsideEditorChanges = {|
  ...OutsideEditorChangesTarget,
|};

export type ObjectsOutsideEditorChanges = {|
  ...OutsideEditorChangesTarget,
  isNewObjectTypeUsed: boolean,
|};

export type ObjectGroupsOutsideEditorChanges = {|
  ...OutsideEditorChangesTarget,
|};

export type RenamableProjectItemKind =
  | 'scene'
  | 'gameplay-test'
  | 'extension'
  | 'custom-object'
  | 'custom-behavior'
  | 'function';

// For 'gameplay-test', the names are the tab "project item names" (the test
// name for a project test, `ExtensionName::TestName` for an extension test —
// see `getGameplayTestProjectItemName`). For the items of an extension
// ('custom-object', 'custom-behavior', 'function'), `extensionName` is set,
// and a function of a behavior or object also gives its owner.
export type ProjectItemRenamedOutsideEditorChanges = {|
  kind: RenamableProjectItemKind,
  oldName: string,
  newName: string,
  extensionName?: string,
  behaviorName?: string,
  objectName?: string,
|};

/**
 * Extensions changed by the AI (created, edited, deleted, or their custom
 * objects/behaviors/functions). Coalesced per batch: the flush reloads the
 * generated extensions (`needsCodeRegeneration`: declarations or children
 * changed; otherwise only the metadata) and refreshes the open editors.
 */
export type ExtensionsOutsideEditorChanges = {|
  extensionNames: Array<string>,
  needsCodeRegeneration: boolean,
  // Set when an extension of `extensionNames` was removed from the project.
  deleted?: boolean,
|};

// Called before an extension or one of its items is actually deleted, so any
// tab or selection bound to it can be released first (a deleted function or
// object pointer would be dangling).
export type WillDeleteExtensionItemChanges = {|
  kind:
    | 'extension'
    | 'custom-object'
    | 'custom-object-variant'
    | 'custom-behavior'
    | 'function',
  extensionName: string,
  objectName?: string,
  behaviorName?: string,
  variantName?: string,
  functionName?: string,
|};

// Called before the scene is actually deleted, so its gdLayout is still
// valid (e.g. to let editors close any tab bound to it by object identity).
export type WillDeleteSceneChanges = {|
  scene: gdLayout,
|};

// Called before the gameplay test is actually deleted, so any tab bound to it
// can be closed first. The name is the tab "project item name" (the test name
// for a project test, `ExtensionName::TestName` for an extension test).
export type WillDeleteGameplayTestChanges = {|
  gameplayTestProjectItemName: string,
|};

// Called before the object is actually deleted, so editors can still safely
// compare/read it (e.g. to close a dialog/panel referring to it) without
// risking a dangling reference.
export type WillDeleteObjectChanges = {|
  ...OutsideEditorChangesTarget,
  objectName: string,
|};
