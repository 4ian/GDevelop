import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import { Column, Line } from '../UI/Grid';
import { sendTutorialOpened } from '../Utils/Analytics/EventSender';
import Window from '../Utils/Window';
import { getHelpLink } from '../Utils/HelpLink';

export default class Tutorials extends Component {
  render() {
    return (
      <Column noMargin>
        <Line>
          <Column>
            <p>
              Tutorials are available on GDevelop wiki. Choose a tutorial to
              read:
            </p>
          </Column>
        </Line>
        <Line>
          <Column expand noMargin>
            <FlatButton
              label="Make a platform game from scratch"
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
              label="Make a simple tank shooter game from scratch"
              fullWidth
              primary
              onClick={() => {
                sendTutorialOpened('Tank Shooter');
                Window.openExternalURL(getHelpLink('/tutorials/tank-shooter'));
              }}
            />
            <FlatButton
              label="Other tutorials coming soon!"
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
