// @flow
import * as React from 'react';
import MUITable from '@material-ui/core/Table';
import MUITableBody from '@material-ui/core/TableBody';
import MUITableCell from '@material-ui/core/TableCell';
import MUITableHead from '@material-ui/core/TableHead';
import MUITableRow from '@material-ui/core/TableRow';

type TableProps = {|
  children: React.Node, // Should be TableHeader, TableBody or TableFooter
|};

/**
 * A Table based on Material-UI Table.
 * See https://material-ui.com/components/tables/
 */
export class Table extends React.Component<TableProps, {||}> {
  render(): React.Node {
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
  render(): React.Node {
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
  render(): React.Node {
    return <MUITableHead {...this.props} />;
  }
}

type TableHeaderColumnProps = {|
  children?: React.Node, // Text of the column
  style?: {|
    textAlign: 'left' | 'right',
    paddingRight: number,
  |},
|};

/**
 * A TableHeaderColumn based on Material-UI TableCell.
 */
export class TableHeaderColumn extends React.Component<
  TableHeaderColumnProps,
  {||}
> {
  render(): React.Node {
    return <MUITableCell {...this.props} />;
  }
}

type TableRowProps = {|
  children: React.Node,
  style?: {|
    backgroundColor: string,
  |},
|};

/**
 * A TableRow based on Material-UI TableRow.
 */
export class TableRow extends React.Component<TableRowProps, {||}> {
  render(): React.Node {
    return <MUITableRow {...this.props} />;
  }
}

type TableRowColumnProps = {|
  children?: React.Node, // Content for the cell
  style?: {|
    width?: number,
    paddingLeft?: number,
    paddingRight?: number,
    textAlign?: string,
  |},
|};

/**
 * A TableRowColumn based on Material-UI TableRowColumn.
 */
export class TableRowColumn extends React.Component<TableRowColumnProps, {||}> {
  render(): React.Node {
    return <MUITableCell {...this.props} />;
  }
}
