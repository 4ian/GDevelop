// @flow
import { I18n } from '@lingui/react';
import * as React from 'react';
import {
  MosaicWindow,
  MosaicWithoutDragDropContext,
  getLeaves,
} from 'react-mosaic-component';
import CloseButton from './CloseButton';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import { useDebounce } from '../../Utils/UseDebounce';
import { addNode } from './NodesHandling';

// EditorMosaic default styling:
import 'react-mosaic-component/react-mosaic-component.css';
import './style.css';
import classNames from 'classnames';

export type Direction = 'row' | 'column';

export type EditorMosaicNode =
  | {|
      direction: Direction,
      splitPercentage: number,
      first: EditorMosaicNode,
      second: EditorMosaicNode,
    |}
  | string;

export type EditorMosaicBranch = {|
  direction: Direction,
  splitPercentage: number,
  first: EditorMosaicNode,
  second: EditorMosaicNode,
|};

export type Editor = {|
  type: 'primary' | 'secondary',
  renderEditor: () => React.Node,
  noTitleBar?: boolean,
  noSoftKeyboardAvoidance?: boolean,
  title?: MessageDescriptor,
  toolbarControls?: Array<React.Node>,
|};

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

const resizeNode = (
  currentNode: EditorMosaicNode,
  resizedNode: EditorMosaicNode,
  splitPercentage: number
): EditorMosaicNode => {
  if (!currentNode) {
    return currentNode;
  }
  if (typeof currentNode === 'string') {
    return currentNode;
  }
  if (currentNode.first === resizedNode) {
    return {
      ...currentNode,
      splitPercentage: splitPercentage,
    };
  }
  if (currentNode.second === resizedNode) {
    return {
      ...currentNode,
      splitPercentage: 100 - splitPercentage,
    };
  }
  return {
    ...currentNode,
    first: resizeNode(currentNode.first, resizedNode, splitPercentage),
    second: resizeNode(currentNode.second, resizedNode, splitPercentage),
  };
};

