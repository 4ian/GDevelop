import React, { Component } from 'react';
import Measure from 'react-measure';
import SceneEditorContainer from './SceneEditorContainer.js';

export default class FullSizeSceneEditor extends Component {
  constructor() {
    super();

    this.state = {
      width: 0,
      height: 0,
    }
  }

  render() {
    return (
      <Measure
        onMeasure={({width, height}) => this.setState({width, height})}
      >
        <div style={{display: 'flex', flex: 1}}>
        {
          this.state.width && this.state.height &&
            <SceneEditorContainer
              width={this.state.width}
              height={this.state.height}
              {...this.props}
            />
        }
        </div>
      </Measure>
    )
  }
}
