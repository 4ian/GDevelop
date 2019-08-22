// @flow
import * as React from 'react';
import Paper from 'material-ui/Paper';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
  },
  maxWidth: {
    maxWidth: '100%',
  },
};

type Props = {|
  children: ?React.Node,
  maxWidth?: boolean,
  width?: number | string,
  noFullHeight?: boolean,
  noExpand?: boolean,
|};

/**
 * This is the component to be used to display the standard
 * background of editor/windows/dialogs.
 *
 * TODO: All usage of material-ui Paper in other components should be
 * removed in favor of using this component.
 */
const Background = (props: Props) => (
  <Paper
    style={{
      ...styles.container,
      height: props.noFullHeight ? undefined : '100%',
      width: props.width ? props.width : undefined,
      flex: props.noExpand ? undefined : 1,
      ...(props.maxWidth ? styles.maxWidth : undefined),
    }}
  >
    {props.children}
  </Paper>
);

export default Background;
