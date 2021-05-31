// @flow
import * as React from 'react';
import ThemeConsumer from '../Theme/ThemeConsumer';

const styles = {
  dropIndicator: {
    borderTop: '2px solid #18dcf2',
    height: 0,
    marginTop: '-1px',
    marginBottom: '-1px',
    width: '100%',
    boxSizing: 'border-box',
  },
};

export default function DropIndicator({
  canDrop,
}: {|
  canDrop: boolean,
|}): React.Node {
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
