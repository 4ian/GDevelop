// @flow
import * as React from 'react';
import IconButton from '../IconButton';
import Cross from '../CustomSvgIcons/Cross';
import { MosaicWindowContext, MosaicContext } from 'react-mosaic-component';

const styles = {
  container: {
    padding: 0,
    width: 32,
    height: 32,
  },
  icon: {
    width: 16,
    height: 16,
  },
};

type Props = {||};

export default function CloseButton(props: Props) {
  const { mosaicActions } = React.useContext(MosaicContext);
  const { mosaicWindowActions } = React.useContext(MosaicWindowContext);

  return (
    <IconButton
      onClick={() => {
        mosaicActions.remove(mosaicWindowActions.getPath());
      }}
      style={styles.container}
    >
      <Cross htmlColor="inherit" style={styles.icon} />
    </IconButton>
  );
}
