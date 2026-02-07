// @flow
import * as React from 'react';
import { VariableSizeList } from 'react-window';
import classNames from 'classnames';
import { AutoSizer } from 'react-virtualized';

type SortableTreeNode = {
  title: (node: {| node: SortableTreeNode |}) => React.Node,
  children: Array<any>,
  expanded: boolean,
  [string]: any,
};

type FlatDataEntry = {
  node: SortableTreeNode,
  path: Array<number | string>,
  lowerSiblingCounts: Array<number>,
  treeIndex: number,
};

type SortableEventsTreeProps = {|
  treeData: Array<SortableTreeNode>,
  scaffoldBlockPxWidth: number,
  onChange: () => void,
  onVisibilityToggle: ({
    node: SortableTreeNode,
    path: Array<number | string>,
    treeIndex: number,
  }) => void,
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
  slideRegionSize?: number,
|};

const defaultGetNodeKey = ({ treeIndex }: { treeIndex: number }) => treeIndex;

const walkDescendants = ({
  callback,
  getNodeKey,
  ignoreCollapsed,
  isPseudoRoot = false,
  node,
  parentNode = null,
  currentIndex,
  path = [],
  lowerSiblingCounts = [],
}: {
  callback: ({
    node: SortableTreeNode,
    parentNode: ?SortableTreeNode,
    path: Array<number | string>,
    lowerSiblingCounts: Array<number>,
    treeIndex: number,
  }) => void | false,
  getNodeKey: ({ node: SortableTreeNode, treeIndex: number }) => number | string,
  ignoreCollapsed: boolean,
  isPseudoRoot?: boolean,
  node: SortableTreeNode,
  parentNode?: ?SortableTreeNode,
  currentIndex: number,
  path?: Array<number | string>,
  lowerSiblingCounts?: Array<number>,
}): number | false => {
  const selfPath = isPseudoRoot
    ? []
    : [...path, getNodeKey({ node, treeIndex: currentIndex })];
  const selfInfo = isPseudoRoot
    ? null
    : {
        node,
        parentNode,
        path: selfPath,
        lowerSiblingCounts,
        treeIndex: currentIndex,
      };

  if (!isPseudoRoot && selfInfo) {
    const callbackResult = callback(selfInfo);
    if (callbackResult === false) return false;
  }

  if (
    !node.children ||
    (node.expanded !== true && ignoreCollapsed && !isPseudoRoot)
  ) {
    return currentIndex;
  }

  let childIndex = currentIndex;
  const childCount = node.children.length;

  if (typeof node.children !== 'function') {
    for (let i = 0; i < childCount; i += 1) {
      childIndex = walkDescendants({
        callback,
        getNodeKey,
        ignoreCollapsed,
        node: node.children[i],
        parentNode: isPseudoRoot ? null : node,
        currentIndex: childIndex + 1,
        lowerSiblingCounts: [...lowerSiblingCounts, childCount - i - 1],
        path: selfPath,
      });
      if (childIndex === false) {
        return false;
      }
    }
  }

  return childIndex;
};

const walk = ({
  treeData,
  getNodeKey,
  callback,
  ignoreCollapsed = true,
}: {
  treeData: Array<SortableTreeNode>,
  getNodeKey: ({ node: SortableTreeNode, treeIndex: number }) => number | string,
  callback: ({
    node: SortableTreeNode,
    parentNode: ?SortableTreeNode,
    path: Array<number | string>,
    lowerSiblingCounts: Array<number>,
    treeIndex: number,
  }) => void | false,
  ignoreCollapsed?: boolean,
}) => {
  if (!treeData || treeData.length < 1) return;

  walkDescendants({
    callback,
    getNodeKey,
    ignoreCollapsed,
    isPseudoRoot: true,
    node: { children: treeData, expanded: true },
    currentIndex: -1,
    path: [],
    lowerSiblingCounts: [],
  });
};

export const getFlatDataFromTree = ({
  treeData,
  getNodeKey,
  ignoreCollapsed = true,
}: {
  treeData: Array<SortableTreeNode>,
  getNodeKey: ({ node: SortableTreeNode, treeIndex: number }) => number | string,
  ignoreCollapsed?: boolean,
}): Array<FlatDataEntry> => {
  if (!treeData || treeData.length < 1) return [];

  const flattened: Array<FlatDataEntry> = [];
  walk({
    treeData,
    getNodeKey,
    ignoreCollapsed,
    callback: nodeInfo => {
      flattened.push(nodeInfo);
    },
  });
  return flattened;
};

