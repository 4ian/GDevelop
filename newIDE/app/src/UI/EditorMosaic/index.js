// @flow
import { I18n } from '@lingui/react';
import * as React from 'react';
import {
  MosaicWindow as RMMosaicWindow,
  MosaicWithoutDragDropContext,
  getLeaves,
} from 'react-mosaic-component';
import CloseButton from './CloseButton';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import debounce from 'lodash/debounce';

// EditorMosaic default styling:
import 'react-mosaic-component/react-mosaic-component.css';
import './style.css';

export type Editor = {|
  type: 'primary' | 'secondary',
  renderEditor: () => React.Node,
  noTitleBar?: boolean,
  title?: MessageDescriptor,
  toolbarControls?: Array<React.Node>,
|};

export type EditorMosaicNode =
  | {|
      direction: 'row' | 'column',
      splitPercentage: number,
      first: ?EditorMosaicNode,
      second: ?EditorMosaicNode,
    |}
  | string;

export const mosaicContainsNode = (
  mosaic: ?EditorMosaicNode,
  node: string
): boolean => {
  return (
    !!mosaic &&
    (mosaic === node ||
      // $FlowFixMe
      ((!!mosaic.first && mosaicContainsNode(mosaic.first, node)) ||
        // $FlowFixMe
        (!!mosaic.second && mosaicContainsNode(mosaic.second, node))))
  );
};

// Add a node (an editor) in the mosaic.
const addNode = (
  currentNode: ?EditorMosaicNode,
  newNode: EditorMosaicNode | string,
  position: 'start' | 'end',
  splitPercentage: number,
  direction: 'row' | 'column'
): EditorMosaicNode => {
  if (!currentNode) return newNode;

  // Add the new node inside the current node...
  if (typeof currentNode !== 'string') {
    if (
      position === 'end' &&
      currentNode.second &&
      typeof currentNode.second !== 'string'
    ) {
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
    } else if (
      position === 'start' &&
      currentNode.first &&
      typeof currentNode.first !== 'string'
    ) {
      return {
        ...currentNode,
        first: addNode(
          currentNode.first,
          newNode,
          position,
          splitPercentage,
          direction
        ),
      };
    }
  }

  // Or add the node here.
  return {
    direction:
      direction === 'row'
        ? // Direction of split is the opposite of what is requested for the editor
          'column'
        : 'row',
    first: position === 'end' ? currentNode : newNode,
    second: position === 'end' ? newNode : currentNode,
    splitPercentage,
  };
};

// Replace a node (an editor) by another.
const replaceNode = (
  currentNode: ?EditorMosaicNode,
  oldNode: ?EditorMosaicNode,
  newNode: ?EditorMosaicNode
): ?EditorMosaicNode => {
  if (!currentNode) {
    return currentNode;
  } else if (typeof currentNode === 'string') {
    if (currentNode === oldNode) return newNode;

    return currentNode;
  } else {
    if (currentNode === oldNode) return newNode;

    return {
      ...currentNode,
      first: replaceNode(currentNode.first, oldNode, newNode),
      second: replaceNode(currentNode.second, oldNode, newNode),
    };
  }
};

