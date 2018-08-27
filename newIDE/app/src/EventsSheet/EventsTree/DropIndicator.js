// @flow
import * as React from 'react';

const styles = {
  dropIndicator: {
    borderTop: '2px solid black',
    height: 0,
    marginTop: -1,
    marginBottom: -1,
    width: '100%',
    boxSizing: 'border-box',
  },
  cantDropIndicator: {
    borderTop: '2px solid #ffaaaa',
    height: 0,
    marginTop: -1,
    marginBottom: -1,
    width: '100%',
    boxSizing: 'border-box',
  },
};

export default function DropIndicator({ canDrop }: {| canDrop: boolean |}) {
  return (
    <div style={canDrop ? styles.dropIndicator : styles.cantDropIndicator} />
  );
}
