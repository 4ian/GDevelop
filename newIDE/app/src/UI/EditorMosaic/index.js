import React, { Component } from 'react';
import {
  MosaicWindow as RMMosaicWindow,
  MosaicWithoutDragDropContext,
  getLeaves,
} from 'react-mosaic-component';
import CloseButton from './CloseButton';
import ThemeConsumer from '../Theme/ThemeConsumer';

// EditorMosaic default styling:
import 'react-mosaic-component/react-mosaic-component.css';
import './style.css';

const addRightNode = (
  currentNode,
  newNode,
  splitPercentage,
  direction = 'row'
) => {
  if (currentNode.second && typeof currentNode.second !== 'string') {
    return {
      ...currentNode,
      second: addRightNode(currentNode.second, newNode, splitPercentage),
    };
  }

  return {
    direction,
    first: currentNode,
    second: newNode,
    splitPercentage,
  };
};

const defaultToolbarControls = [<CloseButton key="close" />];

const renderMosaicWindowPreview = props => (
  <div className="mosaic-preview">
    <div className="mosaic-window-toolbar">
      <div className="mosaic-window-title">{props.title}</div>
    </div>
    <div className="mosaic-window-body" />
  </div>
);

/**
 * A window that can be used in a EditorMosaic, with a close button
 * by default in the toolbarControls and a preview when the window is
 * dragged.
 */
export const MosaicWindow = props => (
  <RMMosaicWindow
    {...props}
    toolbarControls={props.toolbarControls || defaultToolbarControls}
    renderPreview={renderMosaicWindowPreview}
  />
);

/**
 * @class EditorMosaic
 *
 * Can be used to create a mosaic of resizable editors.
 * Must be used inside a component wrapped in a DragDropContext.
 */
export default class EditorMosaic extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mosaicNode: props.initialNodes,
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
      <ThemeConsumer>
        {muiTheme => (
          <MosaicWithoutDragDropContext
            className={`${
              muiTheme.mosaicRootClassName
            } mosaic-blueprint-theme mosaic-gd-theme`}
            renderTile={(editorName, path) =>
              React.cloneElement(editors[editorName], { path })
            }
            value={this.state.mosaicNode}
            onChange={this._onChange}
          />
        )}
      </ThemeConsumer>
    );
  }
}
