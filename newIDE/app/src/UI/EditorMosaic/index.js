import React, { Component } from 'react';
import { Mosaic, createBalancedTreeFromLeaves } from 'react-mosaic-component';
// Styles for Mosaic:
import 'react-mosaic-component/react-mosaic-component.css';
import '../Theme/Mosaic.css';

export default class EditorMosaic extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mosaicNode: {
        ...createBalancedTreeFromLeaves(props.initialEditorNames),
        splitPercentage: props.initialSplitPercentage || 23,
      },
    };
  }

  _onChange = mosaicNode => this.setState({ mosaicNode });

  render() {
    return (
      <Mosaic
        renderTile={editorName => this.props.editors[editorName]}
        className="mosaic-blueprint-theme mosaic-gd-theme"
        value={this.state.mosaicNode}
        onChange={this._onChange}
      />
    );
  }
}
