import React, { Component } from 'react';
import muiThemeable from 'material-ui/styles/muiThemeable';
import {
  MosaicWindow as RMMosaicWindow,
  MosaicWithoutDragDropContext as RMMosaicWithoutDragDropContext,
  getLeaves,
} from 'react-mosaic-component';
import CloseButton from './CloseButton';

// EditorMosaic default styling:
import 'react-mosaic-component/react-mosaic-component.css';
import './style.css'

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

const ThemableMosaicWithoutDragDropContext = (props) =>
  <RMMosaicWithoutDragDropContext
    className={`${props.muiTheme.mosaicRootClassName} mosaic-blueprint-theme mosaic-gd-theme`}
    {...props}
  />;

const MosaicWithoutDragDropContext = muiThemeable()(ThemableMosaicWithoutDragDropContext);

/**
 * @class EditorMosaic
 *
 * Can be used to create a mosaic of resizable editors.
 * Must be used inside a component wrapped in a DragDropContext.
 */
export default class ThemableEditorMosaic extends Component {
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
    const { editors } = this.props;
    return (
      <MosaicWithoutDragDropContext
        renderTile={(editorName, path) =>
          React.cloneElement(editors[editorName], { path })}
        value={this.state.mosaicNode}
        onChange={this._onChange}
      />
    );
  }
}

/**
 * @class EditorWindow
 *
 * A window that can be used in a EditorMosaic
 */
export const MosaicWindow = props => {
  const toolbarControls = props.toolbarControls || [
    <CloseButton key="close" />,
  ];

  return <RMMosaicWindow {...props} toolbarControls={toolbarControls} />;
};
