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
    if (this.editor) this.editor.forceUpdateObjectsList();
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

    return (
      <SceneEditor
        setToolbar={this.props.setToolbar}
        resourceSources={this.props.resourceSources}
        onChooseResource={this.props.onChooseResource}
        resourceExternalEditors={this.props.resourceExternalEditors}
        onFetchNewlyAddedResources={this.props.onFetchNewlyAddedResources}
        canInstallPrivateAsset={this.props.canInstallPrivateAsset}
        unsavedChanges={this.props.unsavedChanges}
        ref={editor => (this.editor = editor)}
        project={project}
        layout={layout}
        initialInstances={layout.getInitialInstances()}
        getInitialInstancesEditorSettings={() =>
          prepareInstancesEditorSettings(
            serializeToJSObject(layout.getAssociatedEditorSettings())
          )
        }
        onOpenEvents={this.props.onOpenEvents}
        isActive={isActive}
        hotReloadPreviewButtonProps={this.props.hotReloadPreviewButtonProps}
      />
    );
  }
}

export const renderSceneEditorContainer = (
  props: RenderEditorContainerPropsWithRef
) => <SceneEditorContainer {...props} />;
