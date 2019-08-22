// @flow
import * as React from 'react';
import {
  Table as MUITable,
  TableBody as MUITableBody,
  TableHeader as MUITableHeader,
  TableHeaderColumn as MUITableHeaderColumn,
  TableRow as MUITableRow,
  TableRowColumn as MUITableRowColumn,
} from 'material-ui/Table';

// We support a subset of the props supported by Material-UI v0.x Table
// They should be self descriptive - refer to Material UI docs otherwise.
type TableProps = {|
  selectable?: boolean,
  children: React.Node, // Should be TableHeader, TableBody or TableFooter
|};

/**
 * A Table based on Material-UI Table.
 */
export class Table extends React.Component<TableProps, {||}> {
  static muiName = 'Table';
  render() {
    return <MUITable {...this.props} />;
  }
}

// We support a subset of the props supported by Material-UI v0.x TableBodyProps
// They should be self descriptive - refer to Material UI docs otherwise.
type TableBodyProps = {|
  displayRowCheckbox?: boolean,
  deselectOnClickaway?: boolean,
  showRowHover?: boolean,
  children?: React.Node, // Should be TableRow
|};

/**
 * A TableBody based on Material-UI TableBody.
 */
export class TableBody extends React.Component<TableBodyProps, {||}> {
  // Set muiName to let Material-UI's v0.x Table recognise
  // the component.
  static muiName = 'TableBody';
  render() {
    return <MUITableBody {...this.props} />;
  }
}

// We support a subset of the props supported by Material-UI v0.x TableHeaderProps
// They should be self descriptive - refer to Material UI docs otherwise.
type TableHeaderProps = {|
  adjustForCheckbox?: boolean,
  displaySelectAll?: boolean,
  children: React.Node, // Should be a TableRow
|};

/**
 * A TableHeader based on Material-UI TableHeader.
 */
export class TableHeader extends React.Component<TableHeaderProps, {||}> {
  // Set muiName to let Material-UI's v0.x Table recognise
  // the component.
  static muiName = 'TableHeader';
  render() {
    return <MUITableHeader {...this.props} />;
  }
}

// We support a subset of the props supported by Material-UI v0.x TableHeaderColumnProps
// They should be self descriptive - refer to Material UI docs otherwise.
type TableHeaderColumnProps = {|
  children?: React.Node, // Text of the column
  style?: {|
    textAlign: 'left' | 'right',
    paddingRight: number,
  |},
|};

/**
 * A TableHeaderColumn based on Material-UI TableHeaderColumn.
 */
export class TableHeaderColumn extends React.Component<
  TableHeaderColumnProps,
  {||}
> {
  // Set muiName to let Material-UI's v0.x TableHeader recognise
  // the component.
  static muiName = 'TableHeaderColumn';
  render() {
    return <MUITableHeaderColumn {...this.props} />;
  }
}

// We support a subset of the props supported by Material-UI v0.x TableRow
// They should be self descriptive - refer to Material UI docs otherwise.
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
  // Set muiName to let Material-UI's v0.x TableBody recognise
  // the component.
  static muiName = 'TableRow';
  render() {
    return <MUITableRow {...this.props} />;
  }
}

// We support a subset of the props supported by Material-UI v0.x TableRow
// They should be self descriptive - refer to Material UI docs otherwise.
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
  // Set muiName to let Material-UI's v0.x TableBody recognise
  // the component.
  static muiName = 'TableRowColumn';
  render() {
    return <MUITableRowColumn {...this.props} />;
  }
}
