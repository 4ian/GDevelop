// @flow
import * as React from 'react';
import type {
  RenderEditorContainerProps,
  RenderEditorContainerPropsWithRef,
} from './BaseEditor';
import type {
  SceneEventsOutsideEditorChanges,
  InstancesOutsideEditorChanges,
  ObjectsOutsideEditorChanges,
  ObjectGroupsOutsideEditorChanges,
  WillDeleteObjectChanges,
} from '../../EditorFunctions/OutsideEditorChanges';
import { type ObjectWithContext } from '../../ObjectsList/EnumerateObjects';
import { type HotReloadSteps } from '../../EmbeddedGame/EmbeddedGameFrame';
import {
  GlobalEventsSearchEditor,
  type GlobalEventsSearchEditorInterface,
} from './GlobalSearch/GlobalEventsSearchEditor';

export class GlobalEventsSearchEditorContainer extends React.Component<RenderEditorContainerProps> {
  _globalEventsSearchEditorRef: ?GlobalEventsSearchEditorInterface = null;

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

  focusInitialField() {
    if (this._globalEventsSearchEditorRef) {
      this._globalEventsSearchEditorRef.focusInitialField();
    }
  }

  onEventsBasedObjectChildrenEdited(
    eventsBasedObject: gdEventsBasedObject,
    options?: {| editedObject?: ?gdObject, hasResourceChanged?: boolean |}
  ) {
    // Nothing to do.
  }

  onSceneObjectEdited(
    scene: gdLayout,
    objectWithContext: ObjectWithContext,
    hasResourceChanged?: boolean
  ) {
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

  onWillDeleteObject(changes: WillDeleteObjectChanges) {
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
        ref={ref => (this._globalEventsSearchEditorRef = ref)}
        project={project}
        onNavigateToEventFromGlobalSearch={onNavigateToEventFromGlobalSearch}
      />
    );
  }
}

export const renderGlobalEventsSearchEditorContainer = (
  props: RenderEditorContainerPropsWithRef
): React.Node => <GlobalEventsSearchEditorContainer {...props} />;
