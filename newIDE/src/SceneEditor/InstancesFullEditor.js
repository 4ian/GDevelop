import React, { Component } from 'react';
import ObjectsList from '../ObjectsList';
import FullSizeInstancesEditor from '../InstancesEditor/FullSizeInstancesEditor';
import InstancePropertiesEditor from '../InstancesEditor/InstancePropertiesEditor';

export default class InstancesFullEditor extends Component {
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
    const { project, layout, initialInstances } = this.props;

    return (
      <div style={{display: 'flex', flex: 1}}>
        <div style={{
          width: 200,
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
            initialInstances={initialInstances}
            selectedObjectName={this.state.selectedObjectName}
            onNewInstanceAdded={this._onNewInstanceAdded}
            onInstancesSelected={this._onInstancesSelected}
          />
        </div>
        <div style={{
          width: 200,
          overflowY: 'scroll',
        }}>
          <ObjectsList
            project={project}
            objectsContainer={layout}
            onObjectSelected={this._onObjectSelected}
          />
        </div>
      </div>
    )
  }
}
