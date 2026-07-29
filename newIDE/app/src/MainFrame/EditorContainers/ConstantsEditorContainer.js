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
import { ConstantsEditor } from '../../Constants/ConstantsDialog';
import { type ObjectWithContext } from '../../ObjectsList/EnumerateObjects';
import {
  setEditorHotReloadNeeded,
  type HotReloadSteps,
} from '../../EmbeddedGame/EmbeddedGameFrame';

export class ConstantsEditorContainer extends React.Component<RenderEditorContainerProps> {
  autoSaveChain: Promise<void> = Promise.resolve();
  constantsRevision: number = 0;

  enqueueConstantsAutoSave = (revision: number, constants: Object) => {
    this.autoSaveChain = this.autoSaveChain
      .catch(() => {
        // Keep later edits saveable if an unexpected error escaped the callback.
      })
      .then(async () => {
        if (revision !== this.constantsRevision) return;
        let wasSaved = false;
        try {
          wasSaved = await this.props.onAutoSaveConstants(constants);
        } catch (error) {
          console.error('Unable to auto-save Constants:', error);
        }
        if (wasSaved || revision !== this.constantsRevision) return;

        const { unsavedChanges } = this.props;
        if (unsavedChanges) unsavedChanges.triggerUnsavedChanges();
      });
  };

  onConstantsChanged = (constants: Object) => {
    this.constantsRevision++;
    this.enqueueConstantsAutoSave(this.constantsRevision, constants);
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
      <ConstantsEditor project={project} onChange={this.onConstantsChanged} />
    );
  }
}

export const renderConstantsEditorContainer = (
  props: RenderEditorContainerPropsWithRef
): React.Node => <ConstantsEditorContainer {...props} />;
