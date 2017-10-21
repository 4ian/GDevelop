import React from 'react';
import InstancesFullEditor from '../../SceneEditor/InstancesFullEditor';
import { serializeToJSObject } from '../../Utils/Serializer';
import BaseEditor from './BaseEditor';
import Error from '../../Utils/Error';

export default class SceneEditor extends BaseEditor {
  updateToolbar() {
    if (this.editor) this.editor.updateToolbar();
  }

  getSerializedElements() {
    const layout = this.getLayout();

    return {
      ...BaseEditor.getLayoutSerializedElements(layout),
      instances: serializeToJSObject(layout.getInitialInstances()),
      uiSettings: this.editor.getUiSettings(),
    };
  }

  getLayout() {
    const { project, layoutName } = this.props;
    if (!project || !project.hasLayoutNamed(layoutName)) return null;

    return project.getLayout(layoutName);
  }

  render() {
    const { project, layoutName } = this.props;
    const layout = this.getLayout();
    if (!layout) {
      return (
        <Error message={`No layout called ${layoutName} found!`} />
      );
    }

    return (
      <InstancesFullEditor
        {...this.props}
        ref={editor => (this.editor = editor)}
        project={project}
        layout={layout}
        initialInstances={layout.getInitialInstances()}
        initialUiSettings={serializeToJSObject(layout.getAssociatedSettings())}
        onPreview={() => this.props.onPreview(project, layout)}
      />
    );
  }
}
