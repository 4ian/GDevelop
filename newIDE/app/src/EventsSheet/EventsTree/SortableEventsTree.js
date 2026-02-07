// @flow
import * as React from 'react';
import { VariableSizeList } from 'react-window';
import classNames from 'classnames';
import { type SortableTreeNode } from '.';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { eventsTree } from './ClassNames';

/**
 * A flattened representation of a visible node in the tree.
 */
type FlatNode = {|
  node: SortableTreeNode,
  depth: number,
  /**
   * For each depth from 0 to depth-1, whether the ancestor at that depth
   * has more siblings below it (determines if the vertical line continues).
   */
  lineContinuation: Array<boolean>,
  hasChildren: boolean,
|};

export type SortableEventsTreeRef = {|
  recomputeRowHeights: () => void,
  scrollToRow: (row: number) => void,
  scrollBy: (options: { top: number }) => void,
|};

type Props = {|
  treeData: Array<SortableTreeNode>,
  scaffoldBlockPxWidth: number,
  onVisibilityToggle: ({| node: SortableTreeNode |}) => void,
  rowHeight: ({| node: ?SortableTreeNode |}) => number,
  searchMethod: ({|
    node: SortableTreeNode,
    searchQuery: ?Array<gdBaseEvent>,
  |}) => boolean,
  searchQuery: ?Array<gdBaseEvent>,
  searchFocusOffset: ?number,
  className: string,
  onScroll: (event: {
    scrollTop: number,
    scrollHeight: number,
    clientHeight: number,
  }) => void,
  height: number,
|};

/**
 * Flatten tree data to a list of visible (expanded) nodes,
 * computing scaffolding line information for each.
 */
const flattenTreeData = (
  treeData: Array<SortableTreeNode>
): Array<FlatNode> => {
  const flatNodes: Array<FlatNode> = [];

  const flatten = (
    nodes: Array<SortableTreeNode>,
    depth: number,
    ancestorLineContinuation: Array<boolean>
  ) => {
    nodes.forEach((node, index) => {
      const isLast = index === nodes.length - 1;
      const lineContinuation = [...ancestorLineContinuation, !isLast];
      const hasChildren =
        node.children != null && node.children.length > 0;

      flatNodes.push({
        node,
        depth,
        lineContinuation,
        hasChildren,
      });

      if (node.expanded && hasChildren) {
        flatten(node.children, depth + 1, lineContinuation);
      }
    });
  };

  flatten(treeData, 0, []);
  return flatNodes;
};

/**
 * Compute which flat nodes match the search, and which is focused.
 */
const computeSearchMatches = (
  flatNodes: Array<FlatNode>,
  searchMethod: ({|
    node: SortableTreeNode,
    searchQuery: ?Array<gdBaseEvent>,
  |}) => boolean,
  searchQuery: ?Array<gdBaseEvent>,
  searchFocusOffset: ?number
): {
  matchSet: Set<number>,
  focusIndex: number | null,
} => {
  if (!searchQuery) return { matchSet: new Set(), focusIndex: null };

  const matchIndices: Array<number> = [];
  flatNodes.forEach((flatNode, index) => {
    if (searchMethod({ node: flatNode.node, searchQuery })) {
      matchIndices.push(index);
    }
  });

  const matchSet = new Set(matchIndices);
  const focusIndex =
    searchFocusOffset != null && matchIndices.length > 0
      ? matchIndices[searchFocusOffset % matchIndices.length]
      : null;

  return { matchSet, focusIndex };
};

/**
 * A single row in the virtualized tree.
 * Renders scaffolding lines, expand/collapse button, and the node content.
 */
