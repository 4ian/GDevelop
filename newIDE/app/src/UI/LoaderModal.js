import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';

const loaderSize = 50;

export default props => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 2000, // 2000 is higher than any Material-UI modal
        pointerEvents: props.show ? 'cursor' : 'none',
        display: props.show ? 'block' : 'none',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          marginTop: -loaderSize / 2,
          marginLeft: -loaderSize / 2,
          width: loaderSize,
          height: loaderSize,
        }}
      >
        {props.show /* Don't render CircularProgress to avoid it to use a timeout that would wake regularly the CPU  */ && (
          <CircularProgress size={loaderSize} disableShrink />
        )}
      </div>
    </div>
  );
};
