// @flow
import * as React from 'react';
import Paper from 'material-ui/Paper';

const styles = {
  container: {
    flex: 1,
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
  },
};

type Props = {|
  children: React.Node,
|};

/**
 * This is the component to be used to display the standard
 * background of editor/windows/dialogs.
 *
 * TODO: All usage of material-ui Paper in other components should be
 * removed in favor of using this component.
 */
const Background = (props: Props) => (
  <Paper style={styles.container}>{props.children}</Paper>
);

export default Background;
