// @flow
import * as React from 'react';
import classNames from 'classnames';
import { VariableSizeList } from 'react-window';
import { type SortableTreeNode } from '.';

export type FlatTreeRow = {|
  node: SortableTreeNode,
  parentNode: ?SortableTreeNode,
  treeIndex: number,
  path: Array<number>,
  lowerSiblingCounts: Array<number>,
|};

type FlatTreeDataParams = {|
  treeData: Array<SortableTreeNode>,
  ignoreCollapsed?: boolean,
|};

export const getFlatDataFromTree = ({
  treeData,
  ignoreCollapsed = true,
}: FlatTreeDataParams): Array<FlatTreeRow> => {
  const rows: Array<FlatTreeRow> = [];

  const walk = (
    nodes: Array<SortableTreeNode>,
    parentNode: ?SortableTreeNode,
    parentPath: Array<number>,
    lowerSiblingCounts: Array<number>
  ) => {
    nodes.forEach((node, index) => {
      const treeIndex = rows.length;
      const currentLowerSiblingCounts = lowerSiblingCounts.concat(
        nodes.length - index - 1
      );
      const path = parentPath.concat(treeIndex);
      rows.push({
        node,
        parentNode,
        treeIndex,
        path,
        lowerSiblingCounts: currentLowerSiblingCounts,
      });

      if (
        node.children &&
        node.children.length > 0 &&
        (!ignoreCollapsed || node.expanded)
      ) {
        walk(node.children, node, path, currentLowerSiblingCounts);
      }
    });
  };

  walk(treeData, null, [], []);

  return rows;
};

export const getNodeAtPath = ({
  path,
  treeData,
  flatData,
  ignoreCollapsed = true,
}: {|
  path: Array<number>,
  treeData?: Array<SortableTreeNode>,
  flatData?: Array<FlatTreeRow>,
  ignoreCollapsed?: boolean,
|}) => {
  const rows =
    flatData || getFlatDataFromTree({ treeData: treeData || [], ignoreCollapsed });
  if (!path.length) return { node: null, path, treeIndex: -1 };

  const treeIndex = path[path.length - 1];
  const row = rows[treeIndex];
  if (!row) return { node: null, path, treeIndex };

  return {
    node: row.node,
    path: row.path,
    treeIndex: row.treeIndex,
  };
};

export type SortableEventsTreeHandle = {|
  scrollToRow: (row: number) => void,
  recomputeRowHeights: () => void,
  getScrollElement: () => ?HTMLDivElement,
|};

type SortableEventsTreeProps = {|
  treeData: Array<SortableTreeNode>,
  scaffoldBlockPxWidth: number,
  rowHeight: number | (({ node: ?SortableTreeNode }) => number),
  onVisibilityToggle: ({ node: SortableTreeNode }) => void,
  searchMethod?: ({|
    node: SortableTreeNode,
    searchQuery: any,
  |}) => boolean,
  searchQuery?: any,
  searchFocusOffset?: ?number,
  className?: string,
  height: number,
  width: number | string,
  canDrag?: boolean,
  onScroll?: ({|
    scrollTop: number,
    clientHeight: number,
    scrollHeight: number,
  |}) => void,
  scrollToAlignment?: 'auto' | 'smart' | 'center' | 'start' | 'end',
  overscanCount?: number,
  rowDirection?: 'ltr' | 'rtl',
|};

type RowData = {|
  rows: Array<FlatTreeRow>,
  scaffoldBlockPxWidth: number,
  rowHeight: number | (({ node: ?SortableTreeNode }) => number),
  onVisibilityToggle: ({ node: SortableTreeNode }) => void,
  canDrag: boolean,
  rowDirection: 'ltr' | 'rtl',
  matchIndexByRowIndex: Map<number, number>,
  searchFocusOffset: ?number,
|};

