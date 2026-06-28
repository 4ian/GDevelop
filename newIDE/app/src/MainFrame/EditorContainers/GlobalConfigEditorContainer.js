// @flow
import React from 'react';
import {
  type RenderEditorContainerProps,
  type RenderEditorContainerPropsWithRef,
  type SceneEventsOutsideEditorChanges,
  type InstancesOutsideEditorChanges,
  type ObjectsOutsideEditorChanges,
  type ObjectGroupsOutsideEditorChanges,
} from './BaseEditor';
import { GlobalConfigEditor } from '../../GlobalConfig/GlobalConfigDialog';
import { type ObjectWithContext } from '../../ObjectsList/EnumerateObjects';
import {
  setEditorHotReloadNeeded,
  type HotReloadSteps,
} from '../../EmbeddedGame/EmbeddedGameFrame';

export class GlobalConfigEditorContainer extends React.Component<RenderEditorContainerProps> {
  shouldComponentUpdate(nextProps: RenderEditorContainerProps): any {
    return this.props.isActive || nextProps.isActive;
  }

  getProject(): ?gdProject {
    return this.props.project;
  }

  getLayout(): ?gdLayout {
    return null;
  }

  updateToolbar() {
    this.props.setToolbar(null);
  }

  forceUpdateEditor() {
    // No updates to be done.
  }

  onEventsBasedObjectChildrenEdited() {
    // No thing to be done.
  }

  onSceneObjectEdited(scene: gdLayout, objectWithContext: ObjectWithContext) {
    // No thing to be done.
  }

  onSceneObjectsDeleted(scene: gdLayout) {
    // No thing to be done.
  }

  onSceneEventsModifiedOutsideEditor(changes: SceneEventsOutsideEditorChanges) {
    // No thing to be done.
  }

  selectAllInsideEditor() {
    // No thing to be done.
  }

  notifyChangesToInGameEditor(hotReloadSteps: HotReloadSteps) {
    setEditorHotReloadNeeded(hotReloadSteps);
  }

  switchInGameEditorIfNoHotReloadIsNeeded() {}

  onInstancesModifiedOutsideEditor(changes: InstancesOutsideEditorChanges) {
    // No thing to be done.
  }

  onObjectsModifiedOutsideEditor(changes: ObjectsOutsideEditorChanges) {
    // No thing to be done.
  }

  onObjectGroupsModifiedOutsideEditor(
    changes: ObjectGroupsOutsideEditorChanges
  ) {
    // No thing to be done.
  }

  render(): any {
    const { project, unsavedChanges } = this.props;
    if (!project) return null;

    return (
      <GlobalConfigEditor
        project={project}
        onChange={() => {
          if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();
        }}
      />
    );
  }
}

export const renderGlobalConfigEditorContainer = (
  props: RenderEditorContainerPropsWithRef
): React.Node => <GlobalConfigEditorContainer {...props} />;
