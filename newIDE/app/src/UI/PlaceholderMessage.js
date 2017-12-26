// @flow
import * as React from 'react';
import Paper from 'material-ui/Paper';

type Props = {|
  children: React.Node,
|};

export default (props: Props) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        zDepth={3}
        style={{
          padding: 10,
        }}
      >
        {props.children}
      </Paper>
    </div>
  );
};