const buildScaffold = (
  lowerSiblingCounts: Array<number>,
  listIndex: number,
  scaffoldBlockPxWidth: number,
  rowDirectionClass: ?string
) => {
  const scaffoldBlockCount = lowerSiblingCounts.length;
  const scaffold = [];

  for (let i = 0; i < lowerSiblingCounts.length; i += 1) {
    const lowerSiblingCount = lowerSiblingCounts[i];
    let lineClass = '';
    if (lowerSiblingCount > 0) {
      if (listIndex === 0) {
        lineClass = 'rst__lineHalfHorizontalRight rst__lineHalfVerticalBottom';
      } else if (i === scaffoldBlockCount - 1) {
        lineClass = 'rst__lineHalfHorizontalRight rst__lineFullVertical';
      } else {
        lineClass = 'rst__lineFullVertical';
      }
    } else if (listIndex === 0) {
      lineClass = 'rst__lineHalfHorizontalRight';
    } else if (i === scaffoldBlockCount - 1) {
      lineClass = 'rst__lineHalfVerticalTop rst__lineHalfHorizontalRight';
    }

    scaffold.push(
      <div
        key={`scaffold_${i}`}
        style={{ width: scaffoldBlockPxWidth }}
        className={classNames(
          'rst__lineBlock',
          lineClass,
          rowDirectionClass || ''
        )}
      />
    );
  }

  return scaffold;
};

