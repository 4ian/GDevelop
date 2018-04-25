// @flow
import * as React from 'react';
import SceneEditor from '../../SceneEditor';
import { serializeToJSObject } from '../../Utils/Serializer';
import BaseEditor from './BaseEditor';
import { type PreviewOptions } from '../../Export/PreviewLauncher.flow';

export default class SceneEditorContainer extends BaseEditor {
  editor: ?typeof SceneEditor;

  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  getSerializedElements() {
    const layout = this.getLayout();
    if (!layout) return {};

    return {
      ...BaseEditor.getLayoutSerializedElements(layout),
      instances: serializeToJSObject(layout.getInitialInstances()),
      uiSettings: this.editor ? this.editor.getUiSettings() : {},
    };
  }

  getLayout(): ?gdLayout {
    const { project, layoutName } = this.props;
    if (!project || !project.hasLayoutNamed(layoutName)) return null;

    return project.getLayout(layoutName);
  }

  render() {
    const { project, layoutName, isActive } = this.props;
    const layout = this.getLayout();
    if (!layout) {
      //TODO: Error component
      return <div>No layout called {layoutName} found!</div>;
    }

    return (
      <SceneEditor
        {...this.props}
        ref={editor => (this.editor = editor)}
        project={project}
        layout={layout}
        initialInstances={layout.getInitialInstances()}
        initialUiSettings={serializeToJSObject(layout.getAssociatedSettings())}
        onPreview={(options: PreviewOptions) =>
          this.props.onPreview(project, layout, options)}
        onOpenDebugger={this.props.onOpenDebugger}
        isActive={isActive}
      />
    );
  }
}