const TreeRow = React.memo(
  ({
    flatNode,
    scaffoldBlockPxWidth,
    onVisibilityToggle,
    isSearchMatch,
    isSearchFocus,
  }: {|
    flatNode: FlatNode,
    scaffoldBlockPxWidth: number,
    onVisibilityToggle: ({| node: SortableTreeNode |}) => void,
    isSearchMatch: boolean,
    isSearchFocus: boolean,
  |}) => {
    const { node, depth, lineContinuation, hasChildren } = flatNode;

    return (
      <div className="rst__node">
        {/* Scaffold blocks - one per depth level */}
        {depth > 0 &&
          Array.from({ length: depth }, (_, i) => {
            const isLastDepth = i === depth - 1;
            const hasLineContinuation = lineContinuation[i];

            let lineClass;
            if (isLastDepth) {
              // At the node's own depth: draw connector
              lineClass = classNames('rst__lineBlock', {
                rst__lineHalfHorizontalRight: true,
                rst__lineFullVertical: hasLineContinuation,
                rst__lineHalfVerticalTop: !hasLineContinuation,
              });
            } else {
              // Ancestor depth: draw continuing line if more siblings exist
              lineClass = classNames('rst__lineBlock', {
                rst__lineFullVertical: hasLineContinuation,
              });
            }

            return (
              <div
                key={i}
                className={lineClass}
                style={{ width: scaffoldBlockPxWidth }}
              />
            );
          })}

        {/* Expand/collapse button */}
        {hasChildren && (
          <button
            type="button"
            aria-label={node.expanded ? 'Collapse' : 'Expand'}
            className={
              node.expanded ? 'rst__collapseButton' : 'rst__expandButton'
            }
            style={{ left: depth * scaffoldBlockPxWidth - 8 }}
            onClick={e => {
              e.stopPropagation();
              onVisibilityToggle({ node });
            }}
          />
        )}

        {/* Node content */}
        <div
          className={classNames('rst__nodeContent', {
            rst__rowSearchMatch: isSearchMatch,
            rst__rowSearchFocus: isSearchFocus,
          })}
        >
          <div className="rst__rowWrapper">
            <div className="rst__row">
              <div className="rst__rowContents">
                <div className="rst__rowLabel">
                  <span className="rst__rowTitle">
                    {node.title({ node })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);

/**
 * SortableEventsTree is a lightweight replacement for react-sortable-tree.
 * It renders a virtualized tree of events using react-window's VariableSizeList,
 * with scaffolding lines, expand/collapse buttons, and search highlighting.
 *
 * Drag-and-drop is NOT handled here - it's handled by the parent EventsTree
 * component using GDevelop's own DragSourceAndDropTarget system.
 */
const SortableEventsTree = React.forwardRef<Props, SortableEventsTreeRef>(
  (props, ref) => {
    const {
      treeData,
      scaffoldBlockPxWidth,
      onVisibilityToggle,
      rowHeight,
      searchMethod,
      searchQuery,
      searchFocusOffset,
      className,
      onScroll,
      height,
    } = props;

    const gdevelopTheme = React.useContext(GDevelopThemeContext);
    const listRef = React.useRef<?VariableSizeList>(null);
    const outerRef = React.useRef<?HTMLDivElement>(null);

    // Flatten tree data to visible nodes
    const flatNodes = React.useMemo(() => flattenTreeData(treeData), [
      treeData,
    ]);

    // Compute search matches
    const { matchSet, focusIndex } = React.useMemo(
      () =>
        computeSearchMatches(
          flatNodes,
          searchMethod,
          searchQuery,
          searchFocusOffset
        ),
      [flatNodes, searchMethod, searchQuery, searchFocusOffset]
    );

    // Scroll to focused search result when it changes
    React.useEffect(
      () => {
        if (focusIndex != null && listRef.current) {
          listRef.current.scrollToItem(focusIndex, 'center');
        }
      },
      [focusIndex]
    );

    // Expose imperative handle
    React.useImperativeHandle(ref, () => ({
      recomputeRowHeights: () => {
        if (listRef.current) {
          listRef.current.resetAfterIndex(0, false);
        }
      },
      scrollToRow: (row: number) => {
        if (listRef.current) {
          listRef.current.scrollToItem(row, 'center');
        }
      },
      scrollBy: (options: { top: number }) => {
        if (outerRef.current) {
          outerRef.current.scrollBy(options);
        }
      },
    }));

    const getItemSize = React.useCallback(
      (index: number): number => {
        if (index < 0 || index >= flatNodes.length) return 0;
        return rowHeight({ node: flatNodes[index].node });
      },
      [flatNodes, rowHeight]
    );

    const handleScroll = React.useCallback(
      ({
        scrollOffset,
        scrollUpdateWasRequested,
      }: {
        scrollOffset: number,
        scrollUpdateWasRequested: boolean,
      }) => {
        if (outerRef.current) {
          const el = outerRef.current;
          onScroll({
            scrollTop: el.scrollTop,
            scrollHeight: el.scrollHeight,
            clientHeight: el.clientHeight,
          });
        }
      },
      [onScroll]
    );

    const treeClassName = `${eventsTree} ${
      gdevelopTheme.palette.type === 'light' ? 'light-theme' : 'dark-theme'
    } ${className}`;

    const Row = React.useCallback(
      ({
        index,
        style,
      }: {
        index: number,
        style: { [string]: string | number },
      }) => {
        const flatNode = flatNodes[index];
        if (!flatNode) return null;

        return (
          <div style={style}>
            <TreeRow
              flatNode={flatNode}
              scaffoldBlockPxWidth={scaffoldBlockPxWidth}
              onVisibilityToggle={onVisibilityToggle}
              isSearchMatch={matchSet.has(index)}
              isSearchFocus={focusIndex === index}
            />
          </div>
        );
      },
      [
        flatNodes,
        scaffoldBlockPxWidth,
        onVisibilityToggle,
        matchSet,
        focusIndex,
      ]
    );

    return (
      <div className={treeClassName} style={{ height: '100%' }}>
        <VariableSizeList
          ref={listRef}
          outerRef={outerRef}
          height={height}
          width="100%"
          itemCount={flatNodes.length}
          itemSize={getItemSize}
          onScroll={handleScroll}
          className="rst__virtualScrollOverride"
          overscanCount={10}
          estimatedItemSize={44}
        >
          {Row}
        </VariableSizeList>
      </div>
    );
  }
);

export default SortableEventsTree;

/**
 * Flatten tree data into a flat array of { node } objects
 * (matching the format of react-sortable-tree's getFlatDataFromTree).
 * Only includes visible (expanded) nodes.
 */
export const getFlatVisibleNodes = (
  treeData: Array<SortableTreeNode>
): Array<{| node: SortableTreeNode |}> => {
  const result: Array<{| node: SortableTreeNode |}> = [];

  const walk = (nodes: Array<SortableTreeNode>) => {
    nodes.forEach(node => {
      result.push({ node });
      if (node.expanded && node.children && node.children.length > 0) {
        walk(node.children);
      }
    });
  };

  walk(treeData);
  return result;
};