const getNodeSize = (
  currentNode: ?EditorMosaicNode,
  resizedNode: ?EditorMosaicNode
): number => {
  if (!currentNode) {
    return 0;
  }
  if (typeof currentNode === 'string') {
    return 0;
  }
  if (currentNode.first === resizedNode) {
    return currentNode.splitPercentage;
  }
  if (currentNode.second === resizedNode) {
    return 100 - currentNode.splitPercentage;
  }
  return (
    getNodeSize(currentNode.first, resizedNode) ||
    getNodeSize(currentNode.second, resizedNode)
  );
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

export type EditorMosaicInterface = {|
  getOpenedEditorNames: () => Array<string>,
  toggleEditor: (
    editorName: string,
    position: 'left' | 'right' | 'bottom'
  ) => boolean,
  collapseEditor: (editorName: string) => boolean,
  uncollapseEditor: (
    editorName: string,
    defaultSplitPercentage: number
  ) => boolean,
|};

type Props = {|
  initialNodes: EditorMosaicNode,
  centralNodeId: string,
  editors: {
    [string]: Editor | null,
  },
  onOpenedEditorsChanged?: () => void,
  onPersistNodes?: EditorMosaicNode => void,
  isTransparent?: boolean,
  onDragOrResizedStarted?: () => void,
  onDragOrResizedEnded?: () => void,
|};

/**
 * @class EditorMosaic
 *
 * Can be used to create a mosaic of resizable editors.
 * Must be used inside a component wrapped in a DragDropContext.
 */
const EditorMosaic = React.forwardRef<Props, EditorMosaicInterface>(
  (
    {
      initialNodes,
      centralNodeId,
      editors,
      onOpenedEditorsChanged,
      onPersistNodes,
      onDragOrResizedStarted,
      onDragOrResizedEnded,
      isTransparent,
    },
    ref
  ) => {
    const isResizing = React.useRef(false);
    const [mosaicNode, setMosaicNode] = React.useState<?EditorMosaicNode>(
      initialNodes
    );
    const collapsedEditorSize = React.useRef<Map<string, number>>(new Map());

    const openEditor = React.useCallback(
      (editorName: string, position: 'left' | 'right' | 'bottom') => {
        const editor = editors[editorName];
        if (!editor) return false;

        const openedEditorNames = getLeaves(mosaicNode);
        if (openedEditorNames.indexOf(editorName) !== -1) {
          // Editor is already opened.
          return false;
        }

        if (!mosaicNode) {
          // Should never happen.
          return false;
        }

        // Open a new editor at the indicated position.
        const newNodes = addNode(
          mosaicNode,
          editorName,
          position,
          centralNodeId
        );
        setMosaicNode(newNodes);

        return true;
      },
      [mosaicNode, editors, centralNodeId]
    );

    React.useImperativeHandle(ref, () => ({
      getOpenedEditorNames: (): Array<string> => {
        return getLeaves(mosaicNode);
      },
      toggleEditor: (
        editorName: string,
        position: 'left' | 'right' | 'bottom'
      ) => {
        const editor = editors[editorName];
        if (!editor) return false;

        const openedEditorNames = getLeaves(mosaicNode);
        if (openedEditorNames.indexOf(editorName) !== -1) {
          // The editor is already opened: close it.
          setMosaicNode(removeNode(mosaicNode, editorName));

          return false;
        }

        return openEditor(editorName, position);
      },
      collapseEditor: (editorName: string) => {
        const editor = editors[editorName];
        if (!editor) return false;

        const nodeSize = getNodeSize(mosaicNode, editorName);
        if (nodeSize > 0) {
          collapsedEditorSize.current.set(
            editorName,
            getNodeSize(mosaicNode, editorName)
          );
        }
        if (!mosaicNode) {
          return false;
        }
        setMosaicNode(resizeNode(mosaicNode, editorName, 0));
        return true;
      },
      uncollapseEditor: (
        editorName: string,
        defaultSplitPercentage: number
      ) => {
        const editor = editors[editorName];
        if (!editor) return false;

        if (getNodeSize(mosaicNode, editorName) !== 0) {
          return false;
        }
        if (!mosaicNode) {
          return false;
        }

        setMosaicNode(
          resizeNode(
            mosaicNode,
            editorName,
            collapsedEditorSize.current.get(editorName) ||
              defaultSplitPercentage
          )
        );
        return true;
      },
    }));

    const debouncedPersistNodes = useDebounce(() => {
      if (onPersistNodes && mosaicNode) {
        onPersistNodes(mosaicNode);
      }
    }, 2000);

    React.useEffect(
      () => {
        if (onOpenedEditorsChanged) {
          onOpenedEditorsChanged();
        }

        debouncedPersistNodes();
      },
      [mosaicNode, onOpenedEditorsChanged, debouncedPersistNodes]
    );

    const onChange = React.useCallback(
      nodes => {
        if (!isResizing.current) {
          if (onDragOrResizedStarted) {
            onDragOrResizedStarted();
          }
          isResizing.current = true;
        }
        setMosaicNode(nodes);
      },
      [isResizing, onDragOrResizedStarted]
    );

    const onRelease = React.useCallback(
      () => {
        if (isResizing.current) {
          if (onDragOrResizedEnded) {
            onDragOrResizedEnded();
          }
          isResizing.current = false;
        }
      },
      [isResizing, onDragOrResizedEnded]
    );

    return (
      <I18n>
        {({ i18n }) => (
          <MosaicWithoutDragDropContext
            className={classNames({
              'mosaic-gd-theme': true,
              'mosaic-blueprint-theme': true,
              opaque: !isTransparent,
              // Move the entire mosaic up when the soft keyboard is open:
              'avoid-soft-keyboard': true,
            })}
            style={{ position: 'relative', width: '100%', height: '100%' }}
            renderTile={(editorName: string, path: string) => {
              const editor = editors[editorName];
              if (editor === undefined) {
                console.error(
                  'Trying to render un unknown editor: ' + editorName
                );
                return null;
              }
              if (editor === null) {
                return null;
              }

              if (editor.noTitleBar) {
                return editor.renderEditor();
              }

              return (
                <MosaicWindow
                  path={path}
                  title={i18n._(editor.title)}
                  onDragStart={onDragOrResizedStarted}
                  onDragEnd={onDragOrResizedEnded}
                  toolbarControls={
                    editor.toolbarControls || defaultToolbarControls
                  }
                  renderPreview={renderMosaicWindowPreview}
                >
                  {editor.renderEditor()}
                </MosaicWindow>
              );
            }}
            value={mosaicNode}
            onChange={onChange}
            onRelease={onRelease}
          />
        )}
      </I18n>
    );
  }
);

export default EditorMosaic;
