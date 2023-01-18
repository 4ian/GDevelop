// @flow
import * as React from 'react';
import Paper from './Paper';

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
  children: React.Node,
  maxWidth?: boolean,
  width?: number | string,
  /** Sometimes required on Safari */
  noFullHeight?: boolean,
  noExpand?: boolean,
|};

/**
 * This is the component to be used to display the standard
 * background of editor/windows/dialogs.
 */
const Background = (props: Props) => (
  <Paper
    square
    style={{
      ...styles.container,
      height: props.noFullHeight ? undefined : '100%',
      width: props.width ? props.width : undefined,
      flex: props.noExpand ? undefined : 1,
      ...(props.maxWidth ? styles.maxWidth : undefined),
    }}
    background="dark"
  >
    {props.children}
  </Paper>
);

export default Background;
