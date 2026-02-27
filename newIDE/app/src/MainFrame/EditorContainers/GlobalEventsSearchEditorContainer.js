// @flow
import * as React from 'react';
import type {
  RenderEditorContainerProps,
  RenderEditorContainerPropsWithRef,
  SceneEventsOutsideEditorChanges,
  InstancesOutsideEditorChanges,
  ObjectsOutsideEditorChanges,
  ObjectGroupsOutsideEditorChanges,
} from './BaseEditor';
import { type ObjectWithContext } from '../../ObjectsList/EnumerateObjects';
import { type HotReloadSteps } from '../../EmbeddedGame/EmbeddedGameFrame';
import { GlobalEventsSearchEditor } from './GlobalSearch/GlobalEventsSearchEditor';

export class GlobalEventsSearchEditorContainer extends React.Component<RenderEditorContainerProps> {
  componentDidMount() {
    if (this.props.setToolbar) {
      this.props.setToolbar(null);
    }
  }

  componentDidUpdate(prevProps: RenderEditorContainerProps) {
    if (!prevProps.isActive && this.props.isActive && this.props.setToolbar) {
      this.props.setToolbar(null);
    }
  }

  getProject(): ?gdProject {
    return this.props.project;
  }

  getLayout(): ?gdLayout {
    return null;
  }

  updateToolbar() {
    if (this.props.setToolbar) {
      this.props.setToolbar(null);
    }
  }

  forceUpdateEditor() {
    // No updates to be done.
  }

  onEventsBasedObjectChildrenEdited() {
    // Nothing to do.
  }

  onSceneObjectEdited(scene: gdLayout, objectWithContext: ObjectWithContext) {
    // Nothing to do.
  }

  onSceneObjectsDeleted(scene: gdLayout) {
    // Nothing to do.
  }

  onSceneEventsModifiedOutsideEditor(changes: SceneEventsOutsideEditorChanges) {
    // Nothing to do.
  }

  notifyChangesToInGameEditor(hotReloadSteps: HotReloadSteps) {
    // Nothing to do.
  }

  switchInGameEditorIfNoHotReloadIsNeeded() {
    // Nothing to do.
  }

  onInstancesModifiedOutsideEditor(changes: InstancesOutsideEditorChanges) {
    // Nothing to do.
  }

  onObjectsModifiedOutsideEditor(changes: ObjectsOutsideEditorChanges) {
    // Nothing to do.
  }

  onObjectGroupsModifiedOutsideEditor(
    changes: ObjectGroupsOutsideEditorChanges
  ) {
    // Nothing to do.
  }

  render(): null | React.MixedElement {
    const { project, onNavigateToEventFromGlobalSearch } = this.props;

    if (!project) {
      return null;
    }
    return (
      <GlobalEventsSearchEditor
        project={project}
        onNavigateToEventFromGlobalSearch={onNavigateToEventFromGlobalSearch}
      />
    );
  }
}

export const renderGlobalEventsSearchEditorContainer = (
  props: RenderEditorContainerPropsWithRef
): React.Node => <GlobalEventsSearchEditorContainer {...props} />;
