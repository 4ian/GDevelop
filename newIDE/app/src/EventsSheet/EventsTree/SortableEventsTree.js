// @flow
import * as React from 'react';
import { VariableSizeList } from 'react-window';
import classNames from 'classnames';
import { AutoSizer } from 'react-virtualized';
import type { ProjectScopedContainersAccessor } from '../../InstructionOrExpression/EventsScope';

// -- Types --

// A node displayed by the SortableTree. Almost always represents an
// event, except for the buttons at the bottom of the sheet and the tutorial.
export type SortableTreeNode = {|
  title: (node: {| node: SortableTreeNode |}) => React.Node,
  children: Array<any>,
  expanded: boolean,

  eventsList: gdEventsList,
  event: ?gdBaseEvent,
  depth: number,
  disabled: boolean,
  indexInList: number,
  rowIndex: number,
  nodePath: Array<number>,
  relativeNodePath: Array<number>,
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  key: number | string,
  isValidElseEvent: boolean,
  fixedHeight?: ?number,
|};

type FlatDataEntry = {
  node: SortableTreeNode,
  path: Array<number | string>,
  lowerSiblingCounts: Array<number>,
  treeIndex: number,
};

type RowItemData = {
  flatData: Array<FlatDataEntry>,
  matchIndexSet: Set<number>,
  matchIndexes: Array<number>,
  onVisibilityToggle: ({| node: SortableTreeNode |}) => void,
  scaffoldBlockPxWidth: number,
  searchFocusOffset: ?number,
};

type Props = {|
  treeData: Array<SortableTreeNode>,
  scaffoldBlockPxWidth: number,
  onVisibilityToggle: ({| node: SortableTreeNode |}) => void,
  rowHeight: ({ node: ?SortableTreeNode }) => number,
  searchMethod?: ({
    node: SortableTreeNode,
    searchQuery: any,
    path: Array<number | string>,
    treeIndex: number,
  }) => boolean,
  searchQuery?: any,
  searchFocusOffset?: ?number,
  className?: string,
  reactVirtualizedListProps?: {
    ref?: (list: {
      scrollToRow: (row: number) => void,
      recomputeRowHeights: () => void,
      container: ?HTMLDivElement,
    }) => void,
    onScroll?: (event: {
      scrollTop: number,
      scrollHeight: number,
      clientHeight: number,
    }) => void,
    scrollToAlignment?: string,
  },
|};

// -- Tree walk utilities --

const defaultGetNodeKey = ({ treeIndex }: { treeIndex: number }) => treeIndex;

/**
 * Recursively walk visible tree nodes in display order, calling `callback`
 * for each. Returns the last treeIndex visited, or `false` if the callback
 * signalled early exit.
 */
const walkNodes = (
  nodes: Array<SortableTreeNode>,
  callback: (entry: FlatDataEntry) => void | false,
  getNodeKey: ({ treeIndex: number }) => number | string,
  ignoreCollapsed: boolean,
  startIndex: number,
  parentPath: Array<number | string>,
  parentLowerSiblingCounts: Array<number>
): number | false => {
  let currentIndex = startIndex;
  const count = nodes.length;

  for (let i = 0; i < count; i++) {
    currentIndex++;
    const node = nodes[i];
    const path = [...parentPath, getNodeKey({ treeIndex: currentIndex })];
    const lowerSiblingCounts = [...parentLowerSiblingCounts, count - i - 1];

    const result = callback({
      node,
      path,
      lowerSiblingCounts,
      treeIndex: currentIndex,
    });
    if (result === false) return false;

    if (node.children.length > 0 && (!ignoreCollapsed || node.expanded)) {
      // $FlowFixMe[incompatible-type]
      currentIndex = walkNodes(
        node.children,
        callback,
        getNodeKey,
        ignoreCollapsed,
        currentIndex,
        path,
        lowerSiblingCounts
      );
      if (currentIndex === false) return false;
    }
  }

  return currentIndex;
};

export const getFlatDataFromTree = ({
  treeData,
  getNodeKey,
  ignoreCollapsed = true,
}: {
  treeData: Array<SortableTreeNode>,
  getNodeKey: ({ treeIndex: number }) => number | string,
  ignoreCollapsed?: boolean,
}): Array<FlatDataEntry> => {
  if (!treeData || treeData.length < 1) return [];

  const flattened: Array<FlatDataEntry> = [];
  walkNodes(
    treeData,
    entry => {
      flattened.push(entry);
    },
    getNodeKey,
    ignoreCollapsed,
    -1,
    [],
    []
  );
  return flattened;
};

