// @flow
import * as React from 'react';
import GDevelopThemeContext from '../Theme/ThemeContext';

const styles = {
  dropIndicator: {
    borderTop: '2px solid black',
    height: 0,
    marginTop: '-1px',
    marginBottom: '-1px',
    width: '100%',
    boxSizing: 'border-box',
  },
};

export default function DropIndicator({ canDrop }: {| canDrop: boolean |}) {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <div
      style={{
        ...styles.dropIndicator,
        borderColor: canDrop
          ? gdevelopTheme.dropIndicator.canDrop
          : gdevelopTheme.dropIndicator.cannotDrop,
      }}
    />
  );
}