const TreeRow = ({
  index,
  style,
  data,
}: {|
  index: number,
  style: Object,
  data: RowData,
|}) => {
  const {
    rows,
    scaffoldBlockPxWidth,
    rowHeight,
    onVisibilityToggle,
    canDrag,
    rowDirection,
    matchIndexByRowIndex,
    searchFocusOffset,
  } = data;
  const row = rows[index];
  const { node, lowerSiblingCounts, path, treeIndex } = row;
  const rowDirectionClass = rowDirection === 'rtl' ? 'rst__rtl' : '';

  const calculatedRowHeight =
    typeof rowHeight === 'function' ? rowHeight({ node }) : rowHeight;
  const safeRowHeight = Math.max(1, calculatedRowHeight || 0);

  const matchIndex = matchIndexByRowIndex.get(index);
  const isSearchMatch = matchIndex !== undefined;
  const isSearchFocus =
    searchFocusOffset !== null &&
    searchFocusOffset !== undefined &&
    matchIndex === searchFocusOffset;

  const hasChildren =
    node.children &&
    typeof node.children !== 'function' &&
    node.children.length > 0;

  const buttonStyle =
    rowDirection === 'rtl'
      ? { right: -0.5 * scaffoldBlockPxWidth, left: 0 }
      : { left: -0.5 * scaffoldBlockPxWidth, right: 0 };

  const contentStyle =
    rowDirection === 'rtl'
      ? { right: scaffoldBlockPxWidth * lowerSiblingCounts.length }
      : { left: scaffoldBlockPxWidth * lowerSiblingCounts.length };

  const rowStyle = { ...style, width: '100%' };

  return (
    <div style={rowStyle}>
      <div
        className={classNames('rst__node', rowDirectionClass || '')}
        style={{ height: `${safeRowHeight}px` }}
      >
        {buildScaffold(
          lowerSiblingCounts,
          index,
          scaffoldBlockPxWidth,
          rowDirectionClass
        )}
        <div className="rst__nodeContent" style={contentStyle}>
          {hasChildren && (
            <div>
              <button
                type="button"
                aria-label={node.expanded ? 'Collapse' : 'Expand'}
                className={classNames(
                  node.expanded ? 'rst__collapseButton' : 'rst__expandButton',
                  rowDirectionClass || ''
                )}
                style={buttonStyle}
                onClick={() => onVisibilityToggle({ node })}
              />
              {node.expanded && (
                <div
                  style={{ width: scaffoldBlockPxWidth }}
                  className={classNames('rst__lineChildren', rowDirectionClass || '')}
                />
              )}
            </div>
          )}
          <div className={classNames('rst__rowWrapper', rowDirectionClass || '')}>
            <div
              className={classNames(
                'rst__row',
                isSearchMatch ? 'rst__rowSearchMatch' : '',
                isSearchFocus ? 'rst__rowSearchFocus' : '',
                rowDirectionClass || ''
              )}
            >
              <div
                className={classNames(
                  'rst__rowContents',
                  canDrag ? '' : 'rst__rowContentsDragDisabled',
                  rowDirectionClass || ''
                )}
              >
                <div
                  className={classNames(
                    'rst__rowLabel',
                    rowDirectionClass || ''
                  )}
                >
                  <span className="rst__rowTitle">
                    {typeof node.title === 'function'
                      ? node.title({ node })
                      : node.title}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InnerSortableEventsTree = (
  props: SortableEventsTreeProps,
  ref: React.Ref<SortableEventsTreeHandle>
) => {
  const {
    treeData,
    scaffoldBlockPxWidth,
    rowHeight,
    onVisibilityToggle,
    searchMethod,
    searchQuery,
    searchFocusOffset,
    className,
    height,
    width,
    canDrag = true,
    onScroll,
    scrollToAlignment = 'auto',
    overscanCount = 10,
    rowDirection = 'ltr',
  } = props;

  const rowDirectionClass = rowDirection === 'rtl' ? 'rst__rtl' : '';
  const listRef = React.useRef<?VariableSizeList>(null);
  const outerRef = React.useRef<?HTMLDivElement>(null);

  const rows = React.useMemo(
    () => getFlatDataFromTree({ treeData, ignoreCollapsed: true }),
    [treeData]
  );

  const { matchIndexByRowIndex, searchFocusRowIndex } = React.useMemo(() => {
    const matchIndexByRowIndex = new Map();
    let matchIndex = 0;
    let searchFocusRowIndex = null;
    const shouldSearch =
      !!searchMethod &&
      !!searchQuery &&
      (!Array.isArray(searchQuery) || searchQuery.length > 0);

    if (shouldSearch) {
      rows.forEach((row, index) => {
        const isMatch = searchMethod
          ? searchMethod({ node: row.node, searchQuery })
          : false;
        if (isMatch) {
          matchIndexByRowIndex.set(index, matchIndex);
          if (matchIndex === searchFocusOffset) {
            searchFocusRowIndex = index;
          }
          matchIndex += 1;
        }
      });
    }

    return { matchIndexByRowIndex, searchFocusRowIndex };
  }, [rows, searchMethod, searchQuery, searchFocusOffset]);

  React.useImperativeHandle(
    ref,
    () => ({
      scrollToRow: (row: number) => {
        if (!listRef.current || row < 0) return;
        listRef.current.scrollToItem(row, scrollToAlignment);
      },
      recomputeRowHeights: () => {
        if (!listRef.current) return;
        listRef.current.resetAfterIndex(0, true);
      },
      getScrollElement: () => outerRef.current,
    }),
    [scrollToAlignment]
  );

  React.useEffect(
    () => {
      if (searchFocusRowIndex !== null && searchFocusRowIndex !== undefined) {
        if (!listRef.current) return;
        listRef.current.scrollToItem(searchFocusRowIndex, scrollToAlignment);
      }
    },
    [searchFocusRowIndex, scrollToAlignment]
  );

  const handleScroll = React.useCallback(
    ({ scrollOffset }) => {
      if (!onScroll) return;
      const scrollElement = outerRef.current;
      onScroll({
        scrollTop: scrollOffset,
        clientHeight: scrollElement ? scrollElement.clientHeight : 0,
        scrollHeight: scrollElement ? scrollElement.scrollHeight : 0,
      });
    },
    [onScroll]
  );

  const getItemSize = React.useCallback(
    index => {
      const node = rows[index] ? rows[index].node : null;
      const height =
        typeof rowHeight === 'function'
          ? rowHeight({ node })
          : rowHeight || 0;
      return Math.max(1, height);
    },
    [rows, rowHeight]
  );

  const itemData: RowData = React.useMemo(
    () => ({
      rows,
      scaffoldBlockPxWidth,
      rowHeight,
      onVisibilityToggle,
      canDrag,
      rowDirection,
      matchIndexByRowIndex,
      searchFocusOffset,
    }),
    [
      rows,
      scaffoldBlockPxWidth,
      rowHeight,
      onVisibilityToggle,
      canDrag,
      rowDirection,
      matchIndexByRowIndex,
      searchFocusOffset,
    ]
  );

  return (
    <div
      dir={rowDirection === 'rtl' ? 'rtl' : 'ltr'}
      className={classNames('rst__tree', className || '', rowDirectionClass)}
      style={{ height, width }}
    >
      <VariableSizeList
        height={height}
        width={width}
        itemCount={rows.length}
        itemSize={getItemSize}
        itemKey={index => rows[index].node.key}
        // Flow does not seem to accept the generic used in VariableSizeList.
        // $FlowFixMe
        itemData={itemData}
        ref={listRef}
        outerRef={outerRef}
        className="rst__virtualScrollOverride"
        overscanCount={overscanCount}
        onScroll={handleScroll}
      >
        {TreeRow}
      </VariableSizeList>
    </div>
  );
};

type SortableEventsTreeComponent = (
  SortableEventsTreeProps & { +ref?: React.Ref<SortableEventsTreeHandle> }
) => React.Node;

// $FlowFixMe - forwardRef is not properly typed.
const SortableEventsTree: SortableEventsTreeComponent = (React.forwardRef(
  InnerSortableEventsTree
): any);

export default SortableEventsTree;