// Remove the specified node (editor).
const removeNode = (
  currentNode: ?EditorMosaicNode,
  oldNode: ?EditorMosaicNode
): ?EditorMosaicNode => {
  if (!currentNode) {
    return currentNode;
  } else if (typeof currentNode === 'string') {
    if (currentNode === oldNode) return null;

    return currentNode;
  } else {
    if (currentNode === oldNode) return null;

    const first = removeNode(currentNode.first, oldNode);
    const second = removeNode(currentNode.second, oldNode);

    if (first && second) {
      return {
        ...currentNode,
        first,
        second,
      };
    } else {
      if (!first) return second;
      else return first;
    }
  }
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
const MosaicWindow = (props: any) => (
  <RMMosaicWindow
    {...props}
    toolbarControls={props.toolbarControls || defaultToolbarControls}
    renderPreview={renderMosaicWindowPreview}
  />
);

type Props = {|
  initialNodes: EditorMosaicNode,
  editors: {
    [string]: Editor,
  },
  limitToOneSecondaryEditor?: boolean,
  onOpenedEditorsChanged?: () => void,
  onPersistNodes?: EditorMosaicNode => void,
|};

type State = {|
  mosaicNode: ?EditorMosaicNode,
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

  toggleEditor = (
    editorName: string,
    position: 'start' | 'end',
    splitPercentage: number,
    direction: 'row' | 'column'
  ) => {
    const editor = this.props.editors[editorName];
    if (!editor) return false;

    const openedEditorNames = getLeaves(this.state.mosaicNode);
    if (openedEditorNames.indexOf(editorName) !== -1) {
      // The editor is already opened: close it.
      this._onChanged(removeNode(this.state.mosaicNode, editorName));

      return false;
    }

    return this.openEditor(editorName, position, splitPercentage, direction);
  };

  openEditor = (
    editorName: string,
    position: 'start' | 'end',
    splitPercentage: number,
    direction: 'row' | 'column'
  ) => {
    const { editors, limitToOneSecondaryEditor } = this.props;

    const editor = this.props.editors[editorName];
    if (!editor) return false;

    const openedEditorNames = getLeaves(this.state.mosaicNode);
    if (openedEditorNames.indexOf(editorName) !== -1) {
      // Editor is already opened.
      return false;
    }

    if (limitToOneSecondaryEditor && editor.type === 'secondary') {
      // Replace the existing secondary editor, if any.
      const secondaryEditorName = openedEditorNames.find(
        editorName => editors[editorName].type === 'secondary'
      );
      if (secondaryEditorName) {
        this._onChanged(
          replaceNode(this.state.mosaicNode, secondaryEditorName, editorName)
        );

        return true;
      }
    }

    // Open a new editor at the indicated position.
    this._onChanged(
      addNode(
        this.state.mosaicNode,
        editorName,
        position,
        splitPercentage,
        direction
      )
    );

    return true;
  };

  getOpenedEditorNames = (): Array<string> => {
    return getLeaves(this.state.mosaicNode);
  };

  _onChange = (mosaicNode: EditorMosaicNode) => {
    this.setState({ mosaicNode });
  };

  _onChanged = (mosaicNode: ?EditorMosaicNode) => {
    this.setState({ mosaicNode }, () => {
      this._onOpenedEditorsChanged();
    });
  };

  _onOpenedEditorsChanged = () => {
    if (this.props.onOpenedEditorsChanged) {
      this.props.onOpenedEditorsChanged();
    }

    this._persistNodes();
  };

  _persistNodes = debounce(() => {
    if (this.props.onPersistNodes && this.state.mosaicNode) {
      this.props.onPersistNodes(this.state.mosaicNode);
    }
  }, 2000);

  render() {
    const { editors } = this.props;
    return (
      <GDevelopThemeContext.Consumer>
        {gdevelopTheme => (
          <MosaicWithoutDragDropContext
            className={`${
              gdevelopTheme.mosaicRootClassName
            } mosaic-blueprint-theme mosaic-gd-theme`}
            renderTile={(editorName: string, path: string) => {
              const editor = editors[editorName];
              if (!editor) {
                console.error(
                  'Trying to render un unknown editor: ' + editorName
                );
                return null;
              }

              if (editor.noTitleBar) {
                return editor.renderEditor();
              }

              return (
                <I18n>
                  {({ i18n }) => (
                    <MosaicWindow
                      path={path}
                      title={i18n._(editor.title)}
                      toolbarControls={editor.toolbarControls}
                    >
                      {editor.renderEditor()}
                    </MosaicWindow>
                  )}
                </I18n>
              );
            }}
            value={this.state.mosaicNode}
            onChange={this._onChange}
            onRelease={this._onChanged}
          />
        )}
      </GDevelopThemeContext.Consumer>
    );
  }
}
