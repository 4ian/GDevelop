import React, { Component } from 'react';
import {
  MosaicWindow as RMMosaicWindow,
  MosaicWithoutDragDropContext,
  getLeaves,
} from 'react-mosaic-component';
import CloseButton from './CloseButton';
// Styles for Mosaic:
import 'react-mosaic-component/react-mosaic-component.css';
import '../Theme/Mosaic.css';

const createMosaicNodesFromArray = (array, splitPercentage = 23) => {
  if (array.length === 0) return null;
  if (array.length === 1) return array[0];

  return {
    direction: 'row',
    first: array[0],
    second: createMosaicNodesFromArray(array.slice(1), 100 - splitPercentage),
    splitPercentage: splitPercentage,
  };
};

const addRightNode = (currentNode, newNode, splitPercentage) => {
  if (currentNode.second && typeof currentNode.second !== 'string') {
    return {
      ...currentNode,
      second: addRightNode(currentNode.second, newNode, splitPercentage),
    };
  }

  return {
    direction: 'row',
    first: currentNode,
    second: newNode,
    splitPercentage,
  };
};

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
      mosaicNode: createMosaicNodesFromArray(
        props.initialEditorNames,
        props.initialSplitPercentage || 23
      ),
    };
  }

  openEditor = editorName => {
    if (getLeaves(this.state.mosaicNode).indexOf(editorName) !== -1) {
      return false;
    }

    this.setState({
      mosaicNode: addRightNode(this.state.mosaicNode, editorName, 75),
    });
    return true;
  };

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
export const MosaicWindow = props => {
  const toolbarControls = props.toolbarControls || [
    <CloseButton key="close" />,
  ];

  return <RMMosaicWindow {...props} toolbarControls={toolbarControls} />;
};
