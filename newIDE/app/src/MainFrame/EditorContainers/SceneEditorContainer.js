// @flow
import * as React from 'react';
import SceneEditor from '../../SceneEditor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../../Utils/Serializer';
import {
  type RenderEditorContainerProps,
  type RenderEditorContainerPropsWithRef,
} from './BaseEditor';
import { type PreviewOptions } from '../../Export/PreviewLauncher.flow';

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
    if (!this.props.isActive && !nextProps.isActive) {
      return false;
    }

    return true;
  }

  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  forceUpdateEditor() {
    if (this.editor) this.editor.forceUpdateObjectsList();
  }

  getLayout(): ?gdLayout {
    const { project, projectItemName } = this.props;
    if (!project || !project.hasLayoutNamed(projectItemName)) return null;

    return project.getLayout(projectItemName);
  }

  saveUiSettings = () => {
    const layout = this.getLayout();
    const editor = this.editor;

    if (editor && layout) {
      unserializeFromJSObject(
        layout.getAssociatedSettings(),
        editor.getUiSettings()
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
        showNetworkPreviewButton={this.props.showNetworkPreviewButton}
        showPreviewButton={this.props.showPreviewButton}
        resourceSources={this.props.resourceSources}
        onChooseResource={this.props.onChooseResource}
        resourceExternalEditors={this.props.resourceExternalEditors}
        unsavedChanges={this.props.unsavedChanges}
        ref={editor => (this.editor = editor)}
        project={project}
        layout={layout}
        initialInstances={layout.getInitialInstances()}
        initialUiSettings={serializeToJSObject(layout.getAssociatedSettings())}
        onPreview={(options: PreviewOptions) =>
          this.props.onLayoutPreview(project, layout, options)
        }
        previewButtonSettings={this.props.previewButtonSettings}
        onOpenDebugger={this.props.onOpenDebugger}
        isActive={isActive}
      />
    );
  }
}

export const renderSceneEditorContainer = (
  props: RenderEditorContainerPropsWithRef
) => <SceneEditorContainer {...props} />;
