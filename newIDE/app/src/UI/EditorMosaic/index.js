// @flow
import * as React from 'react';
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

type MosaicNode = {|
  direction: 'row' | 'column',
  splitPercentage: number,
  first: ?MosaicNode | string,
  second: ?MosaicNode | string,
|};

const addNode = (
  currentNode: MosaicNode,
  newNode: MosaicNode | string,
  position: 'start' | 'end',
  splitPercentage: number,
  direction: 'row' | 'column' = 'row'
): MosaicNode => {
  if (currentNode.second && typeof currentNode.second !== 'string') {
    return {
      ...currentNode,
      second: addNode(
        currentNode.second,
        newNode,
        position,
        splitPercentage,
        direction
      ),
    };
  }

  return {
    direction,
    first: position === 'end' ? currentNode : newNode,
    second: position === 'end' ? newNode : currentNode,
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
export const MosaicWindow = (props: any) => (
  <RMMosaicWindow
    {...props}
    toolbarControls={props.toolbarControls || defaultToolbarControls}
    renderPreview={renderMosaicWindowPreview}
  />
);

type Props = {|
  initialNodes: MosaicNode,
  editors: { [string]: React.Node },
|};

type State = {|
  mosaicNode: MosaicNode,
|};

/**
 * @class EditorMosaic
 *
 * Can be used to create a mosaic of resizable editors.
 * Must be used inside a component wrapped in a DragDropContext.
 */
export default class EditorMosaic extends React.Component<Props, State> {
  state = {
    mosaicNode: this.props.initialNodes,
  };

  openEditor = (
    editorName: string,
    position: 'start' | 'end',
    splitPercentage: number
  ) => {
    if (getLeaves(this.state.mosaicNode).indexOf(editorName) !== -1) {
      return false;
    }

    this.setState({
      mosaicNode: addNode(
        this.state.mosaicNode,
        editorName,
        position,
        splitPercentage
      ),
    });
    return true;
  };

  _onChange = (mosaicNode: MosaicNode) => this.setState({ mosaicNode });

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
