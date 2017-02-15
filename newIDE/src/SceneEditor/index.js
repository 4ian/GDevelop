import React, { Component } from 'react';
import InstancesFullEditor from './InstancesFullEditor';

export default class SceneEditor extends Component {
  render() {
    const { project, layoutName } = this.props;
    if (!project.hasLayoutNamed(layoutName)) {
      //TODO: Error component
      return <div>No layout called {layoutName} found!</div>;
    }

    const layout = project.getLayout(layoutName);
    const initialInstances = layout.getInitialInstances();

    return (
      <InstancesFullEditor
        {...this.props}
        project={project}
        layout={layout}
        initialInstances={initialInstances}
      />
    );
  }
}
