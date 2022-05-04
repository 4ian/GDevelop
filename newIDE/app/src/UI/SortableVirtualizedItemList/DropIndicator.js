// @flow
import * as React from 'react';
import ThemeConsumer from '../Theme/ThemeConsumer';

export const dropIndicatorColor = '#18dcf2'

const styles = {
  dropIndicator: {
    borderTop: `2px solid ${dropIndicatorColor}`,
    height: 0,
    marginTop: '-1px',
    marginBottom: '-1px',
    width: '100%',
    boxSizing: 'border-box',
  },
};

export default function DropIndicator({ canDrop }: {| canDrop: boolean |}) {
  return (
    <ThemeConsumer>
      {gdevelopTheme => (
        <div
          style={{
            ...styles.dropIndicator,
            borderColor: canDrop
              ? gdevelopTheme.listItem.selectedBackgroundColor
              : gdevelopTheme.listItem.selectedErrorBackgroundColor,
          }}
        />
      )}
    </ThemeConsumer>
  );
}
