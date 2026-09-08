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

// Only scenes and gameplay tests are renamed outside the editor for now;
// extend as needed.
export type RenamableProjectItemKind = 'scene' | 'gameplay-test';

// For 'gameplay-test', the names are the tab "project item names" (the test
// name for a project test, `ExtensionName::TestName` for an extension test —
// see `getGameplayTestProjectItemName`).
export type ProjectItemRenamedOutsideEditorChanges = {|
  kind: RenamableProjectItemKind,
  oldName: string,
  newName: string,
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