export const getNodeAtPath = ({
  treeData,
  path,
  getNodeKey,
  ignoreCollapsed = true,
}: {
  treeData: Array<SortableTreeNode>,
  path: $ReadOnlyArray<number | string>,
  getNodeKey: ({ treeIndex: number }) => number | string,
  ignoreCollapsed?: boolean,
}): ?{ node: SortableTreeNode, treeIndex: number } => {
  let foundNodeInfo = null;
  walkNodes(
    treeData,
    entry => {
      if (
        entry.path.length === path.length &&
        entry.path.every((value, idx) => value === path[idx])
      ) {
        foundNodeInfo = { node: entry.node, treeIndex: entry.treeIndex };
        return false;
      }
    },
    getNodeKey,
    ignoreCollapsed,
    -1,
    [],
    []
  );
  return foundNodeInfo;
};

// -- Search --

const getSearchMatches = ({
  flatData,
  searchMethod,
  searchQuery,
}: {
  flatData: Array<FlatDataEntry>,
  searchMethod?: ({
    node: SortableTreeNode,
    searchQuery: any,
    path: Array<number | string>,
    treeIndex: number,
  }) => boolean,
  searchQuery?: any,
}) => {
  if (!searchMethod || !searchQuery) {
    // $FlowFixMe[underconstrained-implicit-instantiation]
    return { matchIndexes: [], matchIndexSet: new Set() };
  }

  const matchIndexes = [];
  flatData.forEach((entry, index) => {
    if (
      searchMethod({
        node: entry.node,
        searchQuery,
        path: entry.path,
        treeIndex: entry.treeIndex,
      })
    ) {
      matchIndexes.push(index);
    }
  });

  return { matchIndexes, matchIndexSet: new Set(matchIndexes) };
};

// -- Row component --

/**
 * Stable row component for react-window. Defined outside SortableEventsTree
 * so its reference never changes, preventing react-window from
 * unmounting/remounting all visible rows on every render.
 * Changing data is received via `data` (react-window's itemData pattern).
 */
