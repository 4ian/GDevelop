// @flow
import * as React from 'react';
import MUITable from '@material-ui/core/Table';
import MUITableBody from '@material-ui/core/TableBody';
import MUITableCell from '@material-ui/core/TableCell';
import MUITableHead from '@material-ui/core/TableHead';
import MUITableRow from '@material-ui/core/TableRow';

type TableCellCommonProps = {|
  children?: React.Node, // Content for the cell
  style?: {|
    height?: number,
    width?: number | string,
    paddingLeft?: number,
    paddingRight?: number,
    textAlign?: string,
    wordBreak?: 'break-word',
  |},
|};

type TableProps = {|
  children: React.Node, // Should be TableHeader, TableBody or TableFooter
|};

/**
 * A Table based on Material-UI Table.
 * See https://material-ui.com/components/tables/
 */
export class Table extends React.Component<TableProps, {||}> {
  render() {
    return <MUITable size="small" {...this.props} />;
  }
}

type TableBodyProps = {|
  children?: React.Node, // Should be TableRow
|};

/**
 * A TableBody based on Material-UI TableBody.
 */
export class TableBody extends React.Component<TableBodyProps, {||}> {
  render() {
    return <MUITableBody {...this.props} />;
  }
}

type TableHeaderProps = {|
  children: React.Node, // Should be a TableRow
|};

/**
 * A TableHeader based on Material-UI TableHead.
 */
export class TableHeader extends React.Component<TableHeaderProps, {||}> {
  render() {
    return <MUITableHead {...this.props} />;
  }
}

type TableHeaderColumnProps = {|
  ...TableCellCommonProps,
  padding?: 'none',
|};

/**
 * A TableHeaderColumn based on Material-UI TableCell.
 */
export class TableHeaderColumn extends React.Component<
  TableHeaderColumnProps,
  {||}
> {
  render() {
    return <MUITableCell {...this.props} />;
  }
}

type TableRowProps = {|
  children: React.Node,
  style?: {|
    backgroundColor: string,
  |},
  onPointerEnter?: () => void,
  onPointerLeave?: () => void,
  onClick?: () => void,
|};

/**
 * A TableRow based on Material-UI TableRow.
 */
export class TableRow extends React.Component<TableRowProps, {||}> {
  render() {
    return <MUITableRow {...this.props} />;
  }
}

type TableRowColumnProps = {|
  ...TableCellCommonProps,
  padding?: 'none',
|};

/**
 * A TableRowColumn based on Material-UI TableRowColumn.
 */
export class TableRowColumn extends React.Component<TableRowColumnProps, {||}> {
  render() {
    return <MUITableCell {...this.props} />;
  }
}
