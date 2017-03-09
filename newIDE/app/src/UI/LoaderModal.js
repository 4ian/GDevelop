import React from 'react';
import RefreshIndicator from 'material-ui/RefreshIndicator';

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
        zIndex: 1000,
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
          marginBottom: -loaderSize / 2,
          width: loaderSize,
          height: loaderSize,
        }}
      >
        <RefreshIndicator
          size={loaderSize}
          left={0}
          top={0}
          status={'loading'}
        />
      </div>
    </div>
  );
};
