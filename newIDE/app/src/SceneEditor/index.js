import React from 'react';
import InstancesFullEditor from './InstancesFullEditor';
import { serializeToJSObject } from '../Utils/Serializer';
import BaseEditor from '../MainFrame/BaseEditor';

export default class SceneEditor extends BaseEditor {
  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  getSerializedElements() {
    const { layout } = this._getLayout();

    return {
      ...BaseEditor.getLayoutSerializedElements(layout),
      instances: serializeToJSObject(layout.getInitialInstances()),
      uiSettings: this.editor.getUiSettings(),
    };
  }

  _getLayout() {
    const { project, layoutName } = this.props;
    if (!project || !project.hasLayoutNamed(layoutName)) return {};

    const layout = project.getLayout(layoutName);

    return {
      layout,
    };
  }

  render() {
    const { project, layoutName } = this.props;
    const { layout } = this._getLayout();
    if (!layout) {
      //TODO: Error component
      return <div>No layout called {layoutName} found!</div>;
    }

    return (
      <InstancesFullEditor
        {...this.props}
        ref={editor => this.editor = editor}
        project={project}
        layout={layout}
        initialInstances={layout.getInitialInstances()}
        initialUiSettings={serializeToJSObject(
          layout.getAssociatedSettings()
        )}
        onPreview={() => this.props.onPreview(project, layout)}
      />
    );
  }
}