export const getNodeAtPath = ({
  treeData,
  path,
  getNodeKey,
  ignoreCollapsed = true,
}: {
  treeData: Array<SortableTreeNode>,
  path: Array<number | string>,
  getNodeKey: ({ node: SortableTreeNode, treeIndex: number }) => number | string,
  ignoreCollapsed?: boolean,
}): ?{ node: SortableTreeNode, treeIndex: number } => {
  let foundNodeInfo = null;
  walk({
    treeData,
    getNodeKey,
    ignoreCollapsed,
    callback: nodeInfo => {
      if (
        nodeInfo.path.length === path.length &&
        nodeInfo.path.every((value, index) => value === path[index])
      ) {
        foundNodeInfo = {
          node: nodeInfo.node,
          treeIndex: nodeInfo.treeIndex,
        };
        return false;
      }
    },
  });
  return foundNodeInfo;
};

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

const SortableEventsTree = ({
  treeData,
  scaffoldBlockPxWidth,
  onChange,
  onVisibilityToggle,
  rowHeight,
  searchMethod,
  searchQuery,
  searchFocusOffset,
  className,
  reactVirtualizedListProps,
}: SortableEventsTreeProps) => {
  void onChange;
  const listRef = React.useRef<?VariableSizeList>(null);
  const outerRef = React.useRef<?HTMLDivElement>(null);
  const alignment = reactVirtualizedListProps?.scrollToAlignment || 'auto';

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

  React.useEffect(() => {
    if (!reactVirtualizedListProps?.ref) return;
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
  }, [alignment, reactVirtualizedListProps, flatData.length]);

  const itemSize = React.useCallback(
    (index: number) => {
      const node = flatData[index] ? flatData[index].node : null;
      return Math.max(1, rowHeight({ node }));
    },
    [flatData, rowHeight]
  );

  const handleScroll = React.useCallback(
    ({ scrollOffset }: { scrollOffset: number }) => {
      if (reactVirtualizedListProps?.onScroll && outerRef.current) {
        reactVirtualizedListProps.onScroll({
          scrollTop: scrollOffset,
          clientHeight: outerRef.current.clientHeight,
          scrollHeight: outerRef.current.scrollHeight,
        });
      }
    },
    [reactVirtualizedListProps]
  );

  const renderRow = React.useCallback(
    ({ index, style }: { index: number, style: any }) => {
      const entry = flatData[index];
      if (!entry) return null;

      const { node, path, lowerSiblingCounts, treeIndex } = entry;
      const scaffoldBlockCount = lowerSiblingCounts.length;
      const isSearchMatch = matchIndexSet.has(index);
      const isSearchFocus =
        searchFocusOffset != null && matchIndexes[searchFocusOffset] === index;

      const scaffold = lowerSiblingCounts.map((lowerSiblingCount, i) => {
        let lineClass = '';
        if (lowerSiblingCount > 0) {
          if (index === 0) {
            lineClass = 'rst__lineHalfHorizontalRight rst__lineHalfVerticalBottom';
          } else if (i === scaffoldBlockCount - 1) {
            lineClass = 'rst__lineHalfHorizontalRight rst__lineFullVertical';
          } else {
            lineClass = 'rst__lineFullVertical';
          }
        } else if (index === 0) {
          lineClass = 'rst__lineHalfHorizontalRight';
        } else if (i === scaffoldBlockCount - 1) {
          lineClass = 'rst__lineHalfVerticalTop rst__lineHalfHorizontalRight';
        }

        return (
          <div
            key={`scaffold-${i}`}
            style={{ width: scaffoldBlockPxWidth }}
            className={classNames('rst__lineBlock', lineClass)}
          />
        );
      });

      const nodeContentStyle = {
        left: scaffoldBlockPxWidth * scaffoldBlockCount,
      };
      const hasChildren =
        node.children && typeof node.children !== 'function'
          ? node.children.length > 0
          : !!node.children;

      return (
        <div style={style} className="rst__node">
          {scaffold}
          <div className="rst__nodeContent" style={nodeContentStyle}>
            {hasChildren && (
              <div>
                <button
                  type="button"
                  aria-label={node.expanded ? 'Collapse' : 'Expand'}
                  className={classNames(
                    node.expanded ? 'rst__collapseButton' : 'rst__expandButton'
                  )}
                  style={{ left: -0.5 * scaffoldBlockPxWidth }}
                  onClick={() => {
                    onVisibilityToggle({ node, path, treeIndex });
                  }}
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
                    <span className="rst__rowTitle">
                      {typeof node.title === 'function'
                        ? node.title({ node, path, treeIndex })
                        : node.title}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    },
    [
      flatData,
      matchIndexSet,
      matchIndexes,
      onVisibilityToggle,
      scaffoldBlockPxWidth,
      searchFocusOffset,
    ]
  );

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
            onScroll={handleScroll}
          >
            {renderRow}
          </VariableSizeList>
        )}
      </AutoSizer>
    </div>
  );
};

export default SortableEventsTree;