const TreeRow = ({
  index,
  style,
  data,
}: {
  index: number,
  style: any,
  data: RowItemData,
}) => {
  const {
    flatData,
    matchIndexSet,
    matchIndexes,
    onVisibilityToggle,
    scaffoldBlockPxWidth,
    searchFocusOffset,
  } = data;

  const entry = flatData[index];
  if (!entry) return null;

  const { node, lowerSiblingCounts } = entry;
  const depth = lowerSiblingCounts.length;
  const isSearchMatch = matchIndexSet.has(index);
  const isSearchFocus =
    searchFocusOffset != null && matchIndexes[searchFocusOffset] === index;

  const scaffold = lowerSiblingCounts.map((lowerSiblingCount, i) => {
    const isNodeDepth = i === depth - 1;

    // Some nodes are not linked to the "parent" node by a horizontal branch connector.
    const drawHorizontal =
      !(node.isValidElseEvent && isNodeDepth) &&
      !(
        node.key === 'bottom-buttons' || node.key === 'eventstree-tutorial-node'
      );

    let lineClass = '';
    if (lowerSiblingCount > 0) {
      if (index === 0) {
        lineClass = drawHorizontal
          ? 'rst__lineHalfHorizontalRight rst__lineHalfVerticalBottom'
          : 'rst__lineHalfVerticalBottom';
      } else if (isNodeDepth) {
        lineClass = drawHorizontal
          ? 'rst__lineHalfHorizontalRight rst__lineFullVertical'
          : 'rst__lineFullVertical';
      } else {
        lineClass = 'rst__lineFullVertical';
      }
    } else if (index === 0) {
      lineClass = drawHorizontal ? 'rst__lineHalfHorizontalRight' : '';
    } else if (isNodeDepth) {
      lineClass = drawHorizontal
        ? 'rst__lineHalfVerticalTop rst__lineHalfHorizontalRight'
        : 'rst__lineHalfVerticalTop';
    }

    return (
      <div
        key={`scaffold-${i}`}
        style={{ width: scaffoldBlockPxWidth }}
        className={classNames('rst__lineBlock', lineClass)}
      />
    );
  });

  const hasChildren = node.children.length > 0;

  return (
    <div style={style} className="rst__node">
      {scaffold}
      <div
        className="rst__nodeContent"
        style={{ left: scaffoldBlockPxWidth * depth }}
      >
        {hasChildren && (
          <div>
            <button
              type="button"
              aria-label={node.expanded ? 'Collapse' : 'Expand'}
              className={
                node.expanded ? 'rst__collapseButton' : 'rst__expandButton'
              }
              style={{ left: -0.5 * scaffoldBlockPxWidth }}
              onClick={() => onVisibilityToggle({ node })}
            />
            {node.expanded && (
              <div
                style={{ width: scaffoldBlockPxWidth }}
                className="rst__lineChildren"
              />
            )}
          </div>
        )}
        <div className="rst__rowWrapper">
          <div
            className={classNames(
              'rst__row',
              isSearchMatch && 'rst__rowSearchMatch',
              isSearchFocus && 'rst__rowSearchFocus'
            )}
          >
            <div className="rst__rowContents">
              <div className="rst__rowLabel">
                <span className="rst__rowTitle">{node.title({ node })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// -- Main component --

const SortableEventsTree = ({
  treeData,
  scaffoldBlockPxWidth,
  onVisibilityToggle,
  rowHeight,
  searchMethod,
  searchQuery,
  searchFocusOffset,
  className,
  reactVirtualizedListProps,
}: Props): React.MixedElement => {
  // $FlowFixMe[value-as-type]
  const listRef = React.useRef<?VariableSizeList>(null);
  const outerRef = React.useRef<?HTMLDivElement>(null);
  const alignment =
    (reactVirtualizedListProps &&
      reactVirtualizedListProps.scrollToAlignment) ||
    'auto';

  const flatData = React.useMemo(
    () =>
      getFlatDataFromTree({
        treeData,
        getNodeKey: defaultGetNodeKey,
        ignoreCollapsed: true,
      }),
    [treeData]
  );

  const { matchIndexes, matchIndexSet } = React.useMemo(
    () => getSearchMatches({ flatData, searchMethod, searchQuery }),
    [flatData, searchMethod, searchQuery]
  );

  React.useEffect(
    () => {
      if (!reactVirtualizedListProps || !reactVirtualizedListProps.ref) return;
      reactVirtualizedListProps.ref({
        scrollToRow: (row: number) => {
          if (listRef.current) {
            listRef.current.scrollToItem(row, alignment);
          }
        },
        recomputeRowHeights: () => {
          if (listRef.current) {
            listRef.current.resetAfterIndex(0, true);
          }
        },
        container: outerRef.current,
      });
    },
    [alignment, reactVirtualizedListProps, flatData.length]
  );

  const itemSize = React.useCallback(
    (index: number) => {
      const entry = flatData[index];
      return Math.max(1, rowHeight({ node: entry ? entry.node : null }));
    },
    [flatData, rowHeight]
  );

  const handleScroll = React.useCallback(
    ({ scrollOffset }: { scrollOffset: number }) => {
      if (
        reactVirtualizedListProps &&
        reactVirtualizedListProps.onScroll &&
        outerRef.current
      ) {
        reactVirtualizedListProps.onScroll({
          scrollTop: scrollOffset,
          clientHeight: outerRef.current.clientHeight,
          scrollHeight: outerRef.current.scrollHeight,
        });
      }
    },
    [reactVirtualizedListProps]
  );

  const itemData: RowItemData = React.useMemo(
    () => ({
      flatData,
      matchIndexSet,
      // $FlowFixMe[incompatible-type]
      matchIndexes,
      onVisibilityToggle,
      scaffoldBlockPxWidth,
      searchFocusOffset,
    }),
    [
      flatData,
      matchIndexSet,
      matchIndexes,
      onVisibilityToggle,
      scaffoldBlockPxWidth,
      searchFocusOffset,
    ]
  );

  const itemKey = React.useCallback((index: number, data: RowItemData) => {
    const entry = data.flatData[index];
    return entry ? String(entry.node.key) : String(index);
  }, []);

  return (
    <div className={className}>
      <AutoSizer>
        {({ width, height }) => (
          <VariableSizeList
            ref={listRef}
            outerRef={outerRef}
            className="rst__virtualScrollOverride"
            height={height}
            width={width}
            itemCount={flatData.length}
            itemSize={itemSize}
            itemData={itemData}
            itemKey={itemKey}
            onScroll={handleScroll}
          >
            {TreeRow}
          </VariableSizeList>
        )}
      </AutoSizer>
    </div>
  );
};

export default SortableEventsTree;
