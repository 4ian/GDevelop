import React from 'react';
import Paper from 'material-ui/Paper';

export default (props) => {
  const width = props.width || 250;
  const xOffset = props.open ? 0 : -width;

  return (
    <Paper
      style={{
        width,
        zIndex: 1,
        display: 'flex',
        position: 'absolute',
        top: 10,
        bottom: 10,

        paddingLeft: 10,
        left: -10,

        transition: 'transform 0.2s ease-in-out 0ms',
        transform: `translate3d(${xOffset}px, 0px, 0px)`
      }}
      transitionEnabled={false}
      open={props.open}
      zDepth={2}
    >
      { props.children }
    </Paper>
  );
}
