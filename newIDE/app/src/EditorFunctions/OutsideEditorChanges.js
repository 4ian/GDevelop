// @flow

export type SceneEventsOutsideEditorChanges = {|
  scene: gdLayout,
  externalEvents?: gdExternalEvents,
  lifecycleFunctionName?: string,
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
// `scene` is null when there is no scene in context (e.g. deleting an object
// of an events-based object variant); it's only used to scope this
// notification to the right open tab when broadcast across editors.
export type WillDeleteObjectChanges = {|
  scene: ?gdLayout,
  objectName: string,
|};
