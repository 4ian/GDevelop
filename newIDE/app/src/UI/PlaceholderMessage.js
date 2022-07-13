// @flow
import * as React from 'react';
import Paper from '@material-ui/core/Paper';

type Props = {|
  children: React.Node,
|};

const PlaceholderMessage = (props: Props) => {
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
        elevation={3}
        style={{
          padding: 10,
          margin: 5,
        }}
      >
        {props.children}
      </Paper>
    </div>
  );
};

export default PlaceholderMessage;
