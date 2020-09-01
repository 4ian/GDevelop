// @flow
import * as React from 'react';
import GDevelopThemeContext from '../Theme/ThemeContext';

const styles = {
  row: {
    display: 'flex',
  },
  cell: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: 4,
    paddingRight: 4,
  },
};

type TreeTableRowProps = {|
  children: React.Node,
|};

export const TreeTableRow = (props: TreeTableRowProps) => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);

  return (
    <div
      style={{
        ...styles.row,
        backgroundColor: gdevelopTheme.list.itemsBackgroundColor,
      }}
    >
      {props.children}
    </div>
  );
};

type TreeTableCellProps = {|
  style?: Object,
  expand?: boolean,
  children?: React.Node,
|};

export const TreeTableCell = (props: TreeTableCellProps) => (
  <div
    style={{
      ...styles.cell,
      flex: props.expand ? 1 : undefined,
      ...props.style,
    }}
  >
    {props.children}
  </div>
);
