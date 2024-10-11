// @flow
import * as React from 'react';
import { prepareInstancesEditorSettings } from '../../InstancesEditor/InstancesEditorSettings';
import SceneEditor from '../../SceneEditor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../../Utils/Serializer';
import {
  type RenderEditorContainerProps,
  type RenderEditorContainerPropsWithRef,
} from './BaseEditor';
import { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';
import { type ObjectWithContext } from '../../ObjectsList/EnumerateObjects';

export class SceneEditorContainer extends React.Component<RenderEditorContainerProps> {
  editor: ?SceneEditor;

  getProject(): ?gdProject {
    return this.props.project;
  }

  shouldComponentUpdate(nextProps: RenderEditorContainerProps) {
    // This optimization is a bit more cautious than the traditional one, to still allow
    // children, and in particular SceneEditor and InstancesEditor, to be notified when isActive
    // goes from true to false (in which case PIXI rendering is halted). If isActive was false
    // and remains false, it's safe to stop update here (PIXI rendering is already halted).
    return this.props.isActive || nextProps.isActive;
  }

  componentDidMount() {
    if (this.props.isActive) {
      const { projectItemName } = this.props;
      this.props.setPreviewedLayout(projectItemName);
    }
  }

  componentDidUpdate(prevProps: RenderEditorContainerProps) {
    if (!prevProps.isActive && this.props.isActive) {
      const { projectItemName } = this.props;
      this.props.setPreviewedLayout(projectItemName);
    }
  }

  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  forceUpdateEditor() {
    const { editor } = this;
    if (editor) {
      editor.forceUpdateObjectsList();
      editor.forceUpdateObjectGroupsList();
      editor.forceUpdateLayersList();
    }
  }

  onEventsBasedObjectChildrenEdited() {
    const { editor } = this;
    if (editor) {
      // Update every custom object because some custom objects may include
      // the one actually edited.
      editor.forceUpdateCustomObjectRenderedInstances();
    }
  }

  onSceneObjectEdited(scene: gdLayout, objectWithContext: ObjectWithContext) {
    const layout = this.getLayout();
    if (!layout) {
      return;
    }
    if (layout !== scene && !objectWithContext.global) {
      return;
    }
    const { editor } = this;
    if (editor) {
      // Update instances of the object as it was modified in an editor.
      editor.forceUpdateRenderedInstancesOfObject(objectWithContext.object);
    }
  }

  getLayout(): ?gdLayout {
    const { project, projectItemName } = this.props;
    if (
      !project ||
      !projectItemName ||
      !project.hasLayoutNamed(projectItemName)
    )
      return null;

    return project.getLayout(projectItemName);
  }

  saveUiSettings = () => {
    const layout = this.getLayout();
    const editor = this.editor;

    if (editor && layout) {
      unserializeFromJSObject(
        layout.getAssociatedEditorSettings(),
        editor.getInstancesEditorSettings()
      );
    }
  };

  render() {
    const { project, projectItemName, isActive } = this.props;
    const layout = this.getLayout();
    if (!layout || !project) {
      //TODO: Error component
      return <div>No layout called {projectItemName} found!</div>;
    }

    const projectScopedContainersAccessor = new ProjectScopedContainersAccessor(
      {
        project,
        layout,
      }
    );

    return (
      <SceneEditor
        setToolbar={this.props.setToolbar}
        resourceManagementProps={this.props.resourceManagementProps}
        unsavedChanges={this.props.unsavedChanges}
        ref={editor => (this.editor = editor)}
        project={project}
        projectScopedContainersAccessor={projectScopedContainersAccessor}
        layout={layout}
        eventsFunctionsExtension={null}
        eventsBasedObject={null}
        globalObjectsContainer={project.getObjects()}
        objectsContainer={layout.getObjects()}
        layersContainer={layout.getLayers()}
        initialInstances={layout.getInitialInstances()}
        getInitialInstancesEditorSettings={() =>
          prepareInstancesEditorSettings(
            serializeToJSObject(layout.getAssociatedEditorSettings()),
            Math.max(
              project.getGameResolutionWidth(),
              project.getGameResolutionHeight()
            )
          )
        }
        onOpenEvents={this.props.onOpenEvents}
        isActive={isActive}
        hotReloadPreviewButtonProps={this.props.hotReloadPreviewButtonProps}
        openBehaviorEvents={this.props.openBehaviorEvents}
        onExtractAsExternalLayout={this.props.onExtractAsExternalLayout}
        onExtractAsEventBasedObject={this.props.onExtractAsEventBasedObject}
        onOpenEventBasedObjectEditor={this.props.onOpenEventBasedObjectEditor}
        onObjectEdited={objectWithContext =>
          this.props.onSceneObjectEdited(layout, objectWithContext)
        }
        // Nothing to do as scenes are not events-based objects.
        onEventsBasedObjectChildrenEdited={() => {}}
      />
    );
  }
}

export const renderSceneEditorContainer = (
  props: RenderEditorContainerPropsWithRef
) => <SceneEditorContainer {...props} />;
