import React, { Component } from 'react';
import Measure from 'react-measure';
import InstancesEditorContainer from './InstancesEditorContainer.js';

export default class FullSizeInstancesEditor extends Component {
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
            <InstancesEditorContainer
              width={this.state.width}
              height={this.state.height}
              ref={(editor) => this.props.editorRef && this.props.editorRef(editor)}
              {...this.props}
            />
        }
        </div>
      </Measure>
    )
  }
}
