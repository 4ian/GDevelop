// @flow
import { I18n } from '@lingui/react';
import * as React from 'react';
import {
  MosaicWindow as RMMosaicWindow,
  MosaicWithoutDragDropContext,
  getLeaves,
} from 'react-mosaic-component';
import CloseButton from './CloseButton';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import { useDebounce } from '../../Utils/UseDebounce';

// EditorMosaic default styling:
import 'react-mosaic-component/react-mosaic-component.css';
import './style.css';
import classNames from 'classnames';

export type Editor = {|
  type: 'primary' | 'secondary',
  renderEditor: () => React.Node,
  noTitleBar?: boolean,
  noSoftKeyboardAvoidance?: boolean,
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

const resizeNode = (
  currentNode: ?EditorMosaicNode,
  resizedNode: ?EditorMosaicNode,
  splitPercentage: number
): ?EditorMosaicNode => {
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

export type EditorMosaicInterface = {|
  getOpenedEditorNames: () => Array<string>,
  toggleEditor: (
    editorName: string,
    position: 'start' | 'end',
    splitPercentage: number,
    direction: 'row' | 'column'
  ) => boolean,
  collapseEditor: (editorName: string) => boolean,
  uncollapseEditor: (
    editorName: string,
    defaultSplitPercentage: number
  ) => boolean,
|};

type Props = {|
  initialNodes: EditorMosaicNode,
  editors: {
    [string]: Editor,
  },
  limitToOneSecondaryEditor?: boolean,
  onOpenedEditorsChanged?: () => void,
  onPersistNodes?: EditorMosaicNode => void,
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
      editors,
      limitToOneSecondaryEditor,
      onOpenedEditorsChanged,
      onPersistNodes,
    },
    ref
  ) => {
    const [mosaicNode, setMosaicNode] = React.useState<?EditorMosaicNode>(
      initialNodes
    );
    const collapsedEditorSize = React.useRef<Map<string, number>>(new Map());

    const openEditor = React.useCallback(
      (
        editorName: string,
        position: 'start' | 'end',
        splitPercentage: number,
        direction: 'row' | 'column'
      ) => {
        const editor = editors[editorName];
        if (!editor) return false;

        const openedEditorNames = getLeaves(mosaicNode);
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
            setMosaicNode(
              replaceNode(mosaicNode, secondaryEditorName, editorName)
            );

            return true;
          }
        }

        // Open a new editor at the indicated position.
        setMosaicNode(
          addNode(mosaicNode, editorName, position, splitPercentage, direction)
        );

        return true;
      },
      [mosaicNode, editors, limitToOneSecondaryEditor]
    );

    React.useImperativeHandle(ref, () => ({
      getOpenedEditorNames: (): Array<string> => {
        return getLeaves(mosaicNode);
      },
      toggleEditor: (
        editorName: string,
        position: 'start' | 'end',
        splitPercentage: number,
        direction: 'row' | 'column'
      ) => {
        const editor = editors[editorName];
        if (!editor) return false;

        const openedEditorNames = getLeaves(mosaicNode);
        if (openedEditorNames.indexOf(editorName) !== -1) {
          // The editor is already opened: close it.
          setMosaicNode(removeNode(mosaicNode, editorName));

          return false;
        }

        return openEditor(editorName, position, splitPercentage, direction);
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

    return (
      <I18n>
        {({ i18n }) => (
          <MosaicWithoutDragDropContext
            className={classNames({
              'mosaic-gd-theme': true,
              'mosaic-blueprint-theme': true,
              // Move the entire mosaic up when the soft keyboard is open:
              'avoid-soft-keyboard': true,
            })}
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
                <MosaicWindow
                  path={path}
                  title={i18n._(editor.title)}
                  toolbarControls={editor.toolbarControls}
                >
                  {editor.renderEditor()}
                </MosaicWindow>
              );
            }}
            value={mosaicNode}
            onChange={setMosaicNode}
            onRelease={setMosaicNode}
          />
        )}
      </I18n>
    );
  }
);

export default EditorMosaic;
