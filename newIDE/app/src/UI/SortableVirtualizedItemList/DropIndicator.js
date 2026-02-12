// @flow
import * as React from 'react';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';

const styles = {
  dropIndicator: {
    borderTop: '2px solid black',
    height: 0,
    marginTop: '-1px',
    marginBottom: '-1px',
    width: '100%',
    pointerEvents: 'none',
    boxSizing: 'border-box',
  },
};

type Props = {| canDrop: boolean, zIndex?: 1 |};

export default function DropIndicator({ canDrop, zIndex }: Props) {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  return (
    <div
      style={{
        ...styles.dropIndicator,
        borderColor: canDrop
          ? gdevelopTheme.dropIndicator.canDrop
          : gdevelopTheme.dropIndicator.cannotDrop,
        zIndex: zIndex || undefined,
      }}
    />
  );
}
