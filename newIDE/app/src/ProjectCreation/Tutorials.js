import React, { Component } from 'react';
import FlatButton from 'material-ui/FlatButton';
import { Column, Line } from '../UI/Grid';
import { sendTutorialOpened } from '../Utils/Analytics/EventSender';
import Window from '../Utils/Window';

export default class Tutorials extends Component {
  render() {
    return (
      <Column noMargin>
        <Line>
          <Column>
            <p>
              Tutorials are available on GDevelop wiki. Choose a tutorial to read:
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
                  'http://wiki.compilgames.net/doku.php/gdevelop5/tutorials/platform-game/start'
                );
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
