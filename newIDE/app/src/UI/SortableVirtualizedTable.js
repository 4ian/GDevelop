// @flow
import * as React from 'react';
import classNames from 'classnames';
import {
  AutoSizer,
  Column as RVColumn,
  Table as RVTable,
  SortDirection,
} from 'react-virtualized';
import { renderSortableHeader } from './VirtualizedTableSortableHeader';
import classes from './SortableVirtualizedTable.module.css';

export type TableSortDirection = 'ASC' | 'DESC';

/** Add to the `className` of a column holding numbers. */
export const numberCellClassName: string = classes.numberCell;

const HEADER_HEIGHT = 30;

/** The columns can be given in a fragment: the table needs them one by one. */
const unwrapFragment = (node: React.Node): React.Node =>
  React.isValidElement(node) && node.type === React.Fragment
    ? node.props.children
    : node;

/**
 * The column a table is sorted by, and in which direction. `onSort` is given
 * as `onSort` of `SortableVirtualizedTable` (or `sort` of a react-virtualized
 * `Table`).
 */
export function useTableSort<SortKey: string>(
  initialSortBy: SortKey,
  initialSortDirection: TableSortDirection = SortDirection.DESC
): {|
  sortBy: SortKey,
  sortDirection: TableSortDirection,
  onSort: ({| sortBy: SortKey, sortDirection: TableSortDirection |}) => void,
|} {
  const [sortBy, setSortBy] = React.useState<SortKey>(initialSortBy);
  const [sortDirection, setSortDirection] = React.useState<TableSortDirection>(
    initialSortDirection
  );
  const onSort = React.useCallback(
    ({
      sortBy: newSortBy,
      sortDirection: newSortDirection,
    }: {|
      sortBy: SortKey,
      sortDirection: TableSortDirection,
    |}) => {
      setSortBy(newSortBy);
      setSortDirection(newSortDirection);
    },
    []
  );
  return { sortBy, sortDirection, onSort };
}

type Props<Row> = {|
  rows: $ReadOnlyArray<Row>,
  rowHeight: number,
  sortBy: string,
  sortDirection: TableSortDirection,
  onSort: ({| sortBy: any, sortDirection: TableSortDirection |}) => void,
  /** Classes added to a row, on top of the stripes (or of the selection). */
  getRowClassName?: (row: Row, index: number) => ?string,
  isRowSelected?: (row: Row) => boolean,
  getRowStyle?: (row: Row) => Object,
  onRowClick?: (row: Row) => void,
  scrollToIndex?: number,
  /** Below this width, the table overflows instead of squeezing its columns. */
  minimumWidth?: number,
  /**
   * The react-virtualized `Column`s (in a fragment), given the width
   * available. The sortable ones get the header of the app (the label, and an
   * arrow when sorted).
   */
  children: (width: number) => React.Node,
|};

/**
 * A virtualized table sorted by clicking its headers, looking like the other
 * tables of the app (`gd-table`): striped rows, the selected row highlighted.
 * It takes the size of its parent, which must have one.
 */
function SortableVirtualizedTable<Row>({
  rows,
  rowHeight,
  sortBy,
  sortDirection,
  onSort,
  getRowClassName,
  isRowSelected,
  getRowStyle,
  onRowClick,
  scrollToIndex,
  minimumWidth,
  children,
}: Props<Row>): React.Node {
  return (
    <AutoSizer>
      {({ width, height }) => (
        <RVTable
          width={minimumWidth ? Math.max(width, minimumWidth) : width}
          height={height}
          headerHeight={HEADER_HEIGHT}
          rowHeight={rowHeight}
          rowCount={rows.length}
          rowGetter={({ index }) => rows[index]}
          sort={onSort}
          sortBy={sortBy}
          sortDirection={sortDirection}
          className="gd-table"
          headerClassName="tableHeaderColumn"
          headerStyle={{
            backgroundColor: 'var(--table-header-background-color)',
          }}
          rowClassName={({ index }) => {
            if (index < 0) return 'tableHeaderRow';
            const row = rows[index];
            return classNames(
              isRowSelected && isRowSelected(row)
                ? 'tableSelectedRow'
                : index % 2 === 0
                ? 'tableEvenRow'
                : 'tableOddRow',
              getRowClassName ? getRowClassName(row, index) : null
            );
          }}
          rowStyle={
            getRowStyle
              ? ({ index }) => (index < 0 ? {} : getRowStyle(rows[index]))
              : undefined
          }
          onRowClick={
            onRowClick ? ({ rowData }) => onRowClick(rowData) : undefined
          }
          scrollToIndex={scrollToIndex}
        >
          {React.Children.map(unwrapFragment(children(width)), column =>
            column &&
            !column.props.disableSort &&
            // A column always has a header renderer: the default one of
            // react-virtualized, unless another one was given.
            column.props.headerRenderer === RVColumn.defaultProps.headerRenderer
              ? React.cloneElement(column, {
                  headerRenderer: renderSortableHeader,
                })
              : column
          )}
        </RVTable>
      )}
    </AutoSizer>
  );
}

export default SortableVirtualizedTable;
