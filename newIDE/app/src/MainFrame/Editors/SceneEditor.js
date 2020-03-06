// @flow
import * as React from 'react';
import SceneEditor from '../../SceneEditor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../../Utils/Serializer';
import BaseEditor from './BaseEditor';
import { type PreviewOptions } from '../../Export/PreviewLauncher.flow';

export default class SceneEditorContainer extends BaseEditor {
  editor: ?SceneEditor;

  shouldComponentUpdate(nextProps: *) {
    // This optimization is a bit more cautious than the one is BaseEditor, to still allow
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
          this.props.onPreview(project, layout, options)
        }
        previewButtonSettings={this.props.previewButtonSettings}
        onOpenDebugger={this.props.onOpenDebugger}
        isActive={isActive}
      />
    );
  }
}
