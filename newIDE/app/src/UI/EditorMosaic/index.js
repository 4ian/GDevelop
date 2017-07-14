import React, { Component } from 'react';
import {
  MosaicWindow as RMMosaicWindow,
  MosaicWithoutDragDropContext,
  createBalancedTreeFromLeaves,
} from 'react-mosaic-component';
// Styles for Mosaic:
import 'react-mosaic-component/react-mosaic-component.css';
import '../Theme/Mosaic.css';

/**
 * @class EditorMosaic
 *
 * Can be used to create a mosaic of resizable editors.
 * Must be used inside a component wrapped in a DragDropContext.
 */
class EditorMosaic extends Component {
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
      <MosaicWithoutDragDropContext
        renderTile={editorName => this.props.editors[editorName]}
        className="mosaic-blueprint-theme mosaic-gd-theme"
        value={this.state.mosaicNode}
        onChange={this._onChange}
      />
    );
  }
}

export default EditorMosaic;
export const MosaicWindow = (props) => <RMMosaicWindow {...props} toolbarControls={[]} />;
