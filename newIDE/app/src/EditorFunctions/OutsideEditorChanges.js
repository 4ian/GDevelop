// @flow

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

// Only scenes are renamed outside the editor for now; extend as needed.
export type RenamableProjectItemKind = 'scene';

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
