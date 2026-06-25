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

export type SceneRenamedOutsideEditorChanges = {|
  oldName: string,
  newName: string,
|};
