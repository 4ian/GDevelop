import { Trans } from '@lingui/macro';
import React, { Component } from 'react';
import Dialog from '../UI/Dialog';
import Window from '../Utils/Window';
import FlatButton from '../UI/FlatButton';
import Text from '../UI/Text';
import { ResponsiveWindowMeasurer } from '../UI/Reponsive/ResponsiveWindowMeasurer';
import Fullscreen from '@material-ui/icons/Fullscreen';
import RaisedButton from '../UI/RaisedButton';
import { Spacer, Line } from '../UI/Grid';

export default class BetaIntroDialog extends Component {
  _onOpenWebsite() {
    Window.openExternalURL('http://gdevelop-app.com');
  }

  render() {
    const { open, onClose } = this.props;

    return (
      <ResponsiveWindowMeasurer>
        {windowWidth => (
          <Dialog
            title={<Trans>Welcome to GDevelop</Trans>}
            actions={[
              <FlatButton
                key="download"
                label={<Trans>Download GDevelop desktop app</Trans>}
                primary={false}
                onClick={this._onOpenWebsite}
              />,
              <FlatButton
                label={<Trans>Close</Trans>}
                primary={false}
                onClick={onClose}
                key="close"
              />,
            ]}
            cannotBeDismissed={false}
            open={open}
            onRequestClose={onClose}
          >
            <div>
              <Text>
                <Trans>
                  This is a version of GDevelop 5 that you can try online.
                </Trans>
              </Text>
              <Text>
                Choose a <b>new project to create</b>, then edit the scene or
                the events ruling the game. You can{' '}
                <b>launch a preview of your game</b> at any time.
              </Text>
              <Text>
                <Trans>
                  Download the full version of GDevelop on your desktop computer
                  to create your own game without limits!
                </Trans>
              </Text>
              {windowWidth === 'small' &&
                (!Window.isFullscreen() ? (
                  <React.Fragment>
                    <Spacer />
                    <Text>
                      <Trans>
                        You're working on a small screen. It's recommended to
                        activate Fullscreen Mode for using GDevelop.
                      </Trans>
                    </Text>
                    <Line justifyContent="center">
                      <RaisedButton
                        label={<Trans>Activate Fullscreen</Trans>}
                        primary
                        onClick={() => {
                          Window.requestFullscreen();
                          setTimeout(() => {
                            this.forceUpdate();
                          }, 250 /* Let a bit of time for the fullscreen to kick in */);
                        }}
                        icon={<Fullscreen />}
                      />
                    </Line>
                  </React.Fragment>
                ) : (
                  <Line justifyContent="center">
                    <RaisedButton
                      label={<Trans>Start using GDevelop</Trans>}
                      primary
                      onClick={onClose}
                    />
                  </Line>
                ))}
            </div>
          </Dialog>
        )}
      </ResponsiveWindowMeasurer>
    );
  }
}
