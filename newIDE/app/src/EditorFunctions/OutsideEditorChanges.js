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
