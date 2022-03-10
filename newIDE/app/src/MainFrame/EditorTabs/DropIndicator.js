// @flow
import * as React from 'react';
import ThemeConsumer from '../../UI/Theme/ThemeConsumer';

const styles = {
  columnDropIndicator: {
    borderRight: '1px solid #18dcf2',
    borderLeft: '1px solid #18dcf2',
    width: 7,
    marginLeft: '-1px',
    height: '100%',
    boxSizing: 'border-box',
  },
};

export function ColumnDropIndicator() {
  return (
    <ThemeConsumer>
      {gdevelopTheme => (
        <div
          style={{
            ...styles.columnDropIndicator,
            backgroundColor: gdevelopTheme.closableTabs.selectedBackgroundColor,
            borderColor: gdevelopTheme.closableTabs.backgroundColor,
          }}
        />
      )}
    </ThemeConsumer>
  );
}
