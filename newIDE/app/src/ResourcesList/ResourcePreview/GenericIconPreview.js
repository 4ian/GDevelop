// @flow
import * as React from 'react';

const styles = {
  previewContainer: {
    display: 'flex',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    border: '#AAAAAA 1px solid',
    background: 'url("res/transparentback.png") repeat',
  },
  icon: { width: 60, height: 60 },
};

type Props = {|
  renderIcon: ({| style: Object |}) => React.Node,
|};

/**
 * Display a generic container to display an icon.
 */
export default ({ renderIcon }: Props) => (
  <div style={styles.previewContainer}>
    {renderIcon({ style: styles.icon })}
  </div>
);
