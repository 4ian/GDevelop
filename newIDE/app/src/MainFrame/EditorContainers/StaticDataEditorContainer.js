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
import { type WillDeleteObjectChanges } from '../../EditorFunctions/OutsideEditorChanges';
import { StaticDataEditor } from '../../StaticData/StaticDataDialog';
import { type ObjectWithContext } from '../../ObjectsList/EnumerateObjects';
import {
  setEditorHotReloadNeeded,
  type HotReloadSteps,
} from '../../EmbeddedGame/EmbeddedGameFrame';

export class StaticDataEditorContainer extends React.Component<RenderEditorContainerProps> {
  autoSaveChain: Promise<void> = Promise.resolve();
  staticDataRevision: number = 0;

  enqueueStaticDataAutoSave = (revision: number, staticData: Object) => {
    this.autoSaveChain = this.autoSaveChain
      .catch(() => {
        // Keep later edits saveable if an unexpected error escaped the callback.
      })
      .then(async () => {
        if (revision !== this.staticDataRevision) return;
        let wasSaved = false;
        try {
          wasSaved = await this.props.onAutoSaveStaticData(staticData);
        } catch (error) {
          console.error('Unable to auto-save Static Data:', error);
        }
        if (wasSaved || revision !== this.staticDataRevision) return;

        const { unsavedChanges } = this.props;
        if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();
      });
  };

  onStaticDataChanged = (staticData: Object) => {
    this.staticDataRevision++;
    this.enqueueStaticDataAutoSave(this.staticDataRevision, staticData);
  };

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

  onWillDeleteObject(changes: WillDeleteObjectChanges) {
    // No thing to be done.
  }

  render(): any {
    const { project } = this.props;
    if (!project) return null;

    return (
      <StaticDataEditor project={project} onChange={this.onStaticDataChanged} />
    );
  }
}

export const renderStaticDataEditorContainer = (
  props: RenderEditorContainerPropsWithRef
): React.Node => <StaticDataEditorContainer {...props} />;
