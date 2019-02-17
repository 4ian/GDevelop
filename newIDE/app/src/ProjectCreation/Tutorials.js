import React, { PureComponent } from 'react';
import FlatButton from 'material-ui/FlatButton';
import { Column, Line } from '../UI/Grid';
import { sendTutorialOpened } from '../Utils/Analytics/EventSender';
import Window from '../Utils/Window';
import { getHelpLink } from '../Utils/HelpLink';
import { Trans } from '@lingui/macro';

export default class Tutorials extends PureComponent {
  render() {
    return (
      <Column noMargin>
        <Line>
          <Column>
            <p>
              <Trans>
                Tutorials are available on GDevelop wiki. Choose a tutorial to
                read:
              </Trans>
            </p>
          </Column>
        </Line>
        <Line>
          <Column expand noMargin>
            <FlatButton
              label={<Trans>Make a platform game from scratch</Trans>}
              fullWidth
              primary
              onClick={() => {
                sendTutorialOpened('Platformer');
                Window.openExternalURL(
                  getHelpLink('/tutorials/platform-game/start')
                );
              }}
            />
            <FlatButton
              label={
                <Trans>Make a simple tank shooter game from scratch</Trans>
              }
              fullWidth
              primary
              onClick={() => {
                sendTutorialOpened('Tank Shooter');
                Window.openExternalURL(getHelpLink('/tutorials/tank-shooter'));
              }}
            />
            <FlatButton
              label={<Trans>Other tutorials coming soon!</Trans>}
              fullWidth
              primary
              disabled
            />
          </Column>
        </Line>
      </Column>
    );
  }
}
