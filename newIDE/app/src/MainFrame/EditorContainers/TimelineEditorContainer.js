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
} from '../../EditorFunctions/OutsideEditorChanges';
import { type ObjectWithContext } from '../../ObjectsList/EnumerateObjects';
import { type HotReloadSteps } from '../../EmbeddedGame/EmbeddedGameFrame';
import TimelineEditor from '../../TimelineEditor';

export class TimelineEditorContainer extends React.Component<RenderEditorContainerProps> {
  componentDidMount() {
    this.props.setToolbar(null);
  }

  componentDidUpdate(prevProps: RenderEditorContainerProps) {
    if (!prevProps.isActive && this.props.isActive) {
      this.props.setToolbar(null);
    }
  }

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
    this.forceUpdate();
  }

  onEventsBasedObjectChildrenEdited(
    eventsBasedObject: gdEventsBasedObject,
    options?: {| editedObject?: ?gdObject, hasResourceChanged?: boolean |}
  ) {}

  onSceneObjectEdited(
    scene: gdLayout,
    objectWithContext: ObjectWithContext,
    hasResourceChanged?: boolean
  ) {}

  onSceneObjectsDeleted(scene: gdLayout) {}

  onSceneEventsModifiedOutsideEditor(
    changes: SceneEventsOutsideEditorChanges
  ) {}

  notifyChangesToInGameEditor(hotReloadSteps: HotReloadSteps) {}

  switchInGameEditorIfNoHotReloadIsNeeded() {}

  onInstancesModifiedOutsideEditor(changes: InstancesOutsideEditorChanges) {}

  onObjectsModifiedOutsideEditor(changes: ObjectsOutsideEditorChanges) {}

  onObjectGroupsModifiedOutsideEditor(
    changes: ObjectGroupsOutsideEditorChanges
  ) {}

  selectAllInsideEditor() {}

  render(): React.Node {
    const { project } = this.props;
    if (!project) {
      return null;
    }

    return (
      <TimelineEditor
        project={project}
        timelineIdOrName={this.props.projectItemName}
        setToolbar={this.props.setToolbar}
        unsavedChanges={this.props.unsavedChanges}
      />
    );
  }
}

export const renderTimelineEditorContainer = (
  props: RenderEditorContainerPropsWithRef
): React.Node => <TimelineEditorContainer {...props} />;
