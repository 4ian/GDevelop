// @flow
import * as React from 'react';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';

const styles = {
  columnDropIndicator: {
    borderRight: '1px solid',
    borderLeft: '1px solid',
    width: 8,
    marginLeft: '-1px',
    height: '100%',
    boxSizing: 'border-box',
  },
};

export function ColumnDropIndicator() {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <div
      style={{
        ...styles.columnDropIndicator,
        backgroundColor: gdevelopTheme.dropIndicator.canDrop,
        borderColor: gdevelopTheme.dropIndicator.border,
      }}
    />
  );
}
