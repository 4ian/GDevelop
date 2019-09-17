import React, { Component } from 'react';
import IconButton from '../IconButton';
import Close from '@material-ui/icons/Close';
import { MosaicWindowContext, MosaicContext } from 'react-mosaic-component';

const styles = {
  container: {
    padding: 0,
    width: 32,
    height: 32,
  },
};

export default class CloseButton extends Component {
  render() {
    return (
      <MosaicContext.Consumer>
        {({ mosaicActions }) => (
          <MosaicWindowContext.Consumer>
            {({ mosaicWindowActions }) => (
              <IconButton
                onClick={() => {
                  mosaicActions.remove(mosaicWindowActions.getPath());
                }}
                style={styles.container}
              >
                <Close htmlColor="white" />
              </IconButton>
            )}
          </MosaicWindowContext.Consumer>
        )}
      </MosaicContext.Consumer>
    );
  }
}
