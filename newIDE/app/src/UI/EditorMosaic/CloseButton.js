import React, { Component } from 'react';
import IconButton from '../IconButton';
import Close from 'material-ui/svg-icons/navigation/close';
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
                <Close color="white" />
              </IconButton>
            )}
          </MosaicWindowContext.Consumer>
        )}
      </MosaicContext.Consumer>
    );
  }
}
