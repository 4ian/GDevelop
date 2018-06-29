import React from 'react';

const styles = {
  row: {
    display: 'flex',
  },
  cell: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    paddingLeft: 8,
    paddingRight: 8,
  },
};

export const TreeTable = props => <div>{props.children}</div>;

export const TreeTableRow = props => (
  <div style={{ ...styles.row, ...props.style }}>{props.children}</div>
);

export const TreeTableCell = props => (
  <div style={{ ...styles.cell, ...props.style }}>{props.children}</div>
);
