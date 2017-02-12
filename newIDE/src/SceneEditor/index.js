import React, { Component } from 'react';
import ObjectsList from '../ObjectsList';
import FullSizeInstancesEditor from '../InstancesEditor/FullSizeInstancesEditor';
import InstancePropertiesEditor from '../InstancesEditor/InstancePropertiesEditor';

export default class SceneEditor extends Component {
  state = {};

  _onObjectSelected = (selectedObjectName) => {
    this.setState({
      selectedObjectName,
    });
  }

  _onNewInstanceAdded = () => {
    this.setState({
      selectedObjectName: null
    });
  }

  _onInstancesSelected = (instances) => {
    this.setState({
      selectedInstances: instances,
    });
  }

  render() {
    const { project, layoutName } = this.props;
    if (!project.hasLayoutNamed(layoutName)) {
      return <div>No layout called {layoutName} found!</div>;
    }

    const layout = project.getLayout(layoutName);

    return (
      <div style={{display: 'flex', flex: 1}}>
        <div style={{
          flex: 0.2,
          overflowY: 'scroll',
        }}>
          <InstancePropertiesEditor instances={this.state.selectedInstances}/>
        </div>
        <div style={{
          flex: 1,
          display: 'flex',
        }}>
          <FullSizeInstancesEditor
            project={project}
            layout={layout}
            initialInstances={layout.getInitialInstances()}
            selectedObjectName={this.state.selectedObjectName}
            onNewInstanceAdded={this._onNewInstanceAdded}
            onInstancesSelected={this._onInstancesSelected}
          />
        </div>
        <div style={{
          flex: 0.2,
          overflowY: 'scroll',
        }}>
          <ObjectsList
            objectsContainer={layout}
            onObjectSelected={this._onObjectSelected}
          />
        </div>
      </div>
    )
  }
}
