import React, { Component } from 'react';
import InstancesFullEditor from './InstancesFullEditor';
import { serializeToJSObject } from '../Utils/Serializer';

export default class SceneEditor extends Component {
  getUiSettings() {
    return this.editor.getUiSettings();
  }

  render() {
    const { project, layoutName } = this.props;
    if (!this.props.project) return null;

    if (!project.hasLayoutNamed(layoutName)) {
      //TODO: Error component
      return <div>No layout called {layoutName} found!</div>;
    }

    const layout = project.getLayout(layoutName);
    const initialInstances = layout.getInitialInstances();

    return (
      <InstancesFullEditor
        {...this.props}
        ref={editor => this.editor = editor}
        project={project}
        layout={layout}
        initialInstances={initialInstances}
        initialUiSettings={serializeToJSObject(
          layout.getAssociatedLayoutEditorCanvasOptions()
        )}
      />
    );
  }
}
