import React, { Component } from 'react';
import InstancesFullEditor from './InstancesFullEditor';
import { serializeToJSObject } from '../Utils/Serializer';

export default class ExternalLayoutEditor extends Component {
  getUiSettings() {
    return this.editor.getUiSettings();
  }

  render() {
    const { project, externalLayoutName } = this.props;
    if (!project.hasExternalLayoutNamed(externalLayoutName)) {
      //TODO: Error component
      return <div>No external layout called {externalLayoutName} found!</div>;
    }
    const externalLayout = project.getExternalLayout(externalLayoutName);

    const layoutName = externalLayout.getAssociatedLayout();
    if (!project.hasLayoutNamed(layoutName)) {
      //TODO: Error component
      return (
        <div>
          No layout called {layoutName} found for the external layout editor!
        </div>
      );
    }
    const layout = project.getLayout(layoutName);

    return (
      <InstancesFullEditor
        {...this.props}
        ref={editor => this.editor = editor}
        project={project}
        layout={layout}
        initialInstances={externalLayout.getInitialInstances()}
        initialUiSettings={serializeToJSObject(
          externalLayout.getAssociatedSettings()
        )}
      />
    );
  }
}
