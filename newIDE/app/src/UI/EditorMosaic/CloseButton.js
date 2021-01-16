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
  icon: {
    width: 16,
    height: 16,
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
                  if (this.props.closeActions) this.props.closeActions();
                  mosaicActions.remove(mosaicWindowActions.getPath());
                }}
                style={styles.container}
              >
                <Close htmlColor="white" style={styles.icon} />
              </IconButton>
            )}
          </MosaicWindowContext.Consumer>
        )}
      </MosaicContext.Consumer>
    );
  }
}
