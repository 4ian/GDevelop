import React, { Component } from 'react';
import ObjectsList from '../ObjectsList';
import FullSizeInstancesEditor from '../InstancesEditor/FullSizeInstancesEditor';

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

  render() {
    const { project, layoutName } = this.props;
    if (!project.hasLayoutNamed(layoutName)) {
      return <div>No layout called {layoutName} found!</div>;
    }

    const layout = project.getLayout(layoutName);

    return (
      <div style={{display: 'flex', flex: 1}}>
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
          />
        </div>
        <div style={{
          flex: 0.3,
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
